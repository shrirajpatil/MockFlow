# Ready-Made Workflows

Import these workflows directly into MockFlow for instant use!

## 📦 Available Workflows

### 1. Local GET → MockFlow POST
**File:** `workflows/local-get-to-post.json`  
**Use Case:** Fetch data from your local API and create a resource

**What it does:**
1. GET request to your local API (via ngrok)
2. Transform the response data
3. Return formatted result

**How to use:**
1. Replace `YOUR-NGROK-URL` with your actual ngrok URL
2. Import into MockFlow
3. Deploy and test!

---

### 2. Save to Database
**File:** `workflows/save-to-database.json`  
**Use Case:** Validate and save data with proper error handling

**What it does:**
1. Receive POST request with data
2. Validate required fields (name, email)
3. Format record with ID and timestamp
4. Return success confirmation

**Perfect for:** User registration, data collection, form submissions

---

### 3. CRUD Operations
**File:** `workflows/crud-operations.json`  
**Use Case:** Complete Create, Read, Update, Delete workflow

**What it does:**
1. Accept any HTTP method (POST, GET, PUT, DELETE)
2. Route to appropriate operation
3. Process and return result

**Perfect for:** RESTful API mocking, resource management

---

### 4. External API → Local
**File:** `workflows/external-to-local.json`  
**Use Case:** Import data from external APIs to your local system

**What it does:**
1. Fetch from external API (e.g., JSONPlaceholder)
2. Transform to your schema
3. Save to your local API
4. Return confirmation

**Perfect for:** Data migration, API integration, batch imports

---

## 🚀 How to Import

### Method 1: Via MockFlow UI (Future Feature)
```
1. Open MockFlow Studio
2. Click "Load" button
3. Select workflow JSON file
4. Workflow loads automatically!
```

### Method 2: Manual Import (Current)
```
1. Open workflow JSON file
2. Copy the content
3. In MockFlow, create nodes manually
4. Configure as shown in JSON
```

### Method 3: API Import (Advanced)
```bash
curl -X POST http://localhost:3000/api/workflows/import \
  -H "Content-Type: application/json" \
  -d @workflows/local-get-to-post.json
```

---

## 🔧 Customization Guide

### Replace Placeholders

All workflows use these placeholders:

1. **`YOUR-NGROK-URL`** → Your actual ngrok URL
   ```
   Before: https://YOUR-NGROK-URL.ngrok-free.app
   After:  https://abc123.ngrok-free.app
   ```

2. **`uuid()`** → Auto-generated unique ID
3. **`now()`** → Current timestamp

### Modify Endpoints

Change the `path` field in Request nodes:
```json
{
  "path": "/api/your-custom-endpoint"
}
```

### Add Authentication

Add headers to Request nodes:
```json
{
  "headers": [
    {
      "key": "Authorization",
      "value": "Bearer YOUR_TOKEN"
    }
  ]
}
```

---

## 📊 Workflow Comparison

| Workflow | Complexity | Nodes | Use Case |
|----------|-----------|-------|----------|
| Local GET → POST | Simple | 3 | API chaining |
| Save to Database | Medium | 4 | Data validation |
| CRUD Operations | Medium | 4 | RESTful APIs |
| External → Local | Complex | 4 | Data import |

---

## 🧪 Testing Workflows

### Test Local GET → POST
```bash
# 1. Start your local API
java UserController

# 2. Start ngrok
ngrok http 8080

# 3. Update workflow with ngrok URL

# 4. Deploy workflow in MockFlow

# 5. Test
curl http://localhost:3000/api/default/users
```

### Test Save to Database
```bash
curl -X POST http://localhost:3000/api/default/save \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "data": {"role": "admin"}
  }'
```

### Test External → Local
```bash
# Just deploy and call - it fetches from JSONPlaceholder automatically
curl http://localhost:3000/api/default/import-user
```

---

## 🎯 Common Modifications

### Add Rate Limiting
```json
{
  "id": "state-ratelimit",
  "type": "state",
  "data": {
    "operation": "get",
    "key": "ratelimit.{{request.ip}}"
  }
}
```

### Add Logging
```json
{
  "id": "state-log",
  "type": "state",
  "data": {
    "operation": "set",
    "key": "logs",
    "value": "{{timestamp}}: {{operation}}"
  }
}
```

### Add Error Handling
```json
{
  "id": "response-error",
  "type": "response",
  "data": {
    "statusCode": 400,
    "bodyTemplate": "{\"error\": true, \"message\": \"{{error.message}}\"}"
  }
}
```

---

## 📚 Next Steps

1. ✅ Browse available workflows
2. ✅ Download JSON files
3. ✅ Customize for your needs
4. ✅ Import into MockFlow
5. ✅ Deploy and test!

**More workflows coming soon!** 🚀

---

## 💡 Request a Workflow

Need a specific workflow pattern? Let us know:
- GitHub Issues
- Discord Community
- Email Support

We'll add it to the collection!
