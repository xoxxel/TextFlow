/***** CONFIG *****/
const API_URL = 'http://localhost:3000/api/dictionary'; // API server address
const MIN_FROM_LEN = 2; // Minimum 'from' length to avoid very short words
let CURRENT_LANG = 'en'; // Default language: "en" (English), "fa" (Persian), "es" (Spanish), "pt" (Portuguese)
/*******************/

function onOpen() {
  const ui = DocumentApp.getUi();
  
  // Main menu
  const menu = ui.createMenu('🔤 Humanize Text');
  
  // Language selection submenu
  const langMenu = ui.createMenu('🌍 Language');
  langMenu.addItem('🇮🇷 فارسی', 'setLanguageFa');
  langMenu.addItem('🇺🇸 English', 'setLanguageEn');
  langMenu.addItem('🇪🇸 Español', 'setLanguageEs');
  langMenu.addItem('🇵🇹 Português', 'setLanguagePt');
  
  menu.addSubMenu(langMenu);
  menu.addSeparator();
  menu.addItem('Safe Replace (Preserve Styles)', 'safeReplaceFromAPI');
  menu.addItem('Preview Counts (Word Boundaries)', 'previewCounts');
  menu.addSeparator();
  menu.addItem('Add New Word', 'showAddWordDialog');
  menu.addToUi();
}

// Language setting functions
function setLanguageFa() {
  CURRENT_LANG = 'fa';
  PropertiesService.getDocumentProperties().setProperty('LANGUAGE', 'fa');
  DocumentApp.getUi().alert('✅ Language changed to Persian');
}

function setLanguageEn() {
  CURRENT_LANG = 'en';
  PropertiesService.getDocumentProperties().setProperty('LANGUAGE', 'en');
  DocumentApp.getUi().alert('✅ Language changed to English');
}

function setLanguageEs() {
  CURRENT_LANG = 'es';
  PropertiesService.getDocumentProperties().setProperty('LANGUAGE', 'es');
  DocumentApp.getUi().alert('✅ Idioma cambiado a Español');
}

function setLanguagePt() {
  CURRENT_LANG = 'pt';
  PropertiesService.getDocumentProperties().setProperty('LANGUAGE', 'pt');
  DocumentApp.getUi().alert('✅ Idioma alterado para Português');
}

// Get current language
function getCurrentLanguage() {
  const stored = PropertiesService.getDocumentProperties().getProperty('LANGUAGE');
  return stored || 'fa';
}

/* -------------------- Helpers -------------------- */
function normalizeFa(s) {
  if (!s) return s;
  return String(s)
    .replace(/\u064A/g, '\u06CC') // Arabic yeh -> Persian yeh
    .replace(/\u0643/g, '\u06A9') // Arabic kaf -> Persian kaf
    .replace(/\u0640/g, '')       // Remove tatweel
    .trim();
}

function escForFindText_(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Define "word character" (Latin/digit/_ and Persian)
function isWordChar_(ch){
  if (!ch) return false;               // Start/end of element = boundary
  if (/[A-Za-z0-9_]/.test(ch)) return true;
  const code = ch.charCodeAt(0);
  return (code >= 0x0600 && code <= 0x06FF);
}
// Boundary = anything that is not a "word character"
function isWordBoundary_(ch){ return !isWordChar_(ch); }

/** Read dictionary from API and randomly select from 'to' options
 * Output: [{from, to}] sorted by 'from' length (descending)
 */
function readDictionaryObjects() {
  try {
    const lang = getCurrentLanguage();
    const url = API_URL + '?lang=' + lang;
    const response = UrlFetchApp.fetch(url);
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

    // Longer phrases first
    rows.sort((a, b) => b.from.length - a.from.length);
    return rows;
  } catch (e) {
    DocumentApp.getUi().alert('❌ API Connection Error:\n' + e.message);
    return [];
  }
}

/* -------------------- Replace IN-PLACE (preserve styles & alignment) -------------------- */
function safeReplaceFromAPI() {
  const dict = readDictionaryObjects();
  const body = DocumentApp.getActiveDocument().getBody();

  let touched = 0;

  dict.forEach(({ from, to }) => {
    // Search with literal pattern; check boundaries manually
    let range = null;
    const needle = escForFindText_(from);

    while (true) {
      range = body.findText(needle, range);
      if (!range) break;

      const el = range.getElement();
      if (!el || el.getType() !== DocumentApp.ElementType.TEXT) continue;

      const textEl = el.asText();
      const start  = range.getStartOffset();
      const end    = range.getEndOffsetInclusive();

      const full   = textEl.getText();
      const beforeChar = (start > 0) ? full.charAt(start - 1) : null;
      const afterChar  = (end < full.length - 1) ? full.charAt(end + 1) : null;

      if (!isWordBoundary_(beforeChar) || !isWordBoundary_(afterChar)) {
        // Not at word boundary → skip
        continue;
      }

      // Style of first character in match
      const attrs = textEl.getAttributes(start);

      // Delete range and insert new text
      textEl.deleteText(start, end);
      textEl.insertText(start, to);

      if (to.length > 0) {
        textEl.setAttributes(start, start + to.length - 1, attrs);
      }

      touched++;
    }
  });

  DocumentApp.getUi().alert('✅ Replacement completed. Items changed: ' + touched);
}

/* -------------------- Preview (approx count using boundaries) -------------------- */
function previewCounts() {
  const dict = readDictionaryObjects();
  const text = DocumentApp.getActiveDocument().getBody().getText();

  let report = 'Preview (Full Boundaries + Length-Based):\n';
  let hits = 0;

  dict.forEach(({ from }) => {
    // Approximate count: simple regex (boundary = non-letter/start/end)
    const WORD_INNER = 'A-Za-z0-9_\\u0600-\\u06FF';
    const before = '(^|[^' + WORD_INNER + '])';
    const after  = '($|[^' + WORD_INNER + '])';
    try {
      const re = new RegExp(before + '(' + from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')' + after, 'g');
      const m = text.match(re);
      const count = m ? m.length : 0;
      if (count > 0) { report += `• ${from} → ${count}\n`; hits += count; }
    } catch(e) {
      // If a phrase is very special and causes an error, it will still be checked during in-place execution
    }
  });

  if (hits === 0) report += 'No matches found.';
  DocumentApp.getUi().alert(report);
}

/* -------------------- Add New Word -------------------- */
function showAddWordDialog() {
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
      <head>
        <base target="_top">
        <style>
          body { font-family: Tahoma, Arial; padding: 20px; direction: ltr; }
          input, textarea { width: 100%; padding: 8px; margin: 10px 0; font-size: 14px; }
          button { background: #4CAF50; color: white; padding: 10px 20px; border: none; cursor: pointer; font-size: 14px; }
          button:hover { background: #45a049; }
          .error { color: red; margin-top: 10px; }
          .success { color: green; margin-top: 10px; }
        </style>
      </head>
      <body>
        <h3>Add New Word to Dictionary</h3>
        <label>Source phrase (from):</label>
        <input type="text" id="from" placeholder="Example: in order to">
        
        <label>Target phrase (to):</label>
        <textarea id="to" rows="2" placeholder="Example: to / so that"></textarea>
        
        <button onclick="addWord()">Add</button>
        <div id="message"></div>
        
        <script>
          function addWord() {
            const from = document.getElementById('from').value.trim();
            const to = document.getElementById('to').value.trim();
            
            if (!from || !to) {
              document.getElementById('message').innerHTML = '<p class="error">Please fill both fields</p>';
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
            document.getElementById('message').innerHTML = '<p class="error">Error: ' + error.message + '</p>';
          }
        </script>
      </body>
    </html>
  `)
    .setWidth(400)
    .setHeight(300);
  
  DocumentApp.getUi().showModalDialog(html, 'Add New Word');
}

function addWordToAPI(from, to) {
  try {
    const lang = getCurrentLanguage();
    const payload = JSON.stringify({ from: from, to: to, lang: lang });
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: payload,
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(API_URL, options);
    const result = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() === 200) {
      return { success: true, message: result.message || 'Word added successfully' };
    } else {
      return { success: false, error: result.error || 'Error adding word' };
    }
  } catch (e) {
    return { success: false, error: 'API connection error: ' + e.message };
  }
}
