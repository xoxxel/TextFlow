const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();
const { connectDB } = require('./custom-dictionaries/schema');
const dictionaryRoutes = require('./custom-dictionaries/routes');

const app = express();
const PORT = process.env.PORT || 3000;
const DICT_DIR = path.join(__dirname, 'dictionary');

// Supported languages
const SUPPORTED_LANGS = ['fa', 'en', 'es', 'pt'];

// Middleware
app.use(cors());
app.use(express.json());

// Custom dictionaries routes
app.use('/api/dictionaries', dictionaryRoutes);

// Helper: Get dictionary file path
function getDictPath(lang = 'fa') {
  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = 'fa';
  }
  return path.join(DICT_DIR, `${lang}.json`);
}

// Helper: Normalize text (handles Persian-specific characters)
function normalizeText(s) {
  if (!s) return s;
  let normalized = String(s).trim();
  
  // Persian-specific normalization
  normalized = normalized
    .replace(/\u064A/g, '\u06CC') // Arabic yeh -> Persian yeh
    .replace(/\u0643/g, '\u06A9') // Arabic kaf -> Persian kaf
    .replace(/\u0640/g, '');      // Remove tatweel
  
  return normalized;
}

// Helper: Check if character is a word character
function isWordChar(ch) {
  if (!ch) return false;
  if (/[A-Za-z0-9_]/.test(ch)) return true;
  const code = ch.charCodeAt(0);
  return (code >= 0x0600 && code <= 0x06FF); // Persian/Arabic range
}

// Helper: Check if at word boundary
function isWordBoundary(ch) {
  return !isWordChar(ch);
}

// Helper: Escape regex special characters
function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper: Humanize text using dictionary
async function humanizeText(text, lang = 'en') {
  try {
    const dictPath = getDictPath(lang);
    const data = await fs.readFile(dictPath, 'utf8');
    const dictionary = JSON.parse(data);
    
    // Prepare dictionary entries
    const entries = [];
    dictionary.forEach(item => {
      if (!item.from || !item.to) return;
      const from = normalizeText(item.from);
      const options = String(item.to).split('/').map(s => normalizeText(s)).filter(Boolean);
      if (!from || from.length < 2 || options.length === 0) return;
      // Pick random option
      const pick = options[Math.floor(Math.random() * options.length)];
      entries.push({ from, to: pick });
    });
    
    // Sort by length (longer first to avoid partial replacements)
    entries.sort((a, b) => b.from.length - a.from.length);
    
    let result = text;
    let replacements = [];
    
    entries.forEach(({ from, to }) => {
      // Create regex with word boundaries - simpler approach
      try {
        // Escape the phrase for use in regex
        const escapedFrom = escapeRegex(from);
        
        // Word boundary pattern: match only when surrounded by non-word characters
        const pattern = `\\b${escapedFrom}\\b`;
        const regex = new RegExp(pattern, 'gi');
        
        // Track and perform replacements
        const matches = [...result.matchAll(regex)];
        if (matches.length > 0) {
          replacements.push({
            from: from,
            to: to,
            count: matches.length
          });
          
          // Perform replacement
          result = result.replace(regex, to);
        }
      } catch (e) {
        // Skip problematic patterns
      }
    });
    
    return {
      original: text,
      result: result,
      replacements: replacements,
      totalChanges: replacements.reduce((sum, r) => sum + r.count, 0),
      language: lang
    };
    
  } catch (error) {
    throw new Error('Error processing text: ' + error.message);
  }
}

// GET - Get list of languages
app.get('/api/languages', (req, res) => {
  res.json({
    supported: SUPPORTED_LANGS,
    default: 'fa',
    languages: {
      fa: 'Persian (فارسی)',
      en: 'English',
      es: 'Spanish (Español)',
      pt: 'Portuguese (Português)'
    }
  });
});

// GET - Get all words (with language support)
app.get('/api/dictionary', async (req, res) => {
  try {
    const lang = req.query.lang || 'fa';
    const dictPath = getDictPath(lang);
    const data = await fs.readFile(dictPath, 'utf8');
    const dictionary = JSON.parse(data);
    res.json(dictionary);
  } catch (error) {
    res.status(500).json({ error: 'Error reading dictionary' });
  }
});

// GET - Get dictionary by language
app.get('/api/dictionary/:lang', async (req, res) => {
  try {
    const lang = req.params.lang;
    const dictPath = getDictPath(lang);
    const data = await fs.readFile(dictPath, 'utf8');
    const dictionary = JSON.parse(data);
    res.json(dictionary);
  } catch (error) {
    res.status(500).json({ error: 'Error reading dictionary' });
  }
});

// POST - Add new word (with language support)
app.post('/api/dictionary', async (req, res) => {
  try {
    const { from, to, lang = 'fa' } = req.body;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'Fields "from" and "to" are required' });
    }

    const dictPath = getDictPath(lang);
    const data = await fs.readFile(dictPath, 'utf8');
    const dictionary = JSON.parse(data);
    
    const exists = dictionary.find(item => item.from === from);
    if (exists) {
      return res.status(400).json({ error: 'This word already exists' });
    }

    dictionary.push({ from, to });
    await fs.writeFile(dictPath, JSON.stringify(dictionary, null, 2), 'utf8');
    
    res.json({ success: true, message: 'Word added successfully', data: { from, to, lang } });
  } catch (error) {
    res.status(500).json({ error: 'Error adding word' });
  }
});

// PUT - Edit word (based on "from" and language)
app.put('/api/dictionary/:from', async (req, res) => {
  try {
    const oldFrom = req.params.from;
    const { from: newFrom, to: newTo, lang = 'fa' } = req.body;

    if (!newFrom || !newTo) {
      return res.status(400).json({ error: 'Fields "from" and "to" are required' });
    }

    const dictPath = getDictPath(lang);
    const data = await fs.readFile(dictPath, 'utf8');
    const dictionary = JSON.parse(data);
    
    const index = dictionary.findIndex(item => item.from === oldFrom);
    if (index === -1) {
      return res.status(404).json({ error: 'Word not found' });
    }

    dictionary[index] = { from: newFrom, to: newTo };
    await fs.writeFile(dictPath, JSON.stringify(dictionary, null, 2), 'utf8');
    
    res.json({ success: true, message: 'Word updated successfully', data: dictionary[index] });
  } catch (error) {
    res.status(500).json({ error: 'Error updating word' });
  }
});

// DELETE - Delete word (with language support)
app.delete('/api/dictionary/:from', async (req, res) => {
  try {
    const fromToDelete = req.params.from;
    const lang = req.query.lang || 'fa';

    const dictPath = getDictPath(lang);
    const data = await fs.readFile(dictPath, 'utf8');
    let dictionary = JSON.parse(data);
    
    const index = dictionary.findIndex(item => item.from === fromToDelete);
    if (index === -1) {
      return res.status(404).json({ error: 'Word not found' });
    }

    const deleted = dictionary.splice(index, 1)[0];
    await fs.writeFile(dictPath, JSON.stringify(dictionary, null, 2), 'utf8');
    
    res.json({ success: true, message: 'Word deleted successfully', data: deleted });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting word' });
  }
});

// GET - Search word (with language support)
app.get('/api/dictionary/search/:query', async (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const lang = req.query.lang || 'fa';
    
    const dictPath = getDictPath(lang);
    const data = await fs.readFile(dictPath, 'utf8');
    const dictionary = JSON.parse(data);
    
    const results = dictionary.filter(item => 
      item.from.toLowerCase().includes(query) || 
      item.to.toLowerCase().includes(query)
    );
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Error searching' });
  }
});

// POST - Transform text (for automation tools like n8n, Zapier, Make)
app.post('/api/transform', async (req, res) => {
  try {
    const { text, lang = 'en' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Field "text" is required' });
    }
    
    if (!SUPPORTED_LANGS.includes(lang)) {
      return res.status(400).json({ 
        error: `Language "${lang}" not supported. Supported: ${SUPPORTED_LANGS.join(', ')}` 
      });
    }
    
    const result = await humanizeText(text, lang);
    res.json(result);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
async function startServer() {
  try {
    // Initialize MongoDB for custom dictionaries
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Dictionary server running on port ${PORT}`);
      console.log(`📖 API: http://localhost:${PORT}/api/dictionary`);
      console.log(`📚 Custom Dictionaries: http://localhost:${PORT}/api/dictionaries`);
      console.log(`🌍 Supported languages: ${SUPPORTED_LANGS.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
