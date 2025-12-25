# TextFlow 🚀

**Powerful text transformation API with community-driven dictionaries**

Transform formal text into natural, casual language with custom phrase dictionaries. Built for automation tools, content creators, and developers who need flexible text transformation across multiple languages.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-brightgreen.svg)](https://www.mongodb.com)

---

## 🌟 Features

### Core Capabilities
- 🌍 **Multi-language Support**: English, Persian, Spanish, Portuguese
- 📚 **Global Dictionaries**: Community-maintained phrase collections
- 🔧 **Custom Dictionaries**: Create private or public phrase libraries
- 🔐 **Token-based Access**: Secure dictionary ownership and management
- 🤝 **Community Editing**: Optional collaborative dictionary building
- 📦 **Bulk Operations**: Import/export hundreds of phrases at once
- 🔄 **RESTful API**: Easy integration with any platform

### Integrations
- ✅ Google Docs Add-on
- ✅ n8n workflows
- ✅ Zapier/Make.com
- ✅ Custom applications via REST API

---

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [API Documentation](#-api-documentation)
  - [Text Transformation](#1-text-transformation-api)
  - [Dictionary Management](#2-dictionary-management-api)
  - [Word Management](#3-word-management-api)
- [Usage Examples](#-usage-examples)
- [Authentication](#-authentication)
- [Google Docs Add-on](#-google-docs-add-on)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/xoxxel/TextFlow.git
cd TextFlow

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start the server
npm start
```

Server will be running at `http://localhost:3000`

---

## 📦 Installation

### Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
Mongodb_url="mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority"

# Optional: PostgreSQL (for future use)
DB_url="postgresql://user:password@host:5432/database"
```

### Dependencies

```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "mongodb": "^7.0.0",
  "uuid": "^13.0.0",
  "dotenv": "^17.2.3"
}
```

---

## 📖 API Documentation

### Base URL
```
Development: http://localhost:3000/api
Production: https://textflow.serpify.dev/api
```

---

## 1. Text Transformation API

### Transform Text
Transform text using global or custom dictionaries.

**Endpoint:** `POST /api/transform`

**Request Body:**
```json
{
  "text": "At this point in time, we need to utilize advanced technology.",
  "lang": "en",
  "dictionaryId": "optional-custom-dictionary-id"
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| text | string | Yes | Text to transform |
| lang | string | Yes | Language code: `en`, `fa`, `es`, `pt` |
| dictionaryId | string | No | Custom dictionary ID (uses global if not provided) |
| token | string | No | Required for private dictionaries |

**Response:**
```json
{
  "original": "At this point in time, we need to utilize advanced technology.",
  "result": "Right now, we need to use advanced technology.",
  "replacements": 2,
  "language": "en"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/transform \
  -H "Content-Type: application/json" \
  -d '{
    "text": "We need to leverage synergy to facilitate growth",
    "lang": "en"
  }'
```

---

## 2. Dictionary Management API

### List Public Dictionaries
Get all public dictionaries available for use.

**Endpoint:** `GET /api/dictionaries/list`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| language | string | Filter by language: `en`, `fa`, `es`, `pt` |
| type | string | Filter by type: `global`, `custom` |

**Response:**
```json
{
  "success": true,
  "count": 3,
  "dictionaries": [
    {
      "id": "uuid-123",
      "name": "Business Terminology",
      "description": "Professional business phrases simplified",
      "language": "en",
      "author": "John Doe",
      "type": "custom",
      "isPublic": true,
      "allowCommunityEdit": true,
      "stats": {
        "wordCount": 150,
        "usageCount": 523,
        "createdAt": "2025-12-25T00:00:00.000Z",
        "updatedAt": "2025-12-25T10:30:00.000Z"
      }
    }
  ]
}
```

**Example:**
```bash
# Get all public English dictionaries
curl http://localhost:3000/api/dictionaries/list?language=en

# Get all global dictionaries
curl http://localhost:3000/api/dictionaries/list?type=global
```

---

### Get Dictionary by ID
Retrieve a specific dictionary with all its words.

**Endpoint:** `GET /api/dictionaries/:id`

**Headers (for private dictionaries):**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "dictionary": {
    "id": "uuid-123",
    "name": "Marketing Terms",
    "description": "Marketing jargon simplified",
    "language": "en",
    "author": "Jane Smith",
    "type": "custom",
    "isPublic": true,
    "allowCommunityEdit": true,
    "words": [
      {
        "id": "word-uuid-1",
        "from": "leverage",
        "to": "use",
        "addedBy": "author",
        "createdAt": "2025-12-25T00:00:00.000Z"
      }
    ],
    "stats": {
      "wordCount": 45,
      "usageCount": 120
    }
  }
}
```

**Example:**
```bash
# Public dictionary
curl http://localhost:3000/api/dictionaries/uuid-123

# Private dictionary (requires token)
curl http://localhost:3000/api/dictionaries/uuid-456 \
  -H "Authorization: Bearer your-token-here"
```

---

### Get Dictionary by Name
Find a dictionary using its name.

**Endpoint:** `GET /api/dictionaries/name/:name`

**Example:**
```bash
curl http://localhost:3000/api/dictionaries/name/Business%20Terminology
```

---

### Create Dictionary
Create a new custom dictionary.

**Endpoint:** `POST /api/dictionaries`

**Request Body:**
```json
{
  "name": "Tech Startup Lingo",
  "description": "Common phrases used in tech startups",
  "language": "en",
  "author": "Your Name",
  "type": "custom",
  "isPublic": true,
  "allowCommunityEdit": true
}
```

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| name | string | Yes | - | Dictionary name (unique) |
| description | string | No | "" | Dictionary description |
| language | string | Yes | - | Language: `en`, `fa`, `es`, `pt` |
| author | string | No | "Anonymous" | Creator name |
| type | string | No | "custom" | Type: `global`, `custom` |
| isPublic | boolean | No | true | Visible in public list |
| allowCommunityEdit | boolean | No | false | Allow anyone to add/edit words |

**Response:**
```json
{
  "success": true,
  "message": "Dictionary created successfully",
  "dictionary": {
    "id": "7baefe0f-6431-4cf0-a1de-91cc6def8361",
    "name": "Tech Startup Lingo",
    "token": "a17c9fd5-c2d5-426e-96f5-ca5ece8ab4d3",
    "language": "en",
    "isPublic": true,
    "allowCommunityEdit": true
  }
}
```

⚠️ **Important:** Save the `token`! You'll need it to manage this dictionary.

**Example:**
```bash
curl -X POST http://localhost:3000/api/dictionaries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tech Startup Lingo",
    "description": "Startup buzzwords simplified",
    "language": "en",
    "author": "John Doe",
    "isPublic": true,
    "allowCommunityEdit": true
  }'
```

---

### Update Dictionary Settings
Update dictionary metadata (requires token).

**Endpoint:** `PUT /api/dictionaries/:id`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "New description",
  "isPublic": false,
  "allowCommunityEdit": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dictionary updated successfully"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/api/dictionaries/uuid-123 \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "allowCommunityEdit": false
  }'
```

---

### Delete Dictionary
Permanently delete a dictionary (requires token).

**Endpoint:** `DELETE /api/dictionaries/:id`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Dictionary deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/dictionaries/uuid-123 \
  -H "Authorization: Bearer your-token"
```

---

## 3. Word Management API

### Add Word
Add a single word/phrase to a dictionary.

**Endpoint:** `POST /api/dictionaries/:id/words`

**Headers (optional):**
```
Authorization: Bearer YOUR_TOKEN
```

**Request Body:**
```json
{
  "from": "utilize",
  "to": "use"
}
```

**Authorization Rules:**
- ✅ **Public + Community Edit Enabled:** Anyone can add
- 🔐 **Public + Community Edit Disabled:** Token required
- 🔐 **Private:** Token required

**Response:**
```json
{
  "success": true,
  "message": "Word added successfully",
  "word": {
    "id": "word-uuid",
    "from": "utilize",
    "to": "use"
  }
}
```

**Example:**
```bash
# Add to public dictionary with community edit enabled (no token needed)
curl -X POST http://localhost:3000/api/dictionaries/uuid-123/words \
  -H "Content-Type: application/json" \
  -d '{
    "from": "leverage",
    "to": "use"
  }'

# Add to private dictionary (token required)
curl -X POST http://localhost:3000/api/dictionaries/uuid-456/words \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "synergy",
    "to": "collaboration"
  }'
```

---

### Bulk Add Words
Add multiple words at once.

**Endpoint:** `POST /api/dictionaries/:id/words/bulk`

**Request Body:**
```json
{
  "words": [
    { "from": "leverage", "to": "use" },
    { "from": "synergy", "to": "collaboration" },
    { "from": "paradigm shift", "to": "big change" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added 3 words successfully",
  "added": 3,
  "failed": 0
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/dictionaries/uuid-123/words/bulk \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "words": [
      {"from": "utilize", "to": "use"},
      {"from": "facilitate", "to": "help"},
      {"from": "optimize", "to": "improve"}
    ]
  }'
```

---

### Update Word
Edit an existing word/phrase.

**Endpoint:** `PUT /api/dictionaries/:id/words/:wordId`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN (if community edit is disabled)
```

**Request Body:**
```json
{
  "from": "leverage",
  "to": "use effectively"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Word updated successfully"
}
```

**Example:**
```bash
curl -X PUT http://localhost:3000/api/dictionaries/uuid-123/words/word-uuid-456 \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "leverage",
    "to": "use strategically"
  }'
```

---

### Delete Word
Remove a word from dictionary (requires token).

**Endpoint:** `DELETE /api/dictionaries/:id/words/:wordId`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Word deleted successfully"
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3000/api/dictionaries/uuid-123/words/word-uuid-456 \
  -H "Authorization: Bearer your-token"
```

---

## 💡 Usage Examples

### Example 1: Basic Text Transformation

```javascript
const response = await fetch('http://localhost:3000/api/transform', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'We need to utilize our resources to facilitate growth',
    lang: 'en'
  })
});

const result = await response.json();
console.log(result.result);
// Output: "We need to use our resources to help growth"
```

---

### Example 2: Create and Use Custom Dictionary

```javascript
// Step 1: Create dictionary
const createRes = await fetch('http://localhost:3000/api/dictionaries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Company Jargon',
    language: 'en',
    author: 'John Doe',
    isPublic: false,
    allowCommunityEdit: false
  })
});

const { dictionary } = await createRes.json();
const { id, token } = dictionary;

// Step 2: Add words
await fetch(`http://localhost:3000/api/dictionaries/${id}/words/bulk`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    words: [
      { from: 'blue sky thinking', to: 'creative ideas' },
      { from: 'circle back', to: 'follow up' },
      { from: 'bandwidth', to: 'time' }
    ]
  })
});

// Step 3: Use custom dictionary
const transformRes = await fetch('http://localhost:3000/api/transform', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    text: "Let's do some blue sky thinking and circle back when we have more bandwidth",
    lang: 'en',
    dictionaryId: id
  })
});

const result = await transformRes.json();
console.log(result.result);
// Output: "Let's do some creative ideas and follow up when we have more time"
```

---

### Example 3: n8n Integration

```json
{
  "nodes": [
    {
      "parameters": {
        "url": "http://localhost:3000/api/transform",
        "method": "POST",
        "bodyParametersJson": {
          "text": "={{ $json.emailBody }}",
          "lang": "en"
        }
      },
      "name": "Transform Email Text",
      "type": "n8n-nodes-base.httpRequest"
    }
  ]
}
```

---

### Example 4: PowerShell

```powershell
# Transform text
$body = @{
    text = "We need to leverage synergy to optimize our workflow"
    lang = "en"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/transform' `
    -Method Post `
    -Body $body `
    -ContentType 'application/json'

Write-Host $response.result
```

---

### Example 5: Python

```python
import requests

# Transform text
response = requests.post(
    'http://localhost:3000/api/transform',
    json={
        'text': 'We need to utilize advanced technology',
        'lang': 'en'
    }
)

result = response.json()
print(result['result'])
# Output: "We need to use advanced technology"
```

---

## 🔐 Authentication

### Token Types

TextFlow uses two types of authentication:

1. **No Authentication**: Public dictionaries with community edit enabled
2. **Bearer Token**: For dictionary ownership and private dictionaries

### Using Tokens

**Method 1: Authorization Header (Recommended)**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/dictionaries/uuid-123
```

**Method 2: Query Parameter**
```bash
curl http://localhost:3000/api/dictionaries/uuid-123?token=YOUR_TOKEN
```

**Method 3: Request Body**
```bash
curl -X POST http://localhost:3000/api/dictionaries/uuid-123/words \
  -H "Content-Type: application/json" \
  -d '{"from": "test", "to": "demo", "token": "YOUR_TOKEN"}'
```

### Authorization Rules

| Action | Public + Community Edit | Public + No Community Edit | Private |
|--------|------------------------|---------------------------|---------|
| View dictionary | ✅ No token | ✅ No token | 🔐 Token required |
| Use in /api/transform | ✅ No token | ✅ No token | 🔐 Token required |
| Add words | ✅ No token | 🔐 Token required | 🔐 Token required |
| Edit words | ✅ No token | 🔐 Token required | 🔐 Token required |
| Update settings | 🔐 Token required | 🔐 Token required | 🔐 Token required |
| Delete dictionary | 🔐 Token required | 🔐 Token required | 🔐 Token required |
| Delete words | 🔐 Token required | 🔐 Token required | 🔐 Token required |

---

## 📱 Google Docs Add-on

### Installation

1. Open Google Docs
2. Extensions → Apps Script
3. Copy code from `add-on/api-method.js`
4. Save and refresh document

### Usage

1. **TextFlow → Transform Text**: Transform all formal text
2. **TextFlow → Preview**: See what will change
3. **TextFlow → Add New Words**: Contribute to community dictionary

### Configuration

Edit the script to use your custom dictionary:

```javascript
const API_BASE_URL = 'https://your-domain.com/api';
const DEFAULT_DICTIONARY_ID = 'your-custom-dictionary-id';
const YOUR_TOKEN = 'your-token-here'; // For private dictionaries
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

1. **Add Words**: Contribute to global dictionaries
2. **Report Bugs**: Open issues on GitHub
3. **Suggest Features**: Share your ideas
4. **Submit PRs**: Improve code or documentation
5. **Create Dictionaries**: Share useful phrase collections

### Development Setup

```bash
# Fork and clone
git clone https://github.com/your-username/TextFlow.git
cd TextFlow

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run in development mode
npm run dev
```

### Coding Standards

- Use ES6+ features
- Follow existing code style
- Add comments for complex logic
- Write descriptive commit messages
- Test before submitting PRs

---

## 📊 Project Structure

```
TextFlow/
├── server.js                      # Main Express server
├── package.json                   # Dependencies and scripts
├── .env                          # Environment variables (create this)
├── README.md                     # This file
│
├── dictionary/                   # Global dictionary files
│   ├── en.json                  # English phrases
│   ├── fa.json                  # Persian phrases
│   ├── es.json                  # Spanish phrases
│   └── pt.json                  # Portuguese phrases
│
├── custom-dictionaries/          # Custom dictionary module
│   ├── schema.js                # MongoDB schema and operations
│   ├── controller.js            # Business logic
│   ├── routes.js                # API endpoints
│   └── middleware.js            # Authentication middleware
│
└── add-on/                       # Google Docs integration
    ├── api-method.js            # Uses API (recommended)
    └── local-setup.js           # Uses Google Sheets
```

---

## 🐛 Troubleshooting

### Server won't start

```bash
# Check MongoDB connection
node -e "require('dotenv').config(); console.log(process.env.Mongodb_url)"

# Verify all dependencies installed
npm install

# Check port 3000 is available
netstat -ano | findstr :3000
```

### "Token required" errors

- Ensure you're using the correct token
- Check token format: `Bearer YOUR_TOKEN` in Authorization header
- Verify dictionary is not set to private without providing token

### Dictionary not found

- Verify dictionary ID is correct
- Check if dictionary is public (use `/api/dictionaries/list`)
- For private dictionaries, ensure token is provided

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🔗 Links

- **GitHub**: https://github.com/xoxxel/TextFlow
- **Author**: [xoxxel](https://serpify.dev)
- **Issues**: https://github.com/xoxxel/TextFlow/issues

---

## 📞 Support

- 📧 Email: support@serpify.dev
- 🐛 Issues: [GitHub Issues](https://github.com/xoxxel/TextFlow/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/xoxxel/TextFlow/discussions)

---

**Made with ❤️ by [xoxxel](https://serpify.dev)**

*Simplifying text transformation, one phrase at a time.*
