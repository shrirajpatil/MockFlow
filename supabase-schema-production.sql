-- =====================================================
-- MockFlow Production-Ready Database Schema with RLS
-- =====================================================

-- Enable Row Level Security
ALTER TABLE IF EXISTS workflows ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own workspace workflows" ON workflows;
DROP POLICY IF EXISTS "Users can insert into their own workspace" ON workflows;
DROP POLICY IF EXISTS "Users can update their own workspace workflows" ON workflows;
DROP POLICY IF EXISTS "Users can delete their own workspace workflows" ON workflows;

-- =====================================================
-- Row Level Security Policies
-- =====================================================

-- Policy: Users can only view workflows in their workspace
CREATE POLICY "Users can view their own workspace workflows"
ON workflows
FOR SELECT
USING (
  workspace = current_setting('app.current_workspace', true)
  OR workspace IS NULL -- Allow viewing workflows without workspace (legacy)
);

-- Policy: Users can only insert into their workspace
CREATE POLICY "Users can insert into their own workspace"
ON workflows
FOR INSERT
WITH CHECK (
  workspace = current_setting('app.current_workspace', true)
);

-- Policy: Users can only update workflows in their workspace
CREATE POLICY "Users can update their own workspace workflows"
ON workflows
FOR UPDATE
USING (
  workspace = current_setting('app.current_workspace', true)
)
WITH CHECK (
  workspace = current_setting('app.current_workspace', true)
);

-- Policy: Users can only delete workflows in their workspace
CREATE POLICY "Users can delete their own workspace workflows"
ON workflows
FOR DELETE
USING (
  workspace = current_setting('app.current_workspace', true)
);

-- =====================================================
-- Indexes for Performance
-- =====================================================

-- Index on workspace for faster queries
CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON workflows(workspace);

-- Index on deployed status for faster filtering
CREATE INDEX IF NOT EXISTS idx_workflows_deployed ON workflows(deployed);

-- Composite index for workspace + path (unique endpoint lookup)
CREATE INDEX IF NOT EXISTS idx_workflows_workspace_path ON workflows(workspace, path);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at DESC);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to set workspace context (call this before queries)
CREATE OR REPLACE FUNCTION set_workspace_context(workspace_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.current_workspace', workspace_name, false);
END;
$$;

-- Function to get current workspace context
CREATE OR REPLACE FUNCTION get_workspace_context()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN current_setting('app.current_workspace', true);
END;
$$;

-- =====================================================
-- Audit Logging (Optional but Recommended)
-- =====================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS workflow_audit_log (
  id BIGSERIAL PRIMARY KEY,
  workflow_id TEXT,
  workspace TEXT NOT NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'DEPLOY', 'UNDEPLOY'
  user_id TEXT,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE workflow_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view audit logs for their workspace
CREATE POLICY "Users can view their workspace audit logs"
ON workflow_audit_log
FOR SELECT
USING (
  workspace = current_setting('app.current_workspace', true)
);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_workspace ON workflow_audit_log(workspace);
CREATE INDEX IF NOT EXISTS idx_audit_workflow_id ON workflow_audit_log(workflow_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON workflow_audit_log(created_at DESC);

-- =====================================================
-- Trigger for Audit Logging
-- =====================================================

CREATE OR REPLACE FUNCTION log_workflow_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO workflow_audit_log (workflow_id, workspace, action, changes)
    VALUES (NEW.id, NEW.workspace, 'INSERT', to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO workflow_audit_log (workflow_id, workspace, action, changes)
    VALUES (NEW.id, NEW.workspace, 'UPDATE', jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO workflow_audit_log (workflow_id, workspace, action, changes)
    VALUES (OLD.id, OLD.workspace, 'DELETE', to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS workflow_audit_trigger ON workflows;
CREATE TRIGGER workflow_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON workflows
FOR EACH ROW
EXECUTE FUNCTION log_workflow_changes();

-- =====================================================
-- Security: Prevent SQL Injection
-- =====================================================

-- Revoke public access
REVOKE ALL ON workflows FROM PUBLIC;
REVOKE ALL ON workflow_audit_log FROM PUBLIC;

-- Grant specific permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON workflows TO authenticated;
GRANT SELECT ON workflow_audit_log TO authenticated;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON TABLE workflows IS 'Stores user workflow definitions with workspace isolation';
COMMENT ON TABLE workflow_audit_log IS 'Audit log for all workflow changes';
COMMENT ON FUNCTION set_workspace_context IS 'Set workspace context for RLS policies';
COMMENT ON FUNCTION get_workspace_context IS 'Get current workspace context';

-- =====================================================
-- Verification Queries
-- =====================================================

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('workflows', 'workflow_audit_log');

-- View all policies
-- SELECT * FROM pg_policies WHERE tablename IN ('workflows', 'workflow_audit_log');

-- Test workspace isolation (run as authenticated user)
-- SELECT set_workspace_context('test-workspace');
-- SELECT * FROM workflows; -- Should only show workflows in 'test-workspace'
