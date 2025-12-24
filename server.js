const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DICT_DIR = path.join(__dirname, 'dictionary');

// Supported languages
const SUPPORTED_LANGS = ['fa', 'en', 'es', 'pt'];

// Middleware
app.use(cors());
app.use(express.json());

// Helper: Get dictionary file path
function getDictPath(lang = 'fa') {
  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = 'fa';
  }
  return path.join(DICT_DIR, `${lang}.json`);
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dictionary server running on port ${PORT}`);
  console.log(`📖 API: http://localhost:${PORT}/api/dictionary`);
  console.log(`🌍 Supported languages: ${SUPPORTED_LANGS.join(', ')}`);
});
