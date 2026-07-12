# 🚨 IMPORTANT: Apply Database Migration First!

## The Problem

You're seeing this error because the database doesn't have the `deployed` and `deployed_at` columns yet:
```
Error saving workflow: {}
```

The Deploy button is **greyed out** because the workflow can't be saved without these columns.

## The Solution

### Step 1: Open Supabase SQL Editor

1. Go to: https://app.supabase.com/project/ufiozvpjsffthynkvkpc
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run the Migration

Copy and paste this SQL code:

```sql
-- Add deployment tracking columns to workflows table
ALTER TABLE workflows 
ADD COLUMN IF NOT EXISTS deployed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMP WITH TIME ZONE;

-- Create index for fast lookup of deployed workflows
CREATE INDEX IF NOT EXISTS idx_workflows_deployed 
ON workflows(deployed) 
WHERE deployed = true;

-- Verify the migration worked
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'workflows'
ORDER BY ordinal_position;
```

### Step 3: Click "Run" (or press Ctrl+Enter)

You should see output showing all columns including the new ones:
- `deployed` (boolean)
- `deployed_at` (timestamp with time zone)

### Step 4: Test in MockFlow

1. Go back to http://localhost:3000
2. Create a simple workflow:
   - Drag **Request** node → Set to `GET /hello`
   - Drag **Response** node → Set body to `{"message": "Hello!"}`
   - Connect them
3. Click **Save** button
4. Enter workflow name (e.g., "Test API")
5. Click **Save Workflow**
6. ✅ Should save successfully!
7. Click **Deploy** button (should now be enabled)
8. Click **Copy URL**
9. Test: `curl http://localhost:3000/api/hello`

## What If It Still Doesn't Work?

### Check Supabase Connection

Make sure your `.env.local` file exists in the `frontend` folder with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://ufiozvpjsffthynkvkpc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
```

### Check Browser Console

After trying to save again, check the browser console (F12) for the detailed error message. It will now show:
- Error message
- Error details
- Hint for fixing
- Error code

### Still Having Issues?

The improved error logging will now show you exactly what's wrong. Look for the alert popup and browser console for detailed error information.

---

## Quick Reference

**Migration File Location:**
`MockFlow/migration-add-deployment.sql`

**Supabase Project:**
https://app.supabase.com/project/ufiozvpjsffthynkvkpc

**After Migration:**
- Save button: Saves workflow to database
- Deploy button: Makes workflow accessible via HTTP
- Copy URL button: Appears after deployment
