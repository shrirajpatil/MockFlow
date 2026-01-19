# Quick Start - You're Almost Ready! 🚀

## ✅ What's Done

- Supabase credentials configured in `.env.local`
- All production code ready (HTTP client, proxy, database client)
- Request nodes support URLs and authentication

## 🎯 Next Steps (5 minutes)

### Step 1: Run Database Schema

1. Open your Supabase project: https://app.supabase.com/project/ufiozvpjsffthynkvkpc
2. Go to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Open the file `supabase-schema.sql` in this project
5. Copy ALL the SQL code
6. Paste into Supabase SQL Editor
7. Click **"Run"** (or press Ctrl+Enter)
8. You should see: "Success. No rows returned"

This creates the `workflows` and `workflow_executions` tables.

### Step 2: Restart Your Dev Server

**IMPORTANT**: You must restart for environment variables to load!

```bash
# In your terminal, press Ctrl+C to stop the current server
# Then run:
cd frontend
npm run dev
```

### Step 3: Test Real API Execution!

#### Test with Public API (JSONPlaceholder)

1. **Open** http://localhost:3000
2. **Drag** a Request node onto canvas
3. **Click** the node to configure:
   - **URL**: `https://jsonplaceholder.typicode.com`
   - **Path**: `/posts/1`
   - **Method**: `GET`
4. **Drag** a Response node below it
5. **Connect** them (drag from bottom of Request to top of Response)
6. **Click Test** in toolbar
7. **Enter** any request body (e.g., `{}`)
8. **Click "Run Test"**
9. **See real API response!** 🎉

#### Test with Your Local API

If you have an API running on `localhost:3001`:

1. **Drag** a Request node
2. **Configure**:
   - **URL**: `http://localhost:3001`
   - **Path**: `/your-endpoint`
   - **Method**: `POST`
   - **Headers**: Add `Content-Type: application/json`
3. **Add authentication** if needed (Bearer token, API key, etc.)
4. **Connect** to Response node
5. **Test** with real request body
6. **MockFlow automatically proxies** the request (no CORS issues!)

## 🎓 What You Can Do Now

### 1. Real HTTP Requests
- Make actual API calls to any endpoint
- Support for GET, POST, PUT, DELETE, PATCH
- Authentication: Bearer, API Key, Basic Auth
- Automatic retry with exponential backoff

### 2. Local API Integration Testing
- Test APIs running on localhost
- No CORS issues (automatic proxy)
- Perfect for team integration testing

### 3. Database Persistence (After Schema Setup)
- Save workflows with names
- Load from database
- Track execution history

### 4. Professional Features
- Undo/Redo (Ctrl+Z / Ctrl+Shift+Z)
- Keyboard shortcuts (Ctrl+S to save)
- Animated edge connections
- Real-time node/edge counters

## 📝 Example Workflow

**Scenario**: Test user registration flow

```
Request Node (POST to your API)
  ├─ URL: http://localhost:3001
  ├─ Path: /api/users
  ├─ Method: POST
  └─ Body: {"name": "John", "email": "john@example.com"}
    ↓
Validation Node
  └─ Check: response.id is required
    ↓
Response Node
  └─ Return: 201 Created
```

## 🐛 Troubleshooting

**"Cannot connect to Supabase"**
- Make sure you ran the SQL schema (Step 1)
- Restart dev server (Step 2)
- Check `.env.local` file exists in `frontend` folder

**"Request failed"**
- For local APIs: Make sure your API is running
- For remote APIs: Check URL is correct
- Check browser console for detailed errors

**"CORS error"**
- This shouldn't happen! MockFlow auto-proxies localhost URLs
- If it does, let me know and I'll debug

## 🌐 Bonus: Expose MockFlow Publicly (Optional)

Want to access MockFlow from anywhere or share with your team?

### Start the Tunnel

```bash
# In a new terminal
cd tunnel-agent
npm start
```

You'll get a public URL like `https://abc123.ngrok.io` that you can:
- Share with team members
- Access from mobile devices  
- Use for webhook testing

See [TUNNEL_GUIDE.md](./TUNNEL_GUIDE.md) for full details!

## 🎉 You're Ready!

Once you complete Steps 1-3 above, you'll have a **fully functional, production-ready** API testing platform!

---

**Need help?** Just ask! I'm here to help you get this working.
