const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { validateToken, canEditWords, canAccessDictionary } = require('./middleware');

/**
 * Public routes - no authentication required
 */

// Get list of all public dictionaries
// Query params: ?language=en&type=global
router.get('/list', controller.listDictionaries);

// Create new dictionary
// Returns: { id, token } - Save the token securely!
router.post('/', controller.createNewDictionary);

// Get dictionary by name
// Query params: ?language=en
router.get('/name/:name', controller.getDictionaryByName);

/**
 * Dictionary access routes - checks if public or requires token
 */

// Get dictionary details by ID
// Public dictionaries: no token needed
// Private dictionaries: requires token in header/query
router.get('/:id', canAccessDictionary, controller.getDictionary);

/**
 * Dictionary management routes - requires valid token
 */

// Update dictionary settings (name, description, isPublic, allowCommunityEdit)
// Requires: Authorization: Bearer <token> OR ?token=<token>
router.put('/:id', validateToken, controller.updateDictionarySettings);

// Delete dictionary
// Requires: Authorization: Bearer <token> OR ?token=<token>
router.delete('/:id', validateToken, controller.removeDictionary);

/**
 * Word management routes - checks allowCommunityEdit or requires token
 */

// Add word to dictionary
// Public + allowCommunityEdit=true: anyone can add
// Otherwise: requires token
router.post('/:id/words', canEditWords, controller.addWordToDictionary);

// Bulk add words
// Public + allowCommunityEdit=true: anyone can add
// Otherwise: requires token
router.post('/:id/words/bulk', canEditWords, controller.bulkAddWords);

// Update word
// Public + allowCommunityEdit=true: anyone can edit
// Otherwise: requires token
router.put('/:id/words/:wordId', canEditWords, controller.updateWordInDictionary);

// Delete word - only owner can delete
// Always requires token
router.delete('/:id/words/:wordId', validateToken, controller.removeWordFromDictionary);

module.exports = router;
