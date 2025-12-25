# n8n Workflow Example: Humanize Text

This example shows how to use the Humanize Text API in n8n automation workflows.

## Simple Text Humanization

### Workflow Nodes:

1. **Webhook / Trigger**
   - Receives text input

2. **HTTP Request Node**
   - Method: `POST`
   - URL: `https://humanize.serpify.dev/api/humanize`
   - Body (JSON):
     ```json
     {
       "text": "{{ $json.content }}",
       "lang": "en"
     }
     ```
   - Headers:
     ```
     Content-Type: application/json
     ```

3. **Code/Function Node** (Optional - Extract humanized text)
   ```javascript
   return {
     original: $input.item.json.original,
     humanized: $input.item.json.humanized,
     changes: $input.item.json.totalChanges,
     details: $input.item.json.replacements
   };
   ```

4. **Output Node**
   - Use `{{ $json.humanized }}` to get the final text

---

## Advanced: Email Humanization Pipeline

### Use Case: 
Automatically humanize formal emails before sending them to customers.

### Workflow:

```
Gmail Trigger → HTTP Request (Humanize API) → Gmail Send
```

### HTTP Request Configuration:

**URL:** `https://humanize.serpify.dev/api/humanize`

**Method:** POST

**Body:**
```json
{
  "text": "{{ $json.body }}",
  "lang": "en"
}
```

**Response Handling:**
```
Humanized Email Body: {{ $json.humanized }}
Total Improvements: {{ $json.totalChanges }}
```

---

## Content Publishing Pipeline

### Use Case:
Humanize blog posts before publishing to WordPress/Medium

### Workflow:

```
Google Docs Trigger → HTTP Request (Humanize API) → WordPress Post
```

### Configuration:

1. **Google Docs Trigger**
   - Monitors document updates
   - Extracts content

2. **HTTP Request**
   - URL: `https://humanize.serpify.dev/api/humanize`
   - Body:
     ```json
     {
       "text": "{{ $json.content }}",
       "lang": "en"
     }
     ```

3. **WordPress Node**
   - Title: `{{ $json.title }}`
   - Content: `{{ $('HTTP Request').item.json.humanized }}`
   - Status: Publish

---

## Multi-Language Support

### Process documents in different languages:

```json
{
  "text": "{{ $json.content }}",
  "lang": "{{ $json.language }}"
}
```

**Supported Languages:**
- `en` - English
- `fa` - Persian (فارسی)
- `es` - Spanish (Español)
- `pt` - Portuguese (Português)

---

## Error Handling

Add an **IF Node** after HTTP Request:

```javascript
// Check if request was successful
{{ $json.humanized !== undefined }}
```

**True Branch:** Continue workflow  
**False Branch:** Send error notification

---

## Rate Limiting & Best Practices

1. **Add delay between requests** (100-500ms) for batch processing
2. **Cache results** for frequently used texts
3. **Handle errors gracefully** with retry logic
4. **Monitor API responses** for status codes

---

## Example Response:

```json
{
  "original": "At this point in time, we need to utilize...",
  "humanized": "Now, we need to use...",
  "replacements": [
    {
      "from": "at this point in time",
      "to": "now",
      "count": 1
    },
    {
      "from": "utilize",
      "to": "use",
      "count": 1
    }
  ],
  "totalChanges": 2,
  "language": "en"
}
```

---

## Complete n8n Workflow JSON

Import this into n8n:

```json
{
  "nodes": [
    {
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "httpMethod": "POST",
        "path": "humanize",
        "responseMode": "responseNode"
      }
    },
    {
      "name": "Humanize Text API",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "method": "POST",
        "url": "https://humanize.serpify.dev/api/humanize",
        "jsonParameters": true,
        "options": {},
        "bodyParametersJson": "={\"text\": \"{{ $json.text }}\", \"lang\": \"{{ $json.lang || 'en' }}\"}"
      }
    },
    {
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [650, 300],
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ $json }}"
      }
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Humanize Text API", "type": "main", "index": 0 }]]
    },
    "Humanize Text API": {
      "main": [[{ "node": "Respond to Webhook", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## Testing Your Workflow

**cURL Command:**
```bash
curl -X POST https://your-n8n-instance.com/webhook/humanize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "At this point in time, we need to utilize advanced technology in order to improve efficiency.",
    "lang": "en"
  }'
```

**Expected Result:**
```json
{
  "humanized": "Now, we need to use advanced technology to improve efficiency.",
  "totalChanges": 3
}
```

---

## Support

Need help? [Open an issue](https://github.com/xoxxel/Humanize-Text/issues) on GitHub!
