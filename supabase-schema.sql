-- =====================================================
-- MockFlow — Canonical Database Schema (Supabase)
-- Run this once in the Supabase SQL Editor.
-- Idempotent: safe to re-run on an existing project.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Workflows: the visual designs built in the editor.
-- `workspace` is an unauthenticated namespace (see README — real auth is on
-- the roadmap; treat workspace names as private access codes).
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  version TEXT DEFAULT '1.0',
  workspace TEXT NOT NULL DEFAULT 'default',
  deployed BOOLEAN DEFAULT false,
  deployed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE -- reserved for future auth
);

-- Upgrade path for databases created from the older schema
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS workspace TEXT NOT NULL DEFAULT 'default';
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS deployed BOOLEAN DEFAULT false;
ALTER TABLE workflows ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMP WITH TIME ZONE;

-- Execution history for deployed mocks and editor test runs
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  request_data JSONB,
  response_data JSONB,
  status TEXT CHECK (status IN ('success', 'failed')),
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON workflows(workspace);
CREATE INDEX IF NOT EXISTS idx_workflows_updated_at ON workflows(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflows_deployed ON workflows(deployed) WHERE deployed = true;
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_executed_at ON workflow_executions(executed_at DESC);

-- Row Level Security.
-- There is no user auth yet: the browser uses the anon key and scopes queries
-- by workspace client-side; the serving backend uses the service-role key.
-- These policies are intentionally permissive and exist so that adding
-- user-based policies later is a drop-in change.
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can insert their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can update their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can delete their own workflows" ON workflows;
DROP POLICY IF EXISTS "Users can view their own workspace workflows" ON workflows;
DROP POLICY IF EXISTS "Users can insert into their own workspace" ON workflows;
DROP POLICY IF EXISTS "Users can update their own workspace workflows" ON workflows;
DROP POLICY IF EXISTS "Users can delete their own workspace workflows" ON workflows;
DROP POLICY IF EXISTS "Anon full access (pre-auth)" ON workflows;
CREATE POLICY "Anon full access (pre-auth)" ON workflows
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view their workflow executions" ON workflow_executions;
DROP POLICY IF EXISTS "Users can insert workflow executions" ON workflow_executions;
DROP POLICY IF EXISTS "Anon full access (pre-auth)" ON workflow_executions;
CREATE POLICY "Anon full access (pre-auth)" ON workflow_executions
  FOR ALL USING (true) WITH CHECK (true);

-- Keep updated_at fresh
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_workflows_updated_at ON workflows;
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
