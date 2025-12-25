const { findDictionaryById } = require('./schema');

/**
 * Middleware to validate dictionary token
 * Usage: router.put('/dictionaries/:id', validateToken, controller.update)
 */
async function validateToken(req, res, next) {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token || req.query.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token required. Please provide token in Authorization header, body, or query parameter.'
      });
    }
    
    const dictionary = await findDictionaryById(id);
    
    if (!dictionary) {
      return res.status(404).json({
        success: false,
        error: 'Dictionary not found'
      });
    }
    
    if (dictionary.token !== token) {
      return res.status(403).json({
        success: false,
        error: 'Invalid token. You do not have permission to perform this action.'
      });
    }
    
    // Attach dictionary to request for use in controller
    req.dictionary = dictionary;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Middleware to check if user can edit words
 * Allows if: 
 * - Dictionary is public AND allowCommunityEdit is true
 * - OR valid token is provided
 */
async function canEditWords(req, res, next) {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token || req.query.token;
    
    const dictionary = await findDictionaryById(id);
    
    if (!dictionary) {
      return res.status(404).json({
        success: false,
        error: 'Dictionary not found'
      });
    }
    
    // Check if it's the owner (has valid token)
    const isOwner = token && dictionary.token === token;
    
    // Check if community can edit
    const canCommunityEdit = dictionary.isPublic && dictionary.allowCommunityEdit;
    
    if (!isOwner && !canCommunityEdit) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied. This dictionary does not allow community edits. Token required.'
      });
    }
    
    // Attach info to request
    req.dictionary = dictionary;
    req.isOwner = isOwner;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

/**
 * Middleware to check if user can access dictionary
 * - Public dictionaries: anyone
 * - Private dictionaries: requires token
 */
async function canAccessDictionary(req, res, next) {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body.token || req.query.token;
    
    const dictionary = await findDictionaryById(id);
    
    if (!dictionary) {
      return res.status(404).json({
        success: false,
        error: 'Dictionary not found'
      });
    }
    
    // If public, allow access
    if (dictionary.isPublic) {
      req.dictionary = dictionary;
      return next();
    }
    
    // If private, check token
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'This is a private dictionary. Token required.'
      });
    }
    
    if (dictionary.token !== token) {
      return res.status(403).json({
        success: false,
        error: 'Invalid token for private dictionary.'
      });
    }
    
    req.dictionary = dictionary;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}

module.exports = {
  validateToken,
  canEditWords,
  canAccessDictionary
};
