/**
 * TextFlow - Google Docs Add-on
 * 
 * Transform formal text into natural language using custom dictionaries.
 * Supports multiple languages and community-driven phrase collections.
 * 
 * Setup:
 * 1. Copy this code to Google Apps Script (Extensions → Apps Script)
 * 2. Configure API_BASE_URL and DEFAULT_LANG
 * 3. Save and refresh your document
 * 4. Use TextFlow menu to transform text
 * 
 * GitHub: https://github.com/xoxxel/TextFlow
 */

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = 'http://localhost:3000/api'; // Change to your server URL
const DEFAULT_LANG = 'en'; // Default language: en, fa, es, pt
const DEFAULT_DICTIONARY_ID = null; // Set your custom dictionary ID or leave null for global

// ============================================
// MENU & UI
// ============================================

function onOpen() {
  DocumentApp.getUi()
    .createMenu('🔄 TextFlow')
    .addItem('✨ Transform All Text', 'transformAllText')
    .addItem('🔍 Transform Selection', 'transformSelection')
    .addSeparator()
    .addItem('📚 Choose Dictionary', 'showDictionaryPicker')
    .addItem('🌍 Change Language', 'showLanguagePicker')
    .addSeparator()
    .addItem('👀 Preview Changes', 'previewChanges')
    .addItem('📊 Show Statistics', 'showStatistics')
    .addSeparator()
    .addItem('➕ Add New Phrase', 'showAddPhraseDialog')
    .addItem('⚙️ Settings', 'showSettings')
    .addToUi();
}

// ============================================
// CORE TRANSFORMATION
// ============================================

/**
 * Transform all text in document
 */
function transformAllText() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const text = body.getText();
  
  if (!text || text.trim().length === 0) {
    showMessage('No text found in document', 'warning');
    return;
  }
  
  const ui = DocumentApp.getUi();
  const response = ui.alert(
    'Transform Entire Document?',
    `This will transform all text in the document.\n\nAre you sure?`,
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  try {
    const settings = getSettings();
    const result = callTransformAPI(text, settings.language, settings.dictionaryId);
    
    if (!result || !result.result) {
      showMessage('No changes were made', 'info');
      return;
    }
    
    // Replace text while preserving formatting
    safeReplaceInBody(body, text, result.result);
    
    showMessage(
      `✅ Transformation Complete!\n\n` +
      `Replacements: ${result.replacements}\n` +
      `Language: ${result.language}`,
      'success'
    );
    
  } catch (error) {
    showMessage(`Error: ${error.message}`, 'error');
  }
}

/**
 * Transform selected text only
 */
function transformSelection() {
  const doc = DocumentApp.getActiveDocument();
  const selection = doc.getSelection();
  
  if (!selection) {
    showMessage('Please select text first', 'warning');
    return;
  }
  
  const elements = selection.getRangeElements();
  if (elements.length === 0) {
    showMessage('No text selected', 'warning');
    return;
  }
  
  try {
    const settings = getSettings();
    let totalReplacements = 0;
    
    elements.forEach(element => {
      const textElement = element.getElement().asText();
      const text = textElement.getText();
      
      if (text && text.trim().length > 0) {
        const result = callTransformAPI(text, settings.language, settings.dictionaryId);
        
        if (result && result.result && result.result !== text) {
          textElement.setText(result.result);
          totalReplacements += result.replacements;
        }
      }
    });
    
    if (totalReplacements > 0) {
      showMessage(`✅ Transformed ${totalReplacements} phrases`, 'success');
    } else {
      showMessage('No changes were made', 'info');
    }
    
  } catch (error) {
    showMessage(`Error: ${error.message}`, 'error');
  }
}

/**
 * Preview what will change without applying
 */
function previewChanges() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const text = body.getText();
  
  if (!text || text.trim().length === 0) {
    showMessage('No text found in document', 'warning');
    return;
  }
  
  try {
    const settings = getSettings();
    const result = callTransformAPI(text, settings.language, settings.dictionaryId);
    
    if (!result || result.replacements === 0) {
      showMessage('No changes would be made', 'info');
      return;
    }
    
    const html = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .stats { background: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .preview { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; max-height: 400px; overflow-y: auto; }
        .highlight { background-color: yellow; }
        h3 { margin-top: 0; color: #333; }
        .count { font-size: 24px; font-weight: bold; color: #4CAF50; }
      </style>
      <div class="stats">
        <h3>📊 Preview Statistics</h3>
        <div class="count">${result.replacements} phrases will be transformed</div>
        <p><strong>Language:</strong> ${result.language.toUpperCase()}</p>
      </div>
      <div class="preview">
        <h3>Preview (first 500 characters):</h3>
        <p>${result.result.substring(0, 500)}${result.result.length > 500 ? '...' : ''}</p>
      </div>
      <br>
      <button onclick="google.script.host.close()">Close</button>
    `;
    
    showDialog(html, 'Transformation Preview', 500, 600);
    
  } catch (error) {
    showMessage(`Error: ${error.message}`, 'error');
  }
}

/**
 * Show document statistics
 */
function showStatistics() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const text = body.getText();
  
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const charCount = text.length;
  const paragraphCount = body.getParagraphs().length;
  
  try {
    const settings = getSettings();
    const result = callTransformAPI(text, settings.language, settings.dictionaryId);
    
    const html = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .stat-box { background: #f8f9fa; border-left: 4px solid #4CAF50; padding: 15px; margin: 10px 0; }
        .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
        .stat-value { font-size: 28px; font-weight: bold; color: #333; margin: 5px 0; }
        h3 { color: #333; }
      </style>
      <h3>📊 Document Statistics</h3>
      
      <div class="stat-box">
        <div class="stat-label">Words</div>
        <div class="stat-value">${wordCount.toLocaleString()}</div>
      </div>
      
      <div class="stat-box">
        <div class="stat-label">Characters</div>
        <div class="stat-value">${charCount.toLocaleString()}</div>
      </div>
      
      <div class="stat-box">
        <div class="stat-label">Paragraphs</div>
        <div class="stat-value">${paragraphCount}</div>
      </div>
      
      <div class="stat-box" style="border-left-color: #2196F3;">
        <div class="stat-label">Phrases to Transform</div>
        <div class="stat-value">${result.replacements}</div>
      </div>
      
      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        <strong>Current Language:</strong> ${settings.language.toUpperCase()}<br>
        <strong>Dictionary:</strong> ${settings.dictionaryId || 'Global (Default)'}
      </p>
      
      <button onclick="google.script.host.close()" style="margin-top: 15px; padding: 10px 20px;">Close</button>
    `;
    
    showDialog(html, 'Document Statistics', 400, 500);
    
  } catch (error) {
    showMessage(`Error: ${error.message}`, 'error');
  }
}

// ============================================
// DICTIONARY MANAGEMENT
// ============================================

/**
 * Show dictionary picker
 */
function showDictionaryPicker() {
  try {
    const dictionaries = fetchPublicDictionaries();
    
    if (!dictionaries || dictionaries.length === 0) {
      showMessage('No dictionaries available', 'warning');
      return;
    }
    
    let options = '<option value="">Global Dictionary (Default)</option>';
    dictionaries.forEach(dict => {
      options += `<option value="${dict.id}">${dict.name} (${dict.language.toUpperCase()}) - ${dict.stats.wordCount} phrases</option>`;
    });
    
    const html = `
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        select { width: 100%; padding: 10px; font-size: 14px; margin: 15px 0; }
        button { padding: 12px 24px; font-size: 14px; margin: 5px; cursor: pointer; }
        .primary { background: #4CAF50; color: white; border: none; border-radius: 4px; }
        .secondary { background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; }
        .info { background: #e3f2fd; padding: 15px; border-radius: 4px; margin-bottom: 15px; }
      </style>
      
      <div class="info">
        <strong>📚 Choose Your Dictionary</strong>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #666;">
          Select a dictionary to use for transformations. Global dictionary includes common phrases.
        </p>
      </div>
      
      <label for="dictionary"><strong>Available Dictionaries:</strong></label>
      <select id="dictionary">
        ${options}
      </select>
      
      <button class="primary" onclick="saveDictionary()">Save Selection</button>
      <button class="secondary" onclick="google.script.host.close()">Cancel</button>
      
      <script>
        function saveDictionary() {
          const dictionaryId = document.getElementById('dictionary').value;
          google.script.run
            .withSuccessHandler(() => {
              alert('Dictionary saved! ✅');
              google.script.host.close();
            })
            .withFailureHandler((error) => alert('Error: ' + error))
            .saveSelectedDictionary(dictionaryId);
        }
      </script>
    `;
    
    showDialog(html, 'Choose Dictionary', 400, 450);
    
  } catch (error) {
    showMessage(`Error loading dictionaries: ${error.message}`, 'error');
  }
}

function saveSelectedDictionary(dictionaryId) {
  const userProps = PropertiesService.getUserProperties();
  userProps.setProperty('DICTIONARY_ID', dictionaryId || '');
}

/**
 * Show language picker
 */
function showLanguagePicker() {
  const languages = [
    { code: 'en', name: 'English 🇺🇸', flag: '🇺🇸' },
    { code: 'fa', name: 'Persian 🇮🇷', flag: '🇮🇷' },
    { code: 'es', name: 'Spanish 🇪🇸', flag: '🇪🇸' },
    { code: 'pt', name: 'Portuguese 🇵🇹', flag: '🇵🇹' }
  ];
  
  const settings = getSettings();
  let options = '';
  
  languages.forEach(lang => {
    const selected = lang.code === settings.language ? 'selected' : '';
    options += `<option value="${lang.code}" ${selected}>${lang.name}</option>`;
  });
  
  const html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      select { width: 100%; padding: 12px; font-size: 16px; margin: 15px 0; }
      button { padding: 12px 24px; font-size: 14px; margin: 5px; cursor: pointer; }
      .primary { background: #4CAF50; color: white; border: none; border-radius: 4px; }
      .secondary { background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; }
    </style>
    
    <h3>🌍 Select Language</h3>
    <p>Choose the language for text transformation:</p>
    
    <select id="language">
      ${options}
    </select>
    
    <button class="primary" onclick="saveLanguage()">Save Language</button>
    <button class="secondary" onclick="google.script.host.close()">Cancel</button>
    
    <script>
      function saveLanguage() {
        const language = document.getElementById('language').value;
        google.script.run
          .withSuccessHandler(() => {
            alert('Language saved! ✅');
            google.script.host.close();
          })
          .withFailureHandler((error) => alert('Error: ' + error))
          .saveSelectedLanguage(language);
      }
    </script>
  `;
  
  showDialog(html, 'Change Language', 350, 350);
}

function saveSelectedLanguage(language) {
  const userProps = PropertiesService.getUserProperties();
  userProps.setProperty('LANGUAGE', language);
}

/**
 * Show add phrase dialog
 */
function showAddPhraseDialog() {
  const settings = getSettings();
  
  const html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      input { width: 100%; padding: 10px; margin: 10px 0; font-size: 14px; border: 1px solid #ddd; border-radius: 4px; }
      label { font-weight: bold; display: block; margin-top: 15px; }
      button { padding: 12px 24px; font-size: 14px; margin: 10px 5px 5px 0; cursor: pointer; }
      .primary { background: #4CAF50; color: white; border: none; border-radius: 4px; }
      .secondary { background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; }
      .info { background: #fff3cd; padding: 12px; border-radius: 4px; margin-bottom: 15px; font-size: 13px; }
    </style>
    
    <h3>➕ Add New Phrase</h3>
    
    <div class="info">
      <strong>Note:</strong> This will add the phrase to the selected dictionary. 
      ${settings.dictionaryId ? 'Check dictionary permissions.' : 'Adding to global dictionary.'}
    </div>
    
    <label for="from">Formal Phrase:</label>
    <input type="text" id="from" placeholder="e.g., at this point in time">
    
    <label for="to">Natural Alternative:</label>
    <input type="text" id="to" placeholder="e.g., now">
    
    <button class="primary" onclick="addPhrase()">Add Phrase</button>
    <button class="secondary" onclick="google.script.host.close()">Cancel</button>
    
    <script>
      function addPhrase() {
        const from = document.getElementById('from').value.trim();
        const to = document.getElementById('to').value.trim();
        
        if (!from || !to) {
          alert('Please fill in both fields');
          return;
        }
        
        google.script.run
          .withSuccessHandler((success) => {
            if (success) {
              alert('Phrase added successfully! ✅');
              google.script.host.close();
            } else {
              alert('Failed to add phrase. Check dictionary permissions.');
            }
          })
          .withFailureHandler((error) => alert('Error: ' + error))
          .addPhraseToDictionary(from, to);
      }
    </script>
  `;
  
  showDialog(html, 'Add New Phrase', 400, 450);
}

function addPhraseToDictionary(from, to) {
  try {
    const settings = getSettings();
    const dictionaryId = settings.dictionaryId || 'global';
    
    const url = `${API_BASE_URL}/dictionaries/${dictionaryId}/words`;
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ from, to }),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    return result.success === true;
    
  } catch (error) {
    Logger.log('Error adding phrase: ' + error);
    return false;
  }
}

// ============================================
// SETTINGS
// ============================================

function showSettings() {
  const settings = getSettings();
  
  const html = `
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      .setting { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 4px; }
      .label { font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase; }
      .value { font-size: 16px; margin: 5px 0; color: #333; }
      input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
      button { padding: 12px 24px; font-size: 14px; margin: 5px; cursor: pointer; }
      .primary { background: #4CAF50; color: white; border: none; border-radius: 4px; }
      .secondary { background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; }
      .danger { background: #f44336; color: white; border: none; border-radius: 4px; }
    </style>
    
    <h3>⚙️ Settings</h3>
    
    <div class="setting">
      <div class="label">API Base URL</div>
      <input type="text" id="apiUrl" value="${API_BASE_URL}" placeholder="http://localhost:3000/api">
    </div>
    
    <div class="setting">
      <div class="label">Current Language</div>
      <div class="value">${settings.language.toUpperCase()}</div>
    </div>
    
    <div class="setting">
      <div class="label">Current Dictionary</div>
      <div class="value">${settings.dictionaryId || 'Global (Default)'}</div>
    </div>
    
    <button class="primary" onclick="saveSettings()">Save Settings</button>
    <button class="danger" onclick="resetSettings()">Reset to Default</button>
    <button class="secondary" onclick="google.script.host.close()">Close</button>
    
    <script>
      function saveSettings() {
        const apiUrl = document.getElementById('apiUrl').value;
        google.script.run
          .withSuccessHandler(() => {
            alert('Settings saved! Please reload the document.');
            google.script.host.close();
          })
          .saveApiUrl(apiUrl);
      }
      
      function resetSettings() {
        if (confirm('Reset all settings to default?')) {
          google.script.run
            .withSuccessHandler(() => {
              alert('Settings reset! ✅');
              google.script.host.close();
            })
            .resetAllSettings();
        }
      }
    </script>
  `;
  
  showDialog(html, 'Settings', 450, 550);
}

function saveApiUrl(url) {
  const userProps = PropertiesService.getUserProperties();
  userProps.setProperty('API_URL', url);
}

function resetAllSettings() {
  PropertiesService.getUserProperties().deleteAllProperties();
}

function getSettings() {
  const userProps = PropertiesService.getUserProperties();
  
  return {
    apiUrl: userProps.getProperty('API_URL') || API_BASE_URL,
    language: userProps.getProperty('LANGUAGE') || DEFAULT_LANG,
    dictionaryId: userProps.getProperty('DICTIONARY_ID') || DEFAULT_DICTIONARY_ID
  };
}

// ============================================
// API CALLS
// ============================================

/**
 * Call TextFlow Transform API
 */
function callTransformAPI(text, lang, dictionaryId) {
  try {
    const settings = getSettings();
    const url = `${settings.apiUrl}/transform`;
    
    const payload = {
      text: text,
      lang: lang || DEFAULT_LANG
    };
    
    if (dictionaryId) {
      payload.dictionaryId = dictionaryId;
    }
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    
    if (statusCode !== 200) {
      throw new Error(`API returned status ${statusCode}`);
    }
    
    return JSON.parse(response.getContentText());
    
  } catch (error) {
    Logger.log('API Error: ' + error);
    throw new Error('Failed to connect to TextFlow API. Check your settings.');
  }
}

/**
 * Fetch public dictionaries
 */
function fetchPublicDictionaries() {
  try {
    const settings = getSettings();
    const url = `${settings.apiUrl}/dictionaries/list`;
    
    const options = {
      method: 'get',
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    
    return result.dictionaries || [];
    
  } catch (error) {
    Logger.log('Error fetching dictionaries: ' + error);
    return [];
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Safe text replacement preserving formatting
 */
function safeReplaceInBody(body, oldText, newText) {
  try {
    const searchResult = body.findText(oldText);
    if (searchResult) {
      const element = searchResult.getElement();
      const textElement = element.asText();
      textElement.setText(newText);
    }
  } catch (error) {
    // If exact match fails, replace full text
    body.setText(newText);
  }
}

/**
 * Show dialog
 */
function showDialog(html, title, width, height) {
  const htmlOutput = HtmlService.createHtmlOutput(html)
    .setWidth(width)
    .setHeight(height);
  
  DocumentApp.getUi().showModalDialog(htmlOutput, title);
}

/**
 * Show message
 */
function showMessage(message, type) {
  const ui = DocumentApp.getUi();
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  const icon = icons[type] || icons.info;
  
  ui.alert(`${icon} TextFlow`, message, ui.ButtonSet.OK);
}
