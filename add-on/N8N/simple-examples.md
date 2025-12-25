# TextFlow - n8n Simple Examples 🚀

Quick copy-paste cURL commands for n8n. Just use **"Import from cURL"** in HTTP Request nodes.

---

## 🎯 Basic Usage

### 1. Transform Text (Global Dictionary)

**Most common use case - no dictionary selection needed:**

```bash
curl --request POST \
  --url http://localhost:3000/api/transform \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "At this point in time, we need to utilize our resources.",
  "lang": "en"
}'
```

✅ **No `dictionaryId`? No problem! Uses Global Dictionary automatically.**

---

### 2. Transform with Your Dictionary

**First, get your dictionary ID:**

```bash
curl --request GET \
  --url http://localhost:3000/api/dictionaries/list \
  --header 'Content-Type: application/json'
```

**Then use it:**

```bash
curl --request POST \
  --url http://localhost:3000/api/transform \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "We need to leverage our core competencies.",
  "lang": "en",
  "dictionaryId": "YOUR-DICTIONARY-UUID-HERE"
}'
```

---

### 3. Transform with Public Dictionary

**Browse public dictionaries:**

```bash
curl --request GET \
  --url http://localhost:3000/api/dictionaries/list \
  --header 'Content-Type: application/json'
```

**Pick one and use its ID:**

```bash
curl --request POST \
  --url http://localhost:3000/api/transform \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "The aforementioned study demonstrates significant correlation.",
  "lang": "en",
  "dictionaryId": "a1b2c3d4-5678-90ab-cdef-1234567890ab"
}'
```

---

## 🌍 Multi-Language Examples

### Persian (Farsi)

```bash
curl --request POST \
  --url http://localhost:3000/api/transform \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "در نقطه زمانی فعلی، ما نیاز داریم که منابع را مورد استفاده قرار دهیم",
  "lang": "fa"
}'
```

### Spanish

```bash
curl --request POST \
  --url http://localhost:3000/api/transform \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "En este punto en el tiempo, necesitamos utilizar nuestros recursos",
  "lang": "es"
}'
```

### Portuguese

```bash
curl --request POST \
  --url http://localhost:3000/api/transform \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "Neste ponto no tempo, precisamos utilizar nossos recursos",
  "lang": "pt"
}'
```

---

## 📋 Simple Workflows

### Workflow 1: Webhook → Transform → Response

**Node 1: Webhook**
- Trigger on POST

**Node 2: HTTP Request (Import this)**
```bash
curl --request POST \
  --url http://localhost:3000/api/transform \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "{{$json.body.text}}",
  "lang": "{{$json.body.lang}}"
}'
```

**Node 3: Respond to Webhook**
- Return: `{{$json.result}}`

---

### Workflow 2: Email → Transform → Send

**Node 1: Email Trigger (IMAP)**
- Monitor inbox

**Node 2: HTTP Request**
```bash
curl --request POST \
  --url http://localhost:3000/api/transform \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "{{$json.body}}",
  "lang": "en"
}'
```

**Node 3: Send Email (SMTP)**
- Send transformed text

---

### Workflow 3: Slack Bot

**Node 1: Slack Trigger**
- On mention

**Node 2: HTTP Request**
```bash
curl --request POST \
  --url http://localhost:3000/api/transform \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "{{$json.text}}",
  "lang": "en"
}'
```

**Node 3: Slack Reply**
- Post: `{{$json.result}}`

---

### Workflow 4: Auto-Select Dictionary

**Node 1: Webhook**
```json
{
  "text": "Your text",
  "preferredDict": "business"
}
```

**Node 2: Get Dictionaries**
```bash
curl --request GET \
  --url http://localhost:3000/api/dictionaries/list \
  --header 'Content-Type: application/json'
```

**Node 3: Code Node**
```javascript
// Find dictionary by name
const preference = $input.first().json.preferredDict;
const dictionaries = $('HTTP Request').all()[0].json;

const found = dictionaries.find(d => 
  d.name.toLowerCase().includes(preference?.toLowerCase() || '')
);

return {
  text: $input.first().json.text,
  dictionaryId: found?.id || null // null = Global
};
```

**Node 4: Transform**
```bash
curl --request POST \
  --url http://localhost:3000/api/transform \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "{{$json.text}}",
  "lang": "en",
  "dictionaryId": "{{$json.dictionaryId}}"
}'
```

---

## 🔧 How to Import in n8n

1. **Add HTTP Request node**
2. Click on the node to open settings
3. Find **"Import from cURL"** button (top right corner)
4. **Paste any cURL** command from above
5. **Done!** All settings configured automatically

---

## 💡 Quick Tips

### Tip 1: No Dictionary = Global
```json
{
  "text": "Your text",
  "lang": "en"
  // No dictionaryId = Uses Global Dictionary
}
```

### Tip 2: Use Variables
```json
{
  "text": "{{$json.inputText}}",
  "lang": "{{$json.language}}",
  "dictionaryId": "{{$json.dictId}}"
}
```

### Tip 3: Handle Empty Dictionary
```javascript
// In Code Node
const dictId = $json.selectedDict || null; // Fallback to Global
```

### Tip 4: Production URL
```bash
# Replace localhost with your domain
--url https://textflow.yourcompany.com/api/transform
```

---

## ⚡ Advanced: Batch Processing

**Transform multiple texts at once:**

**Node 1: Split In Batches**
- Input: Array of texts
- Batch size: 10

**Node 2: HTTP Request**
```bash
curl --request POST \
  --url http://localhost:3000/api/transform \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "{{$json.text}}",
  "lang": "en"
}'
```

**Node 3: Merge**
- Combine results

---

## 🎨 Real-World Examples

### Example 1: Content Pipeline
```
[Google Sheets] → [Read Row] → [Transform] → [Update Row]
```

### Example 2: Support Ticket
```
[Zendesk Trigger] → [Transform] → [Create Internal Ticket]
```

### Example 3: Social Media
```
[Twitter Mention] → [Transform] → [Reply Tweet]
```

### Example 4: Documentation
```
[GitHub Push] → [Read Files] → [Transform] → [Commit Changes]
```

---

## 🔐 With Authentication

### Bearer Token
```bash
curl --request POST \
  --url http://localhost:3000/api/transform \
  --header 'Authorization: Bearer YOUR-TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "Your text",
  "lang": "en"
}'
```

### API Key
```bash
curl --request POST \
  --url http://localhost:3000/api/transform \
  --header 'X-API-Key: YOUR-API-KEY' \
  --header 'Content-Type: application/json' \
  --data '{
  "text": "Your text",
  "lang": "en"
}'
```

---

## 📊 Expected Response

```json
{
  "original": "At this point in time, we need to utilize...",
  "result": "Now, we need to use...",
  "replacements": 3,
  "language": "en",
  "dictionaryUsed": "global"
}
```

---

## ❓ FAQ

**Q: What if I don't specify dictionaryId?**  
A: Global Dictionary is used automatically ✅

**Q: Can I use someone else's dictionary?**  
A: Yes! If it's public, just use its UUID ✅

**Q: How do I find dictionary UUIDs?**  
A: Use `/api/dictionaries/list` endpoint ✅

**Q: Can I mix dictionaries?**  
A: No, one request = one dictionary. But you can chain transformations! ✅

---

**Need more help?** Check [API-DOCUMENTATION.md](../../API-DOCUMENTATION.md)
