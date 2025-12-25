const {
  createDictionary,
  findDictionaryById,
  findDictionaryByName,
  getPublicDictionaries,
  updateDictionary,
  deleteDictionary,
  addWord,
  updateWord,
  deleteWord,
  incrementUsage
} = require('./schema');

/**
 * Get list of all public dictionaries
 * GET /api/dictionaries/list
 */
async function listDictionaries(req, res) {
  try {
    const { language, type } = req.query;
    const filters = {};
    
    if (language) filters.language = language;
    if (type) filters.type = type;
    
    const dictionaries = await getPublicDictionaries(filters);
    
    res.json({
      success: true,
      count: dictionaries.length,
      dictionaries
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get dictionary details by ID
 * GET /api/dictionaries/:id
 * Middleware: canAccessDictionary (checks if public or has token)
 */
async function getDictionary(req, res) {
  try {
    const dictionary = req.dictionary; // From middleware
    
    // Don't send token in response unless user is owner
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
    const isOwner = token && dictionary.token === token;
    
    const response = { ...dictionary };
    if (!isOwner) {
      delete response.token;
    }
    
    res.json({
      success: true,
      dictionary: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Get dictionary by name
 * GET /api/dictionaries/name/:name?language=en
 */
async function getDictionaryByName(req, res) {
  try {
    const { name } = req.params;
    const language = req.query.language || 'en';
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
    
    const dictionary = await findDictionaryByName(name, language);
    
    if (!dictionary) {
      return res.status(404).json({
        success: false,
        error: `Dictionary "${name}" not found for language "${language}"`
      });
    }
    
    // Check access for private dictionaries
    if (!dictionary.isPublic) {
      if (!token || dictionary.token !== token) {
        return res.status(403).json({
          success: false,
          error: 'This is a private dictionary. Token required.'
        });
      }
    }
    
    // Don't send token unless owner
    const isOwner = token && dictionary.token === token;
    const response = { ...dictionary };
    if (!isOwner) {
      delete response.token;
    }
    
    res.json({
      success: true,
      dictionary: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Create new dictionary
 * POST /api/dictionaries
 * Body: { name, description, language, author, type, isPublic, allowCommunityEdit }
 */
async function createNewDictionary(req, res) {
  try {
    const { name, description, language, author, type, isPublic, allowCommunityEdit } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Dictionary name is required'
      });
    }
    
    // Check if dictionary with same name and language exists
    const existing = await findDictionaryByName(name, language || 'en');
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `Dictionary "${name}" already exists for language "${language || 'en'}"`
      });
    }
    
    const dictionary = await createDictionary({
      name,
      description,
      language,
      author,
      type,
      isPublic,
      allowCommunityEdit
    });
    
    res.status(201).json({
      success: true,
      message: 'Dictionary created successfully',
      dictionary: {
        id: dictionary.id,
        name: dictionary.name,
        token: dictionary.token, // Return token only on creation
        language: dictionary.language,
        isPublic: dictionary.isPublic,
        allowCommunityEdit: dictionary.allowCommunityEdit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Update dictionary settings (name, description, isPublic, allowCommunityEdit)
 * PUT /api/dictionaries/:id
 * Middleware: validateToken (requires token)
 */
async function updateDictionarySettings(req, res) {
  try {
    const { id } = req.params;
    const { name, description, isPublic, allowCommunityEdit } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (allowCommunityEdit !== undefined) {
      // Global dictionaries must always allow community edit
      if (req.dictionary.type === 'global') {
        updates.allowCommunityEdit = true;
      } else {
        updates.allowCommunityEdit = allowCommunityEdit;
      }
    }
    
    const success = await updateDictionary(id, updates);
    
    if (success) {
      res.json({
        success: true,
        message: 'Dictionary updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to update dictionary'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Delete dictionary
 * DELETE /api/dictionaries/:id
 * Middleware: validateToken (requires token)
 */
async function removeDictionary(req, res) {
  try {
    const { id } = req.params;
    
    const success = await deleteDictionary(id);
    
    if (success) {
      res.json({
        success: true,
        message: 'Dictionary deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to delete dictionary'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Add word to dictionary
 * POST /api/dictionaries/:id/words
 * Middleware: canEditWords (checks allowCommunityEdit or token)
 */
async function addWordToDictionary(req, res) {
  try {
    const { id } = req.params;
    const { from, to } = req.body;
    
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Both "from" and "to" fields are required'
      });
    }
    
    const word = await addWord(id, {
      from,
      to,
      addedBy: req.isOwner ? 'author' : 'community'
    });
    
    if (word) {
      res.status(201).json({
        success: true,
        message: 'Word added successfully',
        word
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to add word'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Update word in dictionary
 * PUT /api/dictionaries/:id/words/:wordId
 * Middleware: canEditWords (checks allowCommunityEdit or token)
 */
async function updateWordInDictionary(req, res) {
  try {
    const { id, wordId } = req.params;
    const { from, to } = req.body;
    
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Both "from" and "to" fields are required'
      });
    }
    
    const success = await updateWord(id, wordId, { from, to });
    
    if (success) {
      res.json({
        success: true,
        message: 'Word updated successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to update word'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Delete word from dictionary
 * DELETE /api/dictionaries/:id/words/:wordId
 * Middleware: validateToken (only owner can delete)
 */
async function removeWordFromDictionary(req, res) {
  try {
    const { id, wordId } = req.params;
    
    const success = await deleteWord(id, wordId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Word deleted successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to delete word'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Bulk add words to dictionary
 * POST /api/dictionaries/:id/words/bulk
 * Middleware: canEditWords
 * Body: { words: [{from, to}, ...] }
 */
async function bulkAddWords(req, res) {
  try {
    const { id } = req.params;
    const { words } = req.body;
    
    if (!Array.isArray(words) || words.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Words array is required and must not be empty'
      });
    }
    
    const addedWords = [];
    const errors = [];
    
    for (const wordData of words) {
      if (!wordData.from || !wordData.to) {
        errors.push({ word: wordData, error: 'Missing from or to field' });
        continue;
      }
      
      const word = await addWord(id, {
        from: wordData.from,
        to: wordData.to,
        addedBy: req.isOwner ? 'author' : 'community'
      });
      
      if (word) {
        addedWords.push(word);
      } else {
        errors.push({ word: wordData, error: 'Failed to add' });
      }
    }
    
    res.status(201).json({
      success: true,
      message: `Added ${addedWords.length} words successfully`,
      added: addedWords.length,
      failed: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  listDictionaries,
  getDictionary,
  getDictionaryByName,
  createNewDictionary,
  updateDictionarySettings,
  removeDictionary,
  addWordToDictionary,
  updateWordInDictionary,
  removeWordFromDictionary,
  bulkAddWords
};
