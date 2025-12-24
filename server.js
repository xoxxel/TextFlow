const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const DICT_FILE = path.join(__dirname, 'dictionary', 'fa.json');

// Middleware
app.use(cors()); // اجازه دسترسی از Google Apps Script
app.use(express.json());

// GET - دریافت همه کلمات
app.get('/api/dictionary', async (req, res) => {
  try {
    const data = await fs.readFile(DICT_FILE, 'utf8');
    const dictionary = JSON.parse(data);
    res.json(dictionary);
  } catch (error) {
    res.status(500).json({ error: 'خطا در خواندن دیکشنری' });
  }
});

// POST - افزودن کلمه جدید
app.post('/api/dictionary', async (req, res) => {
  try {
    const { from, to } = req.body;
    
    if (!from || !to) {
      return res.status(400).json({ error: 'فیلدهای from و to الزامی هستند' });
    }

    const data = await fs.readFile(DICT_FILE, 'utf8');
    const dictionary = JSON.parse(data);
    
    // چک کردن تکراری نبودن
    const exists = dictionary.find(item => item.from === from);
    if (exists) {
      return res.status(400).json({ error: 'این کلمه قبلاً وجود دارد' });
    }

    dictionary.push({ from, to });
    await fs.writeFile(DICT_FILE, JSON.stringify(dictionary, null, 2), 'utf8');
    
    res.json({ success: true, message: 'کلمه با موفقیت اضافه شد', data: { from, to } });
  } catch (error) {
    res.status(500).json({ error: 'خطا در افزودن کلمه' });
  }
});

// PUT - ویرایش کلمه (بر اساس from)
app.put('/api/dictionary/:from', async (req, res) => {
  try {
    const oldFrom = req.params.from;
    const { from: newFrom, to: newTo } = req.body;

    if (!newFrom || !newTo) {
      return res.status(400).json({ error: 'فیلدهای from و to الزامی هستند' });
    }

    const data = await fs.readFile(DICT_FILE, 'utf8');
    const dictionary = JSON.parse(data);
    
    const index = dictionary.findIndex(item => item.from === oldFrom);
    if (index === -1) {
      return res.status(404).json({ error: 'کلمه پیدا نشد' });
    }

    dictionary[index] = { from: newFrom, to: newTo };
    await fs.writeFile(DICT_FILE, JSON.stringify(dictionary, null, 2), 'utf8');
    
    res.json({ success: true, message: 'کلمه با موفقیت ویرایش شد', data: dictionary[index] });
  } catch (error) {
    res.status(500).json({ error: 'خطا در ویرایش کلمه' });
  }
});

// DELETE - حذف کلمه
app.delete('/api/dictionary/:from', async (req, res) => {
  try {
    const fromToDelete = req.params.from;

    const data = await fs.readFile(DICT_FILE, 'utf8');
    let dictionary = JSON.parse(data);
    
    const index = dictionary.findIndex(item => item.from === fromToDelete);
    if (index === -1) {
      return res.status(404).json({ error: 'کلمه پیدا نشد' });
    }

    const deleted = dictionary.splice(index, 1)[0];
    await fs.writeFile(DICT_FILE, JSON.stringify(dictionary, null, 2), 'utf8');
    
    res.json({ success: true, message: 'کلمه با موفقیت حذف شد', data: deleted });
  } catch (error) {
    res.status(500).json({ error: 'خطا در حذف کلمه' });
  }
});

// GET - جستجوی کلمه
app.get('/api/dictionary/search/:query', async (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const data = await fs.readFile(DICT_FILE, 'utf8');
    const dictionary = JSON.parse(data);
    
    const results = dictionary.filter(item => 
      item.from.toLowerCase().includes(query) || 
      item.to.toLowerCase().includes(query)
    );
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'خطا در جستجو' });
  }
});

// شروع سرور
app.listen(PORT, () => {
  console.log(`🚀 سرور دیکشنری روی پورت ${PORT} اجرا شد`);
  console.log(`📖 API: http://localhost:${PORT}/api/dictionary`);
});
