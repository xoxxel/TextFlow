/***** CONFIG *****/
const SHEET_ID   = '1tYYH6jheUyyGtbPewPpGlptTZR-zW0zU-R9Opak5qHI';
const SHEET_NAME = 'dictionery';   // B=from , C=to  (C can have multiple options separated by /)
const FROM_COL   = 2; // B
const TO_COL     = 3; // C
const MIN_FROM_LEN = 2; // Minimum length of "from" to avoid very short words
/*******************/

function onOpen() {
  DocumentApp.getUi()
    .createMenu('🔤 Humanize Text')
    .addItem('Safe Replace (Preserve Style/Alignment)', 'safeReplaceFromSheet')
    .addSeparator()
    .addItem('Preview Count (Same Boundary Logic)', 'previewCounts')
    .addToUi();
}

/* -------------------- Helpers -------------------- */
function normalizeText(s) {
  if (!s) return s;
  let normalized = String(s).trim();
  
  // Persian-specific normalization (only affects Persian text)
  normalized = normalized
    .replace(/\u064A/g, '\u06CC') // Arabic yeh -> Persian yeh (ي -> ی)
    .replace(/\u0643/g, '\u06A9') // Arabic kaf -> Persian kaf (ك -> ک)
    .replace(/\u0640/g, '');      // Remove tatweel (ـ)
  
  return normalized;
}

function escForFindText_(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// Define "word character" (Latin/number/_ and Persian)
function isWordChar_(ch){
  if (!ch) return false;               // Start/end of element = boundary
  if (/[A-Za-z0-9_]/.test(ch)) return true;
  const code = ch.charCodeAt(0);
  return (code >= 0x0600 && code <= 0x06FF);
}
// Boundary = anything that is not a "word character"
function isWordBoundary_(ch){ return !isWordChar_(ch); }

/** Read sheet and randomly select from "to"
 * Output: [{from, to}] sorted by length of "from" (descending)
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
    const from = normalizeText(fromRaw);
    const options = String(toRaw).split('/').map(s => normalizeText(s)).filter(Boolean);
    if (!from || from.length < MIN_FROM_LEN || options.length === 0) return;
    const pick = options[Math.floor(Math.random() * options.length)];
    rows.push({ from, to: pick });
  });

  // Longer phrases first
  rows.sort((a, b) => b.from.length - a.from.length);
  return rows;
}

/* -------------------- Replace IN-PLACE (preserve styles & alignment) -------------------- */
function safeReplaceFromSheet() {
  const dict = readDictionaryObjects();
  const body = DocumentApp.getActiveDocument().getBody();

  let touched = 0;

  dict.forEach(({ from, to }) => {
    // Search with literal pattern; manually check boundaries
    let range = null;
    const needle = escForFindText_(from);

    while (true) {
      range = body.findText(needle, range);
      if (!range) break;

      const el = range.getElement();
      if (!el || el.getType() !== DocumentApp.ElementType.TEXT) continue;

      const textEl = el.asText();
      const start  = range.getStartOffset();
      const end    = range.getEndOffsetInclusive(); // ⬅️ Correction: use getEndOffsetInclusive()

      const full   = textEl.getText();
      const beforeChar = (start > 0) ? full.charAt(start - 1) : null;
      const afterChar  = (end < full.length - 1) ? full.charAt(end + 1) : null;

      if (!isWordBoundary_(beforeChar) || !isWordBoundary_(afterChar)) {
        // Not a boundary → skip
        continue;
      }

      // Style of the first character of match
      const attrs = textEl.getAttributes(start);

      // Delete range and insert new text
      textEl.deleteText(start, end);      // end is "inclusive"
      textEl.insertText(start, to);

      if (to.length > 0) {
        textEl.setAttributes(start, start + to.length - 1, attrs);
      }

      touched++;
      // Continue search after current insert is automatically managed by findText
    }
  });

  DocumentApp.getUi().alert('✅ Replacement done. Changed segments: ' + touched);
}

/* -------------------- Preview (approx count using boundaries) -------------------- */
function previewCounts() {
  const dict = readDictionaryObjects();
  const text = DocumentApp.getActiveDocument().getBody().getText();

  let report = 'Preview (Full Boundary + Length-based):\n';
  let hits = 0;

  dict.forEach(({ from }) => {
    // Approximate count: with simple regex (boundary = non-word/start/end)
    // For display only; main execution is in-place
    const WORD_INNER = 'A-Za-z0-9_\\u0600-\\u06FF';
    const before = '(^|[^' + WORD_INNER + '])';
    const after  = '($|[^' + WORD_INNER + '])';
    try {
      const re = new RegExp(before + '(' + from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')' + after, 'g');
      const m = text.match(re);
      const count = m ? m.length : 0;
      if (count > 0) { report += `• ${from} → ${count}\n`; hits += count; }
    } catch(e) {
      // If a phrase is too special and throws, it will still be checked in main in-place execution
    }
  });

  if (hits === 0) report += 'No matches found.';
  DocumentApp.getUi().alert(report);
}
