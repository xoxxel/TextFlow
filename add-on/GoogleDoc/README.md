# TextFlow Google Docs Add-ons

Transform formal text into natural language directly in Google Docs using TextFlow API.

## 📦 Available Versions

### 1. TextFlow Simple (`textflow-simple.js`)
**Best for:** Beginners, quick setup, basic usage

**Features:**
- ✅ Transform entire document
- ✅ Transform selected text
- ✅ Preview changes
- ✅ Simple configuration
- ✅ Lightweight (~150 lines)

**Perfect for:** Individual users who want a simple, no-fuss solution.

---

### 2. TextFlow Advanced (`textflow-advanced.js`)
**Best for:** Power users, teams, custom dictionaries

**Features:**
- ✅ All features from Simple version
- ✅ Choose from public dictionaries
- ✅ Multi-language support (switch between EN, FA, ES, PT)
- ✅ Add new phrases to dictionary
- ✅ Document statistics
- ✅ Custom API URL configuration
- ✅ Settings management
- ✅ Enhanced UI with dialogs

**Perfect for:** Teams, agencies, content creators with custom needs.

---

## 🚀 Installation

### Step 1: Copy the Script

1. Open your Google Docs document
2. Go to **Extensions → Apps Script**
3. Delete any existing code
4. Choose your version:
   - For simple: Copy all content from `textflow-simple.js`
   - For advanced: Copy all content from `textflow-advanced.js`
5. Paste into the Apps Script editor

### Step 2: Configure

**For Simple Version:**
```javascript
const API_URL = 'http://localhost:3000/api'; // Change to your server URL
const DEFAULT_LANGUAGE = 'en'; // en, fa, es, pt
```

**For Advanced Version:**
```javascript
const API_BASE_URL = 'http://localhost:3000/api'; // Your server URL
const DEFAULT_LANG = 'en'; // Default language
const DEFAULT_DICTIONARY_ID = null; // Optional: Your custom dictionary ID
```

### Step 3: Save and Refresh

1. Click **💾 Save** (or Ctrl+S)
2. Name your project: "TextFlow"
3. Close Apps Script editor
4. **Refresh your Google Docs page**
5. Look for **🔄 TextFlow** menu in the menu bar

### Step 4: First Run

1. Click **🔄 TextFlow → Transform Document**
2. Google will ask for permissions
3. Click **Review Permissions**
4. Choose your Google account
5. Click **Advanced → Go to TextFlow (unsafe)**
6. Click **Allow**

⚠️ **Note:** "Unsafe" warning is normal for personal scripts. Your code is safe!

---

## 📖 Usage Guide

### Simple Version

#### Transform Entire Document
1. Click **🔄 TextFlow → Transform Document**
2. Confirm the action
3. Wait for transformation
4. Done! Your text is now more natural

#### Transform Selection
1. Select text you want to transform
2. Click **🔄 TextFlow → Transform Selection**
3. Selected text is transformed

#### Preview Changes
1. Click **🔄 TextFlow → Preview Changes**
2. See how many phrases will change
3. View first 500 characters of result

---

### Advanced Version

#### Main Menu Options

**✨ Transform All Text**
- Transforms entire document
- Asks for confirmation
- Shows statistics after completion

**🔍 Transform Selection**
- Transforms only selected text
- Preserves formatting
- Shows replacement count

**📚 Choose Dictionary**
- Browse all public dictionaries
- Filter by language
- See phrase count for each
- Save your selection

**🌍 Change Language**
- Switch between English, Persian, Spanish, Portuguese
- Changes apply immediately
- Saved for future sessions

**👀 Preview Changes**
- See what will change before applying
- View statistics
- Review first 500 characters

**📊 Show Statistics**
- Word count
- Character count
- Paragraph count
- Number of phrases to transform
- Current settings

**➕ Add New Phrase**
- Contribute to dictionaries
- Add formal phrase
- Add natural alternative
- Instantly available

**⚙️ Settings**
- Configure API URL
- View current language
- View current dictionary
- Reset to defaults

---

## 🎯 Examples

### Example 1: Business Email

**Before:**
```
At this point in time, we need to utilize our resources in order to 
facilitate the implementation of the new system. It is important to note 
that we must take into consideration all stakeholders.
```

**After:**
```
Now, we need to use our resources to help implement the new system. 
Note that we must consider all stakeholders.
```

**Result:** 6 phrases transformed ✅

---

### Example 2: Academic Paper

**Before:**
```
In light of the fact that the research demonstrated a significant 
correlation, it is imperative that we conduct further analysis to 
ascertain the underlying mechanisms.
```

**After:**
```
Because the research showed a significant correlation, we must 
conduct further analysis to find the underlying mechanisms.
```

**Result:** 4 phrases transformed ✅

---

## ⚙️ Configuration

### Custom Server URL

If your TextFlow server is not on localhost:

**Simple Version:**
```javascript
const API_URL = 'https://textflow.yourcompany.com/api';
```

**Advanced Version:**
1. Click **🔄 TextFlow → Settings**
2. Enter your API URL
3. Click **Save Settings**

### Custom Dictionary

**Advanced Version Only:**

**Option 1: Set Default in Code**
```javascript
const DEFAULT_DICTIONARY_ID = 'your-dictionary-uuid-here';
```

**Option 2: Choose from UI**
1. Click **🔄 TextFlow → Choose Dictionary**
2. Select from available dictionaries
3. Click **Save Selection**

### Language Settings

**Simple Version:**
```javascript
const DEFAULT_LANGUAGE = 'fa'; // for Persian
```

**Advanced Version:**
1. Click **🔄 TextFlow → Change Language**
2. Select language
3. Click **Save Language**

---

## 🔧 Troubleshooting

### ❌ "Cannot connect to TextFlow API"

**Solutions:**
1. Check if your server is running
2. Verify API_URL is correct
3. Check firewall/network settings
4. For localhost: Server must be on same machine

### ❌ "No text found in document"

**Solutions:**
1. Make sure document has text
2. Text cannot be in images
3. Try typing some text first

### ❌ "Access denied" when adding phrases

**Solutions:**
1. Dictionary may not allow community edits
2. Try choosing a different dictionary
3. Create your own custom dictionary

### ⚠️ Formatting changes after transformation

**Solutions:**
1. Use "Transform Selection" for small sections
2. Reapply formatting manually if needed
3. Advanced version preserves more formatting

### 🐌 Transformation is slow

**Solutions:**
1. Transform smaller sections
2. Check network connection
3. Verify server performance
4. Use custom dictionary (fewer phrases to check)

---

## 🎨 Customization

### Change Menu Name

Find this line:
```javascript
.createMenu('🔄 TextFlow')
```

Change to:
```javascript
.createMenu('✨ My Custom Name')
```

### Add More Menu Items

```javascript
function onOpen() {
  DocumentApp.getUi()
    .createMenu('🔄 TextFlow')
    .addItem('✨ Transform Document', 'transformDocument')
    .addItem('🔍 Transform Selection', 'transformSelection')
    .addItem('📊 My Custom Function', 'myCustomFunction') // Add this
    .addToUi();
}

function myCustomFunction() {
  // Your custom code here
  showAlert('Hello from custom function!');
}
```

### Custom Styling

Advanced version dialogs can be customized:

```javascript
const html = `
  <style>
    body { 
      font-family: 'Your Font', Arial, sans-serif; 
      background: #your-color;
    }
    button { 
      background: #your-brand-color; 
    }
  </style>
  <!-- Your HTML -->
`;
```

---

## 📚 API Integration

Both versions use the TextFlow API. They call:

**Transform Endpoint:**
```
POST /api/transform
{
  "text": "your text here",
  "lang": "en",
  "dictionaryId": "optional-uuid"
}
```

**Response:**
```json
{
  "original": "...",
  "result": "...",
  "replacements": 5,
  "language": "en"
}
```

For advanced version, also uses:
- `GET /api/dictionaries/list` - Get public dictionaries
- `POST /api/dictionaries/:id/words` - Add phrase

---

## 🔐 Privacy & Security

- ✅ Your documents stay in Google Docs
- ✅ Only text is sent to API for transformation
- ✅ No document metadata is collected
- ✅ No authentication tokens are stored
- ✅ All communication is HTTPS (in production)

**Best Practices:**
1. Use your own TextFlow server for sensitive content
2. Don't use public dictionaries for confidential terms
3. Review changes before finalizing
4. Keep API URL private

---

## 🚀 Performance Tips

### For Large Documents

1. **Use Selection Mode:**
   - Transform paragraph by paragraph
   - Faster than full document

2. **Custom Dictionary:**
   - Smaller dictionary = faster processing
   - Create task-specific dictionaries

3. **Local Server:**
   - Run TextFlow on same machine
   - Reduces network latency

### For Teams

1. **Shared Dictionary:**
   - Create team dictionary with common phrases
   - Everyone uses same ID

2. **Consistent Settings:**
   - Document team API URL
   - Share configuration guide

3. **Templates:**
   - Pre-transform template documents
   - Save as new versions

---

## 📝 Version Comparison

| Feature | Simple | Advanced |
|---------|--------|----------|
| Transform document | ✅ | ✅ |
| Transform selection | ✅ | ✅ |
| Preview changes | ✅ | ✅ |
| Choose dictionary | ❌ | ✅ |
| Multiple languages | ❌ | ✅ |
| Add phrases | ❌ | ✅ |
| Statistics | ❌ | ✅ |
| Settings UI | ❌ | ✅ |
| File size | 150 lines | 500+ lines |
| Setup time | 2 minutes | 5 minutes |

---

## 🆘 Support

Need help?

- 📖 **Documentation**: [GitHub](https://github.com/xoxxel/TextFlow)
- 🐛 **Report Bug**: [Issues](https://github.com/xoxxel/TextFlow/issues)
- 💬 **Discussion**: [GitHub Discussions](https://github.com/xoxxel/TextFlow/discussions)
- 📧 **Email**: support@serpify.dev

---

## 📄 License

MIT License - Free to use and modify

---

## 🎉 Credits

Built with ❤️ by [xoxxel](https://serpify.dev)

Part of the **TextFlow** project - Making text transformation accessible to everyone.

---

**Happy Transforming! ✨**
