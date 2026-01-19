# MockFlow - Ready-Made Workflow Templates

Common workflow patterns for everyday API testing and mocking scenarios.

## Template 1: Local GET → MockFlow POST

**Use Case:** Fetch data from local API, then create a resource on MockFlow

### Workflow Structure
```
[Request Node] GET http://localhost:8080/api/users/123
    ↓
[Transformation Node] Extract user data
    ↓
[Request Node] POST /api/users (MockFlow endpoint)
    ↓
[Response Node] Return created user
```

### Configuration

**Node 1: Request (GET Local)**
- Method: `GET`
- Path: `https://your-ngrok-url.ngrok-free.app/api/users/123`
- Body: Empty

**Node 2: Transformation**
- Target: `user`
- Source: `{{response.data}}`

**Node 3: Request (POST MockFlow)**
- Method: `POST`
- Path: `/api/users`
- Body:
```json
{
  "name": "{{user.name}}",
  "email": "{{user.email}}",
  "source": "local-api"
}
```

**Node 4: Response**
- Status: `201`
- Body:
```json
{
  "id": "{{uuid}}",
  "user": "{{user}}",
  "created": true
}
```

---

## Template 2: Local POST → MockFlow GET

**Use Case:** Create data locally, then fetch related data from MockFlow

### Workflow Structure
```
[Request Node] POST http://localhost:8080/api/orders
    ↓
[State Node] Save order ID
    ↓
[Request Node] GET /api/orders/:id (MockFlow)
    ↓
[Response Node] Return order details
```

### Configuration

**Node 1: Request (POST Local)**
- Method: `POST`
- Path: `https://your-ngrok-url.ngrok-free.app/api/orders`
- Body:
```json
{
  "product": "{{request.body.product}}",
  "quantity": "{{request.body.quantity}}"
}
```

**Node 2: State (Save Order ID)**
- Operation: `set`
- Key: `orderId`
- Value: `{{response.id}}`

**Node 3: Request (GET MockFlow)**
- Method: `GET`
- Path: `/api/orders/{{state.orderId}}`

**Node 4: Response**
- Status: `200`
- Body:
```json
{
  "order": "{{response}}",
  "status": "confirmed"
}
```

---

## Template 3: Save to Database Pattern

**Use Case:** Receive data, validate, save to Supabase, return confirmation

### Workflow Structure
```
[Request Node] POST /api/save
    ↓
[Validation Node] Check required fields
    ↓
[Transformation Node] Format data
    ↓
[State Node] Save to database (simulated)
    ↓
[Response Node] Return success
```

### Configuration

**Node 1: Request**
- Method: `POST`
- Path: `/api/save`
- Body Schema:
```json
{
  "name": "string",
  "email": "string",
  "data": "object"
}
```

**Node 2: Validation**
- Rules:
  - Field: `name` | Condition: `required`
  - Field: `email` | Condition: `required`
  - Field: `email` | Condition: `regex` | Value: `^[^\s@]+@[^\s@]+\.[^\s@]+$`

**Node 3: Transformation**
- Target: `record`
- Source:
```json
{
  "id": "{{uuid}}",
  "name": "{{request.body.name}}",
  "email": "{{request.body.email}}",
  "data": "{{request.body.data}}",
  "created_at": "{{now}}"
}
```

**Node 4: State (Simulate DB Save)**
- Operation: `set`
- Key: `saved_records`
- Value: `{{record}}`

**Node 5: Response**
- Status: `201`
- Body:
```json
{
  "success": true,
  "record": "{{record}}",
  "message": "Data saved successfully"
}
```

---

## Template 4: CRUD Operations Chain

**Use Case:** Complete CRUD workflow for a resource

### Workflow Structure
```
[Request Node] POST /api/items (Create)
    ↓
[State Node] Save item ID
    ↓
[Request Node] GET /api/items/:id (Read)
    ↓
[Request Node] PUT /api/items/:id (Update)
    ↓
[Request Node] DELETE /api/items/:id (Delete)
    ↓
[Response Node] Return operation summary
```

---

## Template 5: External API → Transform → Save

**Use Case:** Fetch from external API, transform, save to your system

### Workflow Structure
```
[Request Node] GET https://api.example.com/data
    ↓
[Transformation Node] Map to your schema
    ↓
[Validation Node] Validate transformed data
    ↓
[Request Node] POST /api/local/save
    ↓
[Response Node] Return saved data
```

### Configuration

**Node 1: Request (External API)**
- Method: `GET`
- Path: `https://jsonplaceholder.typicode.com/users/1`

**Node 2: Transformation**
- Target: `user`
- Transform:
```json
{
  "full_name": "{{response.name}}",
  "email_address": "{{response.email}}",
  "company_name": "{{response.company.name}}",
  "imported_at": "{{now}}"
}
```

**Node 3: Validation**
- Field: `full_name` | Condition: `required`
- Field: `email_address` | Condition: `required`

**Node 4: Request (Save Locally)**
- Method: `POST`
- Path: `https://your-local-api.ngrok-free.app/api/users`
- Body: `{{user}}`

**Node 5: Response**
- Status: `201`
- Body:
```json
{
  "imported": true,
  "user": "{{user}}",
  "source": "external-api"
}
```

---

## Template 6: Conditional Processing

**Use Case:** Different actions based on input

### Workflow Structure
```
[Request Node] POST /api/process
    ↓
[Conditional Node] Check user type
    ↓ (true)
[Request Node] POST /api/premium/process
    ↓ (false)
[Request Node] POST /api/standard/process
    ↓
[Response Node] Return result
```

### Configuration

**Node 1: Request**
- Method: `POST`
- Path: `/api/process`
- Body:
```json
{
  "user_type": "premium|standard",
  "data": "object"
}
```

**Node 2: Conditional**
- Condition: `request.body.user_type === 'premium'`

**Node 3a: Request (Premium Path)**
- Method: `POST`
- Path: `https://your-api.ngrok-free.app/api/premium/process`
- Body: `{{request.body.data}}`

**Node 3b: Request (Standard Path)**
- Method: `POST`
- Path: `https://your-api.ngrok-free.app/api/standard/process`
- Body: `{{request.body.data}}`

**Node 4: Response**
- Status: `200`
- Body:
```json
{
  "processed": true,
  "type": "{{request.body.user_type}}",
  "result": "{{response}}"
}
```

---

## Template 7: Rate-Limited API Proxy

**Use Case:** Add rate limiting to external API

### Workflow Structure
```
[Request Node] GET /api/proxy/:endpoint
    ↓
[State Node] Check rate limit
    ↓
[Conditional Node] Rate limit check
    ↓ (allowed)
[Request Node] GET https://api.external.com/:endpoint
    ↓
[Response Node] Return data
    ↓ (denied)
[Response Node] 429 Too Many Requests
```

---

## Template 8: Webhook Receiver → Process → Notify

**Use Case:** Receive webhook, process, send notification

### Workflow Structure
```
[Request Node] POST /api/webhook
    ↓
[Validation Node] Verify webhook signature
    ↓
[Transformation Node] Extract event data
    ↓
[Request Node] POST /api/notify
    ↓
[Response Node] Acknowledge webhook
```

---

## How to Use Templates

### Method 1: Manual Creation
1. Open MockFlow Studio
2. Drag nodes from the Node Library
3. Configure each node as shown in template
4. Connect nodes in the specified order
5. Save and Deploy

### Method 2: Import JSON (Future Feature)
```json
{
  "name": "Local GET → MockFlow POST",
  "nodes": [...],
  "edges": [...]
}
```

---

## Common Patterns

### Pattern: Error Handling
Always add error responses:
```json
{
  "error": true,
  "message": "{{error.message}}",
  "code": "{{error.code}}"
}
```

### Pattern: Logging
Add State nodes to log operations:
- Key: `logs`
- Value: `{{timestamp}}: {{operation}}`

### Pattern: Retry Logic
Use Conditional nodes to retry failed requests:
- Condition: `response.status >= 500`
- True: Retry request
- False: Continue

---

## Testing Templates

### Test Local GET → MockFlow POST
```bash
# 1. Start your local API
java UserController

# 2. Start ngrok
ngrok http 8080

# 3. Create workflow in MockFlow with ngrok URL

# 4. Test
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User"}'
```

---

## Next Steps

1. Try the templates
2. Modify for your use case
3. Save as reusable workflows
4. Share with your team

**These templates cover 80% of common API testing scenarios!**
