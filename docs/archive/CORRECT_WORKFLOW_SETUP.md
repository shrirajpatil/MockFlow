# ✅ CORRECT Workflow Setup for GET Requests

## ❌ THE MISTAKE

If your **Request node** has a body configured like this:
```json
{
  "name": "string",
  "email": "string"
}
```

**This is WRONG for GET requests!** GET requests should NOT have a request body.

## ✅ THE CORRECT SETUP

### Step-by-Step: Create a Simple GET Endpoint

#### 1. Add Request Node
- **Method**: `GET`
- **Path**: `/hello`
- **Headers**: Leave empty (or add if needed)
- **Body**: **LEAVE EMPTY** ⚠️ This is critical!

#### 2. Add Response Node
- **Status**: `200`
- **Headers**: Leave empty (or add `Content-Type: application/json`)
- **Body**:
  ```json
  {
    "message": "Hello from MockFlow!",
    "timestamp": "{{now}}"
  }
  ```

#### 3. Connect Nodes
- Drag from Request node's bottom handle to Response node's top handle

#### 4. Save & Deploy
1. Click **Save** button
2. Enter name: "Hello API"
3. Click **Deploy** button
4. Click **Copy URL**

#### 5. Test
```bash
curl http://localhost:3000/api/hello
```

**Expected Response:**
```json
{
  "message": "Hello from MockFlow!",
  "timestamp": "2026-01-18T22:45:00Z"
}
```

---

## 📋 Quick Reference: When to Use Request Body

| HTTP Method | Should Have Body? | Example Use Case |
|-------------|-------------------|------------------|
| **GET** | ❌ NO | Fetch data |
| **POST** | ✅ YES | Create resource |
| **PUT** | ✅ YES | Update resource |
| **PATCH** | ✅ YES | Partial update |
| **DELETE** | ⚠️ Usually NO | Delete resource |

---

## Example Workflows

### ✅ Example 1: GET Request (No Body)
```
Request Node:
  Method: GET
  Path: /users
  Body: [EMPTY]
    ↓
Response Node:
  Status: 200
  Body: {"users": [{"id": 1, "name": "John"}]}
```

### ✅ Example 2: POST Request (With Body)
```
Request Node:
  Method: POST
  Path: /users
  Body: {"name": "{{request.body.name}}", "email": "{{request.body.email}}"}
    ↓
Validation Node:
  Check: request.body.name is required
    ↓
Response Node:
  Status: 201
  Body: {"id": 123, "name": "{{request.body.name}}"}
```

### ✅ Example 3: GET with Query Parameters
```
Request Node:
  Method: GET
  Path: /search
  Body: [EMPTY]
    ↓
Response Node:
  Status: 200
  Body: {"query": "{{request.query.q}}", "results": []}
```

**Test with:**
```bash
curl "http://localhost:3000/api/search?q=test"
```

---

## 🔍 Troubleshooting

### "No deployed workflow found"

**Check:**
1. ✅ Workflow is saved
2. ✅ Workflow is deployed (Deploy button shows "Deployed")
3. ✅ Request node path matches URL path
4. ✅ Request node method matches HTTP method
5. ✅ **GET requests have NO body**

### "Workflow execution failed"

**Check:**
1. ✅ Nodes are properly connected
2. ✅ Response node has valid JSON in body
3. ✅ No syntax errors in JSON

### Database Migration Not Applied

**Symptoms:**
- Can't save workflow
- Error: `{}`
- Deploy button stays grey

**Fix:**
Run in Supabase SQL Editor:
```sql
ALTER TABLE workflows 
ADD COLUMN IF NOT EXISTS deployed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMP WITH TIME ZONE;
```

---

## 🎯 Final Checklist

Before testing your workflow:

- [ ] Database migration applied
- [ ] Request node configured:
  - [ ] Method is set (GET, POST, etc.)
  - [ ] Path is set (e.g., `/hello`)
  - [ ] **Body is EMPTY for GET requests**
- [ ] Response node configured:
  - [ ] Status code is set (200, 201, etc.)
  - [ ] Body has valid JSON
- [ ] Nodes are connected
- [ ] Workflow is saved (has a name)
- [ ] Workflow is deployed (Deploy button shows "Deployed")
- [ ] Endpoint URL copied and ready to test

---

## 🚀 Quick Test Command

After setting up a GET workflow at `/hello`:

```bash
# Test locally
curl http://localhost:3000/api/hello

# Test with ngrok (if tunnel is running)
curl https://your-ngrok-url.ngrok-free.app/api/hello

# Test with verbose output
curl -v http://localhost:3000/api/hello
```

**Success looks like:**
```
< HTTP/1.1 200 OK
< Content-Type: application/json
< 
{"message":"Hello from MockFlow!"}
```

**Failure looks like:**
```
< HTTP/1.1 404 Not Found
<
{"error":"Not Found","message":"No deployed workflow found for GET /hello"}
```

If you see 404, double-check:
1. Request node has **NO body** for GET
2. Workflow is **deployed**
3. Path matches exactly (`/hello` not `/api/hello`)
