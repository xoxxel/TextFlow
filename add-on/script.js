/***** CONFIG *****/
const API_URL = 'http://localhost:3000/api/dictionary'; // آدرس API سرور
const MIN_FROM_LEN = 2; // حداقل طول from برای پرهیز از کلمات بسیار کوتاه
/*******************/

function onOpen() {
  DocumentApp.getUi()
    .createMenu('🔤 Humanize Text')
    .addItem('جایگزینی امن (حفظ استایل/چینش)', 'safeReplaceFromAPI')
    .addSeparator()
    .addItem('پیش‌نمایش شمارش (همان منطق مرز)', 'previewCounts')
    .addSeparator()
    .addItem('افزودن کلمه جدید', 'showAddWordDialog')
    .addToUi();
}

/* -------------------- Helpers -------------------- */
function normalizeFa(s) {
  if (!s) return s;
  return String(s)
    .replace(/\u064A/g, '\u06CC') // ي -> ی
    .replace(/\u0643/g, '\u06A9') // ك -> ک
    .replace(/\u0640/g, '')       // ـ
    .trim();
}

function escForFindText_(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// تعریف «حرف داخل واژه» (لاتین/عدد/_ و فارسی)
function isWordChar_(ch){
  if (!ch) return false;               // ابتدای/انتهای element = مرز
  if (/[A-Za-z0-9_]/.test(ch)) return true;
  const code = ch.charCodeAt(0);
  return (code >= 0x0600 && code <= 0x06FF);
}
// مرز = هر چیزی که «حرف داخل واژه» نباشد
function isWordBoundary_(ch){ return !isWordChar_(ch); }

/** خواندن دیکشنری از API و انتخاب تصادفی از to
 * خروجی: [{from, to}] مرتب‌شده بر اساس طول from (نزولی)
 */
function readDictionaryObjects() {
  try {
    const response = UrlFetchApp.fetch(API_URL);
    const dictionary = JSON.parse(response.getContentText());
    const rows = [];

    dictionary.forEach(item => {
      if (!item.from || !item.to) return;
      const from = normalizeFa(item.from);
      const options = String(item.to).split('/').map(s => normalizeFa(s)).filter(Boolean);
      if (!from || from.length < MIN_FROM_LEN || options.length === 0) return;
      const pick = options[Math.floor(Math.random() * options.length)];
      rows.push({ from, to: pick });
    });

    // عبارات بلندتر اول
    rows.sort((a, b) => b.from.length - a.from.length);
    return rows;
  } catch (e) {
    DocumentApp.getUi().alert('❌ خطا در اتصال به API:\n' + e.message);
    return [];
  }
}

/* -------------------- Replace IN-PLACE (preserve styles & alignment) -------------------- */
function safeReplaceFromAPI() {
  const dict = readDictionaryObjects();
  const body = DocumentApp.getActiveDocument().getBody();

  let touched = 0;

  dict.forEach(({ from, to }) => {
    // جستجو با الگوی literal؛ مرز را دستی چک می‌کنیم
    let range = null;
    const needle = escForFindText_(from);

    while (true) {
      range = body.findText(needle, range);
      if (!range) break;

      const el = range.getElement();
      if (!el || el.getType() !== DocumentApp.ElementType.TEXT) continue;

      const textEl = el.asText();
      const start  = range.getStartOffset();
      const end    = range.getEndOffsetInclusive(); // ⬅️ تصحیح: به‌جای getEndOffset()

      const full   = textEl.getText();
      const beforeChar = (start > 0) ? full.charAt(start - 1) : null;
      const afterChar  = (end < full.length - 1) ? full.charAt(end + 1) : null;

      if (!isWordBoundary_(beforeChar) || !isWordBoundary_(afterChar)) {
        // مرز نبود → رد
        continue;
      }

      // استایل کاراکتر اول match
      const attrs = textEl.getAttributes(start);

      // حذف محدوده و درج متن جدید
      textEl.deleteText(start, end);      // end «inclusive» است
      textEl.insertText(start, to);

      if (to.length > 0) {
        textEl.setAttributes(start, start + to.length - 1, attrs);
      }

      touched++;
      // ادامه جستجو از بعدِ درج فعلی به‌طور خودکار توسط findText مدیریت می‌شود
    }
  });

  DocumentApp.getUi().alert('✅ جایگزینی انجام شد. قطعات تغییر کرده: ' + touched);
}

/* -------------------- Preview (approx count using boundaries) -------------------- */
function previewCounts() {
  const dict = readDictionaryObjects();
  const text = DocumentApp.getActiveDocument().getBody().getText();

  let report = 'پیش‌نمایش (مرز کامل + طول‌محور):\n';
  let hits = 0;

  dict.forEach(({ from }) => {
    // شمارش تقریبی: با regex ساده (مرز = غیرحرفی/ابتدا/انتها)
    // فقط برای نمایش؛ اجرای اصلی با in-place انجام می‌شود
    const WORD_INNER = 'A-Za-z0-9_\\u0600-\\u06FF';
    const before = '(^|[^' + WORD_INNER + '])';
    const after  = '($|[^' + WORD_INNER + '])';
    try {
      const re = new RegExp(before + '(' + from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')' + after, 'g');
      const m = text.match(re);
      const count = m ? m.length : 0;
      if (count > 0) { report += `• ${from} → ${count}\n`; hits += count; }
    } catch(e) {
      // اگر عبارتی خیلی خاص بود و خطا داد، در اجرا باز هم با in-place بررسی می‌شود
    }
  });

  if (hits === 0) report += 'موردی یافت نشد.';
  DocumentApp.getUi().alert(report);
}

/* -------------------- افزودن کلمه جدید -------------------- */
function showAddWordDialog() {
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          body { font-family: Tahoma, Arial; padding: 20px; direction: rtl; }
          input, textarea { width: 100%; padding: 8px; margin: 10px 0; font-size: 14px; }
          button { background: #4CAF50; color: white; padding: 10px 20px; border: none; cursor: pointer; font-size: 14px; }
          button:hover { background: #45a049; }
          .error { color: red; margin-top: 10px; }
          .success { color: green; margin-top: 10px; }
        </style>
      </head>
      <body>
        <h3>افزودن کلمه جدید به دیکشنری</h3>
        <label>کلمه مبدا (from):</label>
        <input type="text" id="from" placeholder="مثال: در نهایت">
        
        <label>کلمه مقصد (to):</label>
        <textarea id="to" rows="2" placeholder="مثال: آخرش / در نهایت"></textarea>
        
        <button onclick="addWord()">افزودن</button>
        <div id="message"></div>
        
        <script>
          function addWord() {
            const from = document.getElementById('from').value.trim();
            const to = document.getElementById('to').value.trim();
            
            if (!from || !to) {
              document.getElementById('message').innerHTML = '<p class="error">لطفاً هر دو فیلد را پر کنید</p>';
              return;
            }
            
            google.script.run
              .withSuccessHandler(onSuccess)
              .withFailureHandler(onError)
              .addWordToAPI(from, to);
          }
          
          function onSuccess(result) {
            if (result.success) {
              document.getElementById('message').innerHTML = '<p class="success">' + result.message + '</p>';
              document.getElementById('from').value = '';
              document.getElementById('to').value = '';
            } else {
              document.getElementById('message').innerHTML = '<p class="error">' + result.error + '</p>';
            }
          }
          
          function onError(error) {
            document.getElementById('message').innerHTML = '<p class="error">خطا: ' + error.message + '</p>';
          }
        </script>
      </body>
    </html>
  `)
    .setWidth(400)
    .setHeight(300);
  
  DocumentApp.getUi().showModalDialog(html, 'افزودن کلمه جدید');
}

function addWordToAPI(from, to) {
  try {
    const payload = JSON.stringify({ from: from, to: to });
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: payload,
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(API_URL, options);
    const result = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200) {
      return { success: true, message: result.message || 'کلمه با موفقیت اضافه شد' };
    } else {
      return { success: false, error: result.error || 'خطا در افزودن کلمه' };
    }
  } catch (e) {
    return { success: false, error: 'خطا در اتصال به API: ' + e.message };
  }
}
