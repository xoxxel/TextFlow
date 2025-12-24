/***** CONFIG *****/
const SHEET_ID   = '1tYYH6jheUyyGtbPewPpGlptTZR-zW0zU-R9Opak5qHI';
const SHEET_NAME = 'dictionery';   // B=from , C=to  (C می‌تواند چند گزینه با / داشته باشد)
const FROM_COL   = 2; // B
const TO_COL     = 3; // C
const MIN_FROM_LEN = 2; // حداقل طول from برای پرهیز از کلمات بسیار کوتاه
/*******************/

function onOpen() {
  DocumentApp.getUi()
    .createMenu('🔤 Nons Dictionary')
    .addItem('جایگزینی امن (حفظ استایل/چینش)', 'safeReplaceFromSheet')
    .addSeparator()
    .addItem('پیش‌نمایش شمارش (همان منطق مرز)', 'previewCounts')
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

/** خواندن شیت و انتخاب تصادفی از to
 * خروجی: [{from, to}] مرتب‌شده بر اساس طول from (نزولی)
 */
function readDictionaryObjects() {
  const sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  if (!sh) throw new Error('Sheet "' + SHEET_NAME + '" not found.');
  const last = sh.getLastRow();
  if (last < 2) return [];

  const values = sh.getRange(2, FROM_COL, last - 1, 2).getValues();
  const rows = [];

  values.forEach(([fromRaw, toRaw]) => {
    if (!fromRaw || !toRaw) return;
    const from = normalizeFa(fromRaw);
    const options = String(toRaw).split('/').map(s => normalizeFa(s)).filter(Boolean);
    if (!from || from.length < MIN_FROM_LEN || options.length === 0) return;
    const pick = options[Math.floor(Math.random() * options.length)];
    rows.push({ from, to: pick });
  });

  // عبارات بلندتر اول
  rows.sort((a, b) => b.from.length - a.from.length);
  return rows;
}

/* -------------------- Replace IN-PLACE (preserve styles & alignment) -------------------- */
/* -------------------- Replace IN-PLACE (preserve styles & alignment) -------------------- */
function safeReplaceFromSheet() {
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
