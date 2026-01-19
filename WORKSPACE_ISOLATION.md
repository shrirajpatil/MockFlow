# Workspace Isolation & Multi-User Support

## How MockFlow Handles Multiple Users

### 🔐 Workspace-Based Isolation

MockFlow uses **workspaces** to prevent conflicts when multiple users deploy APIs with the same name.

## How It Works

### 1. Workspace Assignment
Every workflow belongs to a **workspace**:
```
User A's workflow: workspace = "user-a"
User B's workflow: workspace = "user-b"
```

### 2. Unique Endpoint URLs
Deployed workflows include the workspace in the URL:
```
User A: https://mockflow.com/api/user-a/POST/users
User B: https://mockflow.com/api/user-b/POST/users
```

**Result:** Both users can have `/users` endpoint without conflicts!

### 3. Database Isolation
Row Level Security (RLS) ensures users only see their own workflows:
```sql
-- Users can only access workflows in their workspace
CREATE POLICY "Users can only access their workspace"
ON workflows
FOR ALL
USING (workspace = current_user_workspace());
```

## Example Scenario

### Scenario: Two Users Create Same API

**User A (Workspace: "company-a")**
```
POST /api/users
Deployed URL: /api/company-a/POST/users
```

**User B (Workspace: "company-b")**
```
POST /api/users  
Deployed URL: /api/company-b/POST/users
```

**No Conflict!** ✅ Each user has their own isolated endpoint.

## Workspace Features

### 1. Automatic Workspace Creation
- First-time users get a default workspace
- Workspace name can be customized
- Format: `username` or `company-name`

### 2. Workspace Switching
Users can create multiple workspaces:
```
Personal: "john-personal"
Work: "acme-corp"
Testing: "john-test"
```

### 3. Team Workspaces (Future)
Share workspaces with team members:
```
Workspace: "acme-corp"
Members: john@acme.com, jane@acme.com
```

## Database Schema

### Workflows Table
```sql
CREATE TABLE workflows (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  workspace TEXT NOT NULL,  -- Isolates users
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  
  -- Unique constraint per workspace
  UNIQUE(workspace, method, path)
);
```

### Key Points:
- ✅ Same `path` allowed in different workspaces
- ✅ Unique constraint: `(workspace, method, path)`
- ✅ Users can't access other workspaces

## API Endpoint Resolution

### Request Flow
```
1. Request: POST /api/company-a/users
2. Extract workspace: "company-a"
3. Extract method: "POST"
4. Extract path: "/users"
5. Query: SELECT * FROM workflows 
         WHERE workspace = 'company-a'
         AND method = 'POST'
         AND path = '/users'
6. Execute workflow
7. Return response
```

### Conflict Prevention
```
❌ This would fail (same workspace):
   Workflow 1: workspace=acme, POST /users
   Workflow 2: workspace=acme, POST /users
   
✅ This works (different workspaces):
   Workflow 1: workspace=acme, POST /users
   Workflow 2: workspace=beta, POST /users
```

## Setting Your Workspace

### Method 1: UI (Recommended)
```
1. Open MockFlow Studio
2. Click workspace dropdown (top toolbar)
3. Enter workspace name
4. Click "Set Workspace"
```

### Method 2: Environment Variable
```bash
# .env.local
NEXT_PUBLIC_DEFAULT_WORKSPACE=my-company
```

### Method 3: Per-Workflow
```typescript
// When saving workflow
await saveWorkflow({
  name: "User API",
  workspace: "my-custom-workspace",
  // ...
});
```

## Best Practices

### 1. Use Descriptive Workspace Names
```
✅ Good: "acme-corp", "john-personal", "staging-env"
❌ Bad: "ws1", "test", "a"
```

### 2. Separate Environments
```
Development: "myapp-dev"
Staging: "myapp-staging"
Production: "myapp-prod"
```

### 3. Team Naming Convention
```
Format: company-team-env
Example: "acme-backend-dev"
```

## Security Features

### 1. Row Level Security (RLS)
```sql
-- Users can only see their workspace
CREATE POLICY workspace_isolation
ON workflows
USING (workspace = current_setting('app.workspace'));
```

### 2. API Key per Workspace
Each workspace can have its own API key:
```
Workspace: acme-corp
API Key: sk_acme_abc123...
```

### 3. Rate Limiting per Workspace
```
Workspace: acme-corp
Limit: 1000 requests/hour

Workspace: beta-corp
Limit: 1000 requests/hour
```

## Monitoring

### View Workspace Usage
```sql
SELECT 
  workspace,
  COUNT(*) as workflow_count,
  SUM(CASE WHEN deployed THEN 1 ELSE 0 END) as deployed_count
FROM workflows
GROUP BY workspace;
```

### Check for Conflicts
```sql
SELECT workspace, method, path, COUNT(*)
FROM workflows
GROUP BY workspace, method, path
HAVING COUNT(*) > 1;
```

## Migration Guide

### Existing Workflows
If you have workflows without workspaces:
```sql
-- Assign default workspace
UPDATE workflows
SET workspace = 'default'
WHERE workspace IS NULL;
```

### Bulk Workspace Assignment
```sql
-- Assign workspace based on user
UPDATE workflows
SET workspace = users.username
FROM auth.users
WHERE workflows.user_id = users.id;
```

## FAQ

**Q: Can two users have the same workspace?**  
A: Yes, for team collaboration. Use RLS policies to control access.

**Q: What happens if I change my workspace?**  
A: Your existing workflows stay in the old workspace. New workflows use the new workspace.

**Q: Can I move workflows between workspaces?**  
A: Yes, update the `workspace` field. Ensure no conflicts in the target workspace.

**Q: Is there a limit on workspaces?**  
A: No limit. Create as many as you need.

**Q: How do I delete a workspace?**  
A: Delete all workflows in that workspace, then the workspace is automatically removed.

## Summary

✅ **Workspace isolation prevents conflicts**  
✅ **Multiple users can use same API paths**  
✅ **RLS ensures data security**  
✅ **Unique URLs per workspace**  
✅ **Easy workspace management**

**MockFlow is designed for multi-user, multi-tenant use!** 🚀
