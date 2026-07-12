-- Production Features Migration
-- Run this in Supabase SQL Editor

-- 1. Add workspace column to workflows
ALTER TABLE workflows 
ADD COLUMN IF NOT EXISTS workspace TEXT DEFAULT 'default';

CREATE INDEX IF NOT EXISTS idx_workflows_workspace ON workflows(workspace);

-- 2. Create mock_data table for temporary storage
CREATE TABLE IF NOT EXISTS mock_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_data_workspace_key ON mock_data(workspace, key);
CREATE INDEX IF NOT EXISTS idx_mock_data_created_at ON mock_data(created_at);

-- 3. Auto-cleanup function for old data (40 minutes)
CREATE OR REPLACE FUNCTION cleanup_old_mock_data()
RETURNS void AS $$
BEGIN
  DELETE FROM mock_data 
  WHERE created_at < NOW() - INTERVAL '40 minutes';
END;
$$ LANGUAGE plpgsql;

-- 4. Enable RLS on mock_data
ALTER TABLE mock_data ENABLE ROW LEVEL SECURITY;

-- 5. Allow all operations on mock_data (public access for mock data)
DROP POLICY IF EXISTS "Allow all operations on mock_data" ON mock_data;
CREATE POLICY "Allow all operations on mock_data"
  ON mock_data FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Verify changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'workflows' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mock_data' 
ORDER BY ordinal_position;
