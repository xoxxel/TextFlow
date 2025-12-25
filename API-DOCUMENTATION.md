# TextFlow API Documentation

Complete API reference for TextFlow text transformation platform.

## Base URL

```
Development: http://localhost:3000/api
Production: https://textflow.serpify.dev/api
```

## Authentication

TextFlow supports multiple authentication methods for flexibility:

### 1. Authorization Header (Recommended)
```http
Authorization: Bearer YOUR_TOKEN_HERE
```

### 2. Query Parameter
```
GET /api/dictionaries/uuid-123?token=YOUR_TOKEN_HERE
```

### 3. Request Body
```json
{
  "token": "YOUR_TOKEN_HERE",
  "other": "parameters"
}
```

---

## API Endpoints Overview

### Text Transformation
- `POST /api/transform` - Transform text using dictionaries

### Dictionary Management
- `GET /api/dictionaries/list` - List all public dictionaries
- `GET /api/dictionaries/:id` - Get dictionary by ID
- `GET /api/dictionaries/name/:name` - Get dictionary by name
- `POST /api/dictionaries` - Create new dictionary
- `PUT /api/dictionaries/:id` - Update dictionary settings
- `DELETE /api/dictionaries/:id` - Delete dictionary

### Word Management
- `POST /api/dictionaries/:id/words` - Add single word
- `POST /api/dictionaries/:id/words/bulk` - Bulk add words
- `PUT /api/dictionaries/:id/words/:wordId` - Update word
- `DELETE /api/dictionaries/:id/words/:wordId` - Delete word

---

## Detailed Endpoint Reference

### POST /api/transform

Transform text using global or custom dictionaries.

**Request:**
```http
POST /api/transform
Content-Type: application/json

{
  "text": "We need to leverage synergy to facilitate growth",
  "lang": "en",
  "dictionaryId": "optional-uuid",
  "token": "optional-for-private-dicts"
}
```

**Response:**
```json
{
  "original": "We need to leverage synergy to facilitate growth",
  "result": "We need to use collaboration to help growth",
  "replacements": 3,
  "language": "en"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request body
- `401` - Token required for private dictionary
- `404` - Dictionary not found
- `500` - Server error

---

### GET /api/dictionaries/list

List all public dictionaries.

**Request:**
```http
GET /api/dictionaries/list?language=en&type=custom
```

**Query Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| language | string | No | Filter by language (en, fa, es, pt) |
| type | string | No | Filter by type (global, custom) |

**Response:**
```json
{
  "success": true,
  "count": 2,
  "dictionaries": [
    {
      "id": "uuid-123",
      "name": "Business Terms",
      "description": "Business jargon simplified",
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

---

### GET /api/dictionaries/:id

Get dictionary with all words.

**Request:**
```http
GET /api/dictionaries/7baefe0f-6431-4cf0-a1de-91cc6def8361
Authorization: Bearer TOKEN_FOR_PRIVATE_DICT
```

**Response:**
```json
{
  "success": true,
  "dictionary": {
    "id": "7baefe0f-6431-4cf0-a1de-91cc6def8361",
    "name": "Marketing Terms",
    "description": "Marketing jargon simplified",
    "language": "en",
    "author": "Jane Smith",
    "type": "custom",
    "isPublic": true,
    "allowCommunityEdit": false,
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
      "usageCount": 120,
      "createdAt": "2025-12-24T00:00:00.000Z",
      "updatedAt": "2025-12-25T00:00:00.000Z"
    }
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Token required (private dictionary)
- `404` - Dictionary not found

---

### POST /api/dictionaries

Create a new dictionary.

**Request:**
```http
POST /api/dictionaries
Content-Type: application/json

{
  "name": "Tech Startup Lingo",
  "description": "Startup buzzwords simplified",
  "language": "en",
  "author": "John Doe",
  "type": "custom",
  "isPublic": true,
  "allowCommunityEdit": true
}
```

**Required Fields:**
| Field | Type | Description |
|-------|------|-------------|
| name | string | Unique dictionary name |
| language | string | Language code (en, fa, es, pt) |

**Optional Fields:**
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| description | string | "" | Dictionary description |
| author | string | "Anonymous" | Creator name |
| type | string | "custom" | Dictionary type |
| isPublic | boolean | true | Show in public list |
| allowCommunityEdit | boolean | false | Allow community contributions |

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

⚠️ **IMPORTANT:** Save the `token`! It cannot be retrieved later.

---

### PUT /api/dictionaries/:id

Update dictionary settings (token required).

**Request:**
```http
PUT /api/dictionaries/uuid-123
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "New description",
  "isPublic": false,
  "allowCommunityEdit": false
}
```

**Updatable Fields:**
- `name` - Dictionary name
- `description` - Dictionary description
- `isPublic` - Visibility in public list
- `allowCommunityEdit` - Community contribution setting

**Response:**
```json
{
  "success": true,
  "message": "Dictionary updated successfully"
}
```

**Status Codes:**
- `200` - Success
- `401` - Token required
- `403` - Invalid token
- `404` - Dictionary not found

---

### DELETE /api/dictionaries/:id

Delete dictionary permanently (token required).

**Request:**
```http
DELETE /api/dictionaries/uuid-123
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Dictionary deleted successfully"
}
```

⚠️ **WARNING:** This action is permanent and cannot be undone.

---

### POST /api/dictionaries/:id/words

Add a word to dictionary.

**Request:**
```http
POST /api/dictionaries/uuid-123/words
Authorization: Bearer TOKEN_IF_NEEDED
Content-Type: application/json

{
  "from": "utilize",
  "to": "use"
}
```

**Authorization Requirements:**
| Dictionary Type | Community Edit | Token Required |
|----------------|----------------|----------------|
| Public | Enabled | ❌ No |
| Public | Disabled | ✅ Yes |
| Private | Any | ✅ Yes |

**Response:**
```json
{
  "success": true,
  "message": "Word added successfully",
  "word": {
    "id": "word-uuid-123",
    "from": "utilize",
    "to": "use"
  }
}
```

---

### POST /api/dictionaries/:id/words/bulk

Add multiple words at once.

**Request:**
```http
POST /api/dictionaries/uuid-123/words/bulk
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "words": [
    { "from": "leverage", "to": "use" },
    { "from": "synergy", "to": "collaboration" },
    { "from": "paradigm shift", "to": "big change" },
    { "from": "utilize", "to": "use" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added 4 words successfully",
  "added": 4,
  "failed": 0
}
```

**Error Response (partial success):**
```json
{
  "success": true,
  "message": "Added 3 words successfully",
  "added": 3,
  "failed": 1,
  "invalidWords": [
    {
      "index": 2,
      "errors": ["Word 'from' field is required"]
    }
  ]
}
```

---

### PUT /api/dictionaries/:id/words/:wordId

Update an existing word.

**Request:**
```http
PUT /api/dictionaries/uuid-123/words/word-uuid-456
Authorization: Bearer TOKEN_IF_NEEDED
Content-Type: application/json

{
  "from": "leverage",
  "to": "use strategically"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Word updated successfully"
}
```

---

### DELETE /api/dictionaries/:id/words/:wordId

Delete a word from dictionary (token required).

**Request:**
```http
DELETE /api/dictionaries/uuid-123/words/word-uuid-456
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Word deleted successfully"
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid request | Missing or invalid parameters |
| 401 | Token required | Authentication needed but not provided |
| 403 | Access denied | Invalid token or insufficient permissions |
| 404 | Not found | Resource doesn't exist |
| 500 | Server error | Internal server error |

---

## Rate Limiting

Currently no rate limiting is implemented. For production use, consider:
- 100 requests per minute per IP
- 1000 requests per hour per token
- 10 dictionary creations per day per IP

---

## Best Practices

### 1. Token Security
- Never commit tokens to version control
- Store tokens securely (environment variables, secrets manager)
- Rotate tokens if compromised
- Use HTTPS in production

### 2. Request Optimization
- Use bulk operations when adding multiple words
- Cache dictionary data when possible
- Filter list requests by language/type
- Implement retry logic with exponential backoff

### 3. Error Handling
```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error appropriately
}
```

### 4. Testing
```javascript
// Always test with both scenarios
const tests = [
  { token: null, shouldFail: false }, // Public access
  { token: validToken, shouldFail: false }, // Authorized
  { token: invalidToken, shouldFail: true } // Unauthorized
];
```

---

## Integration Examples

### JavaScript / Node.js

```javascript
const TextFlowAPI = {
  baseURL: 'http://localhost:3000/api',
  token: null,

  setToken(token) {
    this.token = token;
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });

    return response.json();
  },

  async transform(text, lang, dictionaryId = null) {
    return this.request('/transform', {
      method: 'POST',
      body: JSON.stringify({ text, lang, dictionaryId })
    });
  },

  async listDictionaries(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/dictionaries/list?${params}`);
  },

  async createDictionary(data) {
    return this.request('/dictionaries', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

// Usage
const result = await TextFlowAPI.transform(
  'We need to leverage synergy',
  'en'
);
console.log(result.result);
```

### Python

```python
import requests

class TextFlowAPI:
    def __init__(self, base_url='http://localhost:3000/api', token=None):
        self.base_url = base_url
        self.token = token
    
    def _headers(self):
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        return headers
    
    def transform(self, text, lang, dictionary_id=None):
        data = {'text': text, 'lang': lang}
        if dictionary_id:
            data['dictionaryId'] = dictionary_id
        
        response = requests.post(
            f'{self.base_url}/transform',
            json=data,
            headers=self._headers()
        )
        return response.json()
    
    def list_dictionaries(self, language=None, type=None):
        params = {}
        if language:
            params['language'] = language
        if type:
            params['type'] = type
        
        response = requests.get(
            f'{self.base_url}/dictionaries/list',
            params=params,
            headers=self._headers()
        )
        return response.json()

# Usage
api = TextFlowAPI()
result = api.transform('We need to leverage synergy', 'en')
print(result['result'])
```

### PHP

```php
<?php

class TextFlowAPI {
    private $baseURL;
    private $token;
    
    public function __construct($baseURL = 'http://localhost:3000/api', $token = null) {
        $this->baseURL = $baseURL;
        $this->token = $token;
    }
    
    private function request($endpoint, $method = 'GET', $data = null) {
        $headers = ['Content-Type: application/json'];
        
        if ($this->token) {
            $headers[] = 'Authorization: Bearer ' . $this->token;
        }
        
        $ch = curl_init($this->baseURL . $endpoint);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        
        if ($method !== 'GET') {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        }
        
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
    
    public function transform($text, $lang, $dictionaryId = null) {
        $data = ['text' => $text, 'lang' => $lang];
        if ($dictionaryId) {
            $data['dictionaryId'] = $dictionaryId;
        }
        
        return $this->request('/transform', 'POST', $data);
    }
}

// Usage
$api = new TextFlowAPI();
$result = $api->transform('We need to leverage synergy', 'en');
echo $result['result'];
?>
```

---

## Postman Collection

Import this JSON into Postman for testing:

```json
{
  "info": {
    "name": "TextFlow API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "token",
      "value": "your-token-here"
    }
  ],
  "item": [
    {
      "name": "Transform Text",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/transform",
        "body": {
          "mode": "raw",
          "raw": "{\"text\": \"We need to leverage synergy\", \"lang\": \"en\"}"
        }
      }
    },
    {
      "name": "List Dictionaries",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/dictionaries/list"
      }
    },
    {
      "name": "Create Dictionary",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/dictionaries",
        "body": {
          "mode": "raw",
          "raw": "{\"name\": \"Test Dict\", \"language\": \"en\"}"
        }
      }
    }
  ]
}
```

---

## Support

- **Documentation**: https://github.com/xoxxel/TextFlow
- **Issues**: https://github.com/xoxxel/TextFlow/issues
- **Email**: support@serpify.dev
