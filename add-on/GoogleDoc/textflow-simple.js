/**
 * TextFlow - Google Docs Add-on (Simple Version)
 * 
 * Quick and easy text transformation for Google Docs.
 * Perfect for beginners - just install and use!
 * 
 * Setup:
 * 1. Copy this code to Google Apps Script (Extensions → Apps Script)
 * 2. Save and refresh your document
 * 3. Use TextFlow menu
 * 
 * GitHub: https://github.com/xoxxel/TextFlow
 */

// ============================================
// CONFIGURATION - Change these if needed
// ============================================

const API_URL = 'http://localhost:3000/api'; // Your TextFlow server URL
const DEFAULT_LANGUAGE = 'en'; // en, fa, es, pt

// ============================================
// MENU
// ============================================

function onOpen() {
  DocumentApp.getUi()
    .createMenu('🔄 TextFlow')
    .addItem('✨ Transform Document', 'transformDocument')
    .addItem('🔍 Transform Selection', 'transformSelection')
    .addItem('👀 Preview Changes', 'previewChanges')
    .addToUi();
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Transform entire document
 */
function transformDocument() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const originalText = body.getText();
  
  if (!originalText || originalText.trim().length === 0) {
    showAlert('No text found in document');
    return;
  }
  
  // Confirm with user
  const ui = DocumentApp.getUi();
  const response = ui.alert(
    'Transform Entire Document?',
    'This will transform all formal phrases to natural language.\n\nContinue?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  try {
    // Call API
    const result = transformText(originalText);
    
    if (!result || !result.result) {
      showAlert('❌ Failed to transform text. Check your API connection.');
      return;
    }
    
    // Check if any changes were made
    if (result.replacements === 0) {
      showAlert('ℹ️ No formal phrases found to transform.');
      return;
    }
    
    // Apply changes
    body.setText(result.result);
    
    // Show success message
    showAlert(
      `✅ Success!\n\n` +
      `Transformed ${result.replacements} phrases\n` +
      `Language: ${result.language.toUpperCase()}`
    );
    
  } catch (error) {
    showAlert(`❌ Error: ${error.message}`);
  }
}

/**
 * Transform selected text only
 */
function transformSelection() {
  const doc = DocumentApp.getActiveDocument();
  const selection = doc.getSelection();
  
  if (!selection) {
    showAlert('⚠️ Please select text first');
    return;
  }
  
  const elements = selection.getRangeElements();
  
  if (elements.length === 0) {
    showAlert('⚠️ No text selected');
    return;
  }
  
  try {
    let totalReplacements = 0;
    
    // Process each selected element
    elements.forEach(element => {
      const textElement = element.getElement().asText();
      const originalText = textElement.getText();
      
      if (originalText && originalText.trim().length > 0) {
        const result = transformText(originalText);
        
        if (result && result.result && result.result !== originalText) {
          textElement.setText(result.result);
          totalReplacements += result.replacements;
        }
      }
    });
    
    if (totalReplacements > 0) {
      showAlert(`✅ Transformed ${totalReplacements} phrases`);
    } else {
      showAlert('ℹ️ No changes were made');
    }
    
  } catch (error) {
    showAlert(`❌ Error: ${error.message}`);
  }
}

/**
 * Preview changes without applying
 */
function previewChanges() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const originalText = body.getText();
  
  if (!originalText || originalText.trim().length === 0) {
    showAlert('No text found in document');
    return;
  }
  
  try {
    const result = transformText(originalText);
    
    if (!result || result.replacements === 0) {
      showAlert('ℹ️ No changes would be made');
      return;
    }
    
    // Create preview dialog
    const preview = result.result.substring(0, 500);
    const message = 
      `📊 Preview:\n\n` +
      `${result.replacements} phrases will be transformed\n` +
      `Language: ${result.language.toUpperCase()}\n\n` +
      `First 500 characters:\n` +
      `"${preview}${result.result.length > 500 ? '...' : ''}"`;
    
    showAlert(message);
    
  } catch (error) {
    showAlert(`❌ Error: ${error.message}`);
  }
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Call TextFlow API to transform text
 */
function transformText(text) {
  try {
    const url = `${API_URL}/transform`;
    
    const payload = {
      text: text,
      lang: DEFAULT_LANGUAGE
    };
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();
    
    if (statusCode !== 200) {
      throw new Error(`API error: ${statusCode}`);
    }
    
    return JSON.parse(response.getContentText());
    
  } catch (error) {
    Logger.log('API Error: ' + error);
    throw new Error('Cannot connect to TextFlow API. Check API_URL in script.');
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Show alert message
 */
function showAlert(message) {
  const ui = DocumentApp.getUi();
  ui.alert('TextFlow', message, ui.ButtonSet.OK);
}
