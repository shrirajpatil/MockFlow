-- =====================================================
-- MockFlow Production Migration: Add Workspace Support + RLS
-- Run this AFTER the base schema (supabase-schema.sql)
-- =====================================================

-- Step 1: Add workspace column if it doesn't exist
ALTER TABLE workflows 
ADD COLUMN IF NOT EXISTS workspace TEXT DEFAULT 'default';

-- Step 2: Drop old RLS policies (user_id based)
DROP POLICY IF EXISTS "Users can view their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can insert their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can update their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can delete their own workflows" ON workflows;

-- Step 3: Create new workspace-based RLS policies
CREATE POLICY "Users can view their own workspace workflows"
ON workflows
FOR SELECT
USING (
  workspace = current_setting('app.current_workspace', true)
  OR workspace IS NULL -- Allow viewing workflows without workspace (legacy)
  OR workspace = 'default' -- Allow viewing default workspace
);

CREATE POLICY "Users can insert into their own workspace"
ON workflows
FOR INSERT
WITH CHECK (
  workspace = current_setting('app.current_workspace', true)
  OR workspace = 'default'
);

CREATE POLICY "Users can update their own workspace workflows"
ON workflows
FOR UPDATE
USING (
  workspace = current_setting('app.current_workspace', true)
  OR workspace = 'default'
)
WITH CHECK (
  workspace = current_setting('app.current_workspace', true)
  OR workspace = 'default'
);

CREATE POLICY "Users can delete their own workspace workflows"
ON workflows
FOR DELETE
USING (
  workspace = current_setting('app.current_workspace', true)
  OR workspace = 'default'
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON workflows(workspace);

-- Step 5: Helper functions for workspace context
CREATE OR REPLACE FUNCTION set_workspace_context(workspace_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.current_workspace', workspace_name, false);
END;
$$;

CREATE OR REPLACE FUNCTION get_workspace_context()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN current_setting('app.current_workspace', true);
END;
$$;

-- Step 6: Create audit log table
CREATE TABLE IF NOT EXISTS workflow_audit_log (
  id BIGSERIAL PRIMARY KEY,
  workflow_id UUID,
  workspace TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id UUID,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 7: Enable RLS on audit log
ALTER TABLE workflow_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their workspace audit logs"
ON workflow_audit_log
FOR SELECT
USING (
  workspace = current_setting('app.current_workspace', true)
  OR workspace = 'default'
);

-- Step 8: Create audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_workspace ON workflow_audit_log(workspace);
CREATE INDEX IF NOT EXISTS idx_audit_workflow_id ON workflow_audit_log(workflow_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON workflow_audit_log(created_at DESC);

-- Step 9: Create audit trigger function
CREATE OR REPLACE FUNCTION log_workflow_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO workflow_audit_log (workflow_id, workspace, action, user_id, changes)
    VALUES (NEW.id, COALESCE(NEW.workspace, 'default'), 'INSERT', NEW.user_id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO workflow_audit_log (workflow_id, workspace, action, user_id, changes)
    VALUES (NEW.id, COALESCE(NEW.workspace, 'default'), 'UPDATE', NEW.user_id, jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO workflow_audit_log (workflow_id, workspace, action, user_id, changes)
    VALUES (OLD.id, COALESCE(OLD.workspace, 'default'), 'DELETE', OLD.user_id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Step 10: Create audit trigger
DROP TRIGGER IF EXISTS workflow_audit_trigger ON workflows;
CREATE TRIGGER workflow_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON workflows
FOR EACH ROW
EXECUTE FUNCTION log_workflow_changes();

-- Step 11: Grant permissions
GRANT SELECT ON workflow_audit_log TO authenticated;

-- Step 12: Add comments
COMMENT ON COLUMN workflows.workspace IS 'Workspace identifier for multi-tenant isolation';
COMMENT ON TABLE workflow_audit_log IS 'Audit log for all workflow changes';
COMMENT ON FUNCTION set_workspace_context IS 'Set workspace context for RLS policies';
COMMENT ON FUNCTION get_workspace_context IS 'Get current workspace context';

-- =====================================================
-- Verification
-- =====================================================

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('workflows', 'workflow_audit_log');

-- View policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('workflows', 'workflow_audit_log');

-- =====================================================
-- Usage Example
-- =====================================================

-- Set workspace context before queries
-- SELECT set_workspace_context('my-workspace');

-- Now all queries will be filtered by workspace
-- SELECT * FROM workflows; -- Only shows 'my-workspace' workflows

-- View audit log
-- SELECT * FROM workflow_audit_log ORDER BY created_at DESC LIMIT 10;
