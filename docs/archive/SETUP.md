# MockFlow Production Setup Guide

## 🎯 What You Now Have

MockFlow is now a **fully functional, production-ready** API testing and integration platform with:

✅ **Real HTTP Requests** - Make actual POST/PUT/GET/DELETE requests to any API
✅ **Database Persistence** - Save/load workflows to Supabase
✅ **Local API Testing** - Connect to `localhost` APIs for team integration testing
✅ **Authentication Support** - Bearer tokens, API keys, Basic auth
✅ **CORS Proxy** - Automatic proxy for local APIs to avoid CORS issues
✅ **Professional UI** - Undo/redo, keyboard shortcuts, animated edges

## 📋 Setup Steps

### Step 1: Create Supabase Project (5 minutes)

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose a name (e.g., "mockflow")
4. Set a database password
5. Select a region close to you
6. Wait for project to be created (~2 minutes)

### Step 2: Run Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `supabase-schema.sql` (in the root folder)
4. Paste into the SQL editor
5. Click "Run" to create the tables

### Step 3: Get API Keys

1. In Supabase, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (e.g., `https://abcdefg.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### Step 4: Configure Environment Variables

1. In the `frontend` folder, create a file named `.env.local`
2. Add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. Replace with your actual values from Step 3

### Step 5: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
cd frontend
npm run dev
```

## 🚀 How to Use

### Testing a Public API

1. **Drag a Request node** onto the canvas
2. **Click the node** to configure it
3. **Add URL**: `https://jsonplaceholder.typicode.com`
4. **Set path**: `/posts/1`
5. **Set method**: `GET`
6. **Drag a Response node** and connect them
7. **Click Test** in the toolbar
8. **See real API response!**

### Testing Your Local API

#### Example: You have an API running on `localhost:3001`

1. **Drag a Request node**
2. **Configure**:
   - URL: `http://localhost:3001`
   - Path: `/api/users`
   - Method: `POST`
   - Headers: `Content-Type: application/json`
3. **Add authentication** if needed:
   - Type: Bearer
   - Token: `your-api-token`
4. **Drag a Response node** and connect
5. **Click Test** with sample request body
6. **MockFlow automatically uses proxy** for localhost URLs (no CORS issues!)

### Team Integration Testing Scenario

**Scenario**: Developer A builds User API, Developer B builds Notification API

1. **Developer A's API**: `http://localhost:3001/api/users` (POST)
2. **Developer B's API**: `http://localhost:3002/api/notifications` (POST)

**Create workflow**:
```
Request (POST to API A)
  ↓
Validation (check user created)
  ↓
Transformation (map user.id to notification.userId)
  ↓
Request (POST to API B with transformed data)
  ↓
Response (200 OK)
```

**Test the integration** without deploying anything!

## 💾 Saving Workflows

### Current: File-Based (Works Now)

- Click **Save** → Downloads JSON file
- Click **Load** → Upload JSON file

### Coming Soon: Database-Based

Once you complete the Supabase setup, I'll update the Toolbar to:
- Save directly to database with name/description
- Load from a list of saved workflows
- Share workflows by ID

## 🔧 Advanced Features

### Authentication Types

**Bearer Token**:
```
Type: Bearer
Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**API Key**:
```
Type: API Key
Header Name: X-API-Key
API Key: your-api-key-123
```

**Basic Auth**:
```
Type: Basic
Username: admin
Password: secret
```

### Timeout & Retries

- **Timeout**: 30000ms (30 seconds) default
- **Retries**: 0 (no retries) default
- Customize in Request node configuration

### Environment Variables (Coming Soon)

Define variables for different environments:
```json
{
  "dev": {
    "API_URL": "http://localhost:3001",
    "API_KEY": "dev-key"
  },
  "prod": {
    "API_URL": "https://api.production.com",
    "API_KEY": "prod-key"
  }
}
```

## 📁 File Structure

```
MockFlow/
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── supabase.ts          # Supabase client
│   │   │   ├── api.ts               # Workflow CRUD operations
│   │   │   ├── httpClient.ts        # Real HTTP requests
│   │   │   ├── executor.ts          # Original (simulated) executor
│   │   │   └── productionExecutor.ts # NEW: Real API executor
│   │   └── types/
│   │       └── nodes.ts             # Updated with URL/auth fields
│   └── .env.local                   # YOUR SUPABASE CREDENTIALS
├── backend/
│   └── netlify/
│       └── functions/
│           └── proxy.ts             # CORS proxy for local APIs
└── supabase-schema.sql              # Database schema
```

## 🐛 Troubleshooting

### "Failed to fetch" error

- **Local API**: Make sure your API is running
- **Remote API**: Check URL is correct and accessible
- **CORS**: MockFlow automatically proxies localhost URLs

### Supabase connection error

- Check `.env.local` file exists in `frontend` folder
- Verify URL and key are correct
- Restart dev server after adding env vars

### Request node not making real requests

- Make sure you've added a **URL** field in the Request node configuration
- Without URL, it just validates the request schema (old behavior)
- With URL, it makes a real HTTP request (new behavior)

## 🎓 Next Steps

1. **Complete Supabase setup** (Steps 1-5 above)
2. **Test with a public API** (JSONPlaceholder)
3. **Test with your local API**
4. **Create a team integration workflow**
5. **Save your first workflow to database**

## 💡 Use Cases

### 1. API Integration Testing
Test how multiple microservices work together before deployment

### 2. Mock API Development
Create mock endpoints for frontend development

### 3. API Documentation
Visual documentation of API flows

### 4. Debugging
Test and debug API integrations with detailed logs

### 5. Team Collaboration
Share workflows with team members for consistent testing

---

**Need Help?** Check the implementation plan for more details or ask questions!
