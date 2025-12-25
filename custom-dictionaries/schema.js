const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

let db = null;
let client = null;

/**
 * Connect to MongoDB database
 */
async function connectDB() {
  if (db) return db;
  
  try {
    client = new MongoClient(process.env.Mongodb_url);
    await client.connect();
    db = client.db('humanize_db');
    
    // Create indexes for better performance
    await db.collection('dictionaries').createIndex({ id: 1 }, { unique: true });
    await db.collection('dictionaries').createIndex({ name: 1 });
    await db.collection('dictionaries').createIndex({ language: 1 });
    await db.collection('dictionaries').createIndex({ isPublic: 1 });
    await db.collection('dictionaries').createIndex({ type: 1 });
    
    console.log('✅ MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Get database instance
 */
function getDB() {
  if (!db) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return db;
}

/**
 * Close database connection
 */
async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 MongoDB connection closed');
  }
}

/**
 * Create a new dictionary
 */
async function createDictionary(data) {
  const db = getDB();
  const dictionary = {
    id: uuidv4(),
    name: data.name,
    description: data.description || '',
    language: data.language || 'en',
    author: data.author || 'Anonymous',
    type: data.type || 'custom',
    token: uuidv4(), // Secret token for owner
    isPublic: data.isPublic !== undefined ? data.isPublic : true,
    allowCommunityEdit: data.type === 'global' ? true : (data.allowCommunityEdit !== undefined ? data.allowCommunityEdit : false),
    words: [],
    stats: {
      wordCount: 0,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };
  
  await db.collection('dictionaries').insertOne(dictionary);
  return dictionary;
}

/**
 * Find dictionary by ID
 */
async function findDictionaryById(id) {
  const db = getDB();
  return await db.collection('dictionaries').findOne({ id });
}

/**
 * Find dictionary by name and language
 */
async function findDictionaryByName(name, language) {
  const db = getDB();
  return await db.collection('dictionaries').findOne({ name, language });
}

/**
 * Get all public dictionaries
 */
async function getPublicDictionaries(filters = {}) {
  const db = getDB();
  const query = { isPublic: true };
  
  if (filters.language) {
    query.language = filters.language;
  }
  
  if (filters.type) {
    query.type = filters.type;
  }
  
  return await db.collection('dictionaries').find(query)
    .project({ token: 0 }) // Don't return token in list
    .toArray();
}

/**
 * Update dictionary settings (requires token)
 */
async function updateDictionary(id, updates) {
  const db = getDB();
  const allowedUpdates = {
    name: updates.name,
    description: updates.description,
    isPublic: updates.isPublic,
    allowCommunityEdit: updates.allowCommunityEdit
  };
  
  // Remove undefined values
  Object.keys(allowedUpdates).forEach(key => 
    allowedUpdates[key] === undefined && delete allowedUpdates[key]
  );
  
  allowedUpdates['stats.updatedAt'] = new Date().toISOString();
  
  const result = await db.collection('dictionaries').updateOne(
    { id },
    { $set: allowedUpdates }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Delete dictionary (requires token)
 */
async function deleteDictionary(id) {
  const db = getDB();
  const result = await db.collection('dictionaries').deleteOne({ id });
  return result.deletedCount > 0;
}

/**
 * Add word to dictionary
 */
async function addWord(dictionaryId, wordData) {
  const db = getDB();
  const word = {
    id: uuidv4(),
    from: wordData.from,
    to: wordData.to,
    addedBy: wordData.addedBy || 'community',
    createdAt: new Date().toISOString()
  };
  
  const result = await db.collection('dictionaries').updateOne(
    { id: dictionaryId },
    { 
      $push: { words: word },
      $inc: { 'stats.wordCount': 1 },
      $set: { 'stats.updatedAt': new Date().toISOString() }
    }
  );
  
  return result.modifiedCount > 0 ? word : null;
}

/**
 * Update word in dictionary
 */
async function updateWord(dictionaryId, wordId, updates) {
  const db = getDB();
  const result = await db.collection('dictionaries').updateOne(
    { id: dictionaryId, 'words.id': wordId },
    { 
      $set: { 
        'words.$.from': updates.from,
        'words.$.to': updates.to,
        'stats.updatedAt': new Date().toISOString()
      }
    }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Delete word from dictionary
 */
async function deleteWord(dictionaryId, wordId) {
  const db = getDB();
  const result = await db.collection('dictionaries').updateOne(
    { id: dictionaryId },
    { 
      $pull: { words: { id: wordId } },
      $inc: { 'stats.wordCount': -1 },
      $set: { 'stats.updatedAt': new Date().toISOString() }
    }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Increment usage count
 */
async function incrementUsage(dictionaryId) {
  const db = getDB();
  await db.collection('dictionaries').updateOne(
    { id: dictionaryId },
    { $inc: { 'stats.usageCount': 1 } }
  );
}

module.exports = {
  connectDB,
  getDB,
  closeDB,
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
};
