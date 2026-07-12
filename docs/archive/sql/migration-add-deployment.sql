-- Migration: Add deployment tracking to workflows
-- Run this in your Supabase SQL Editor

-- Add deployment columns to workflows table
ALTER TABLE workflows 
ADD COLUMN IF NOT EXISTS deployed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deployed_at TIMESTAMP WITH TIME ZONE;

-- Create index for deployed workflows
CREATE INDEX IF NOT EXISTS idx_workflows_deployed ON workflows(deployed) WHERE deployed = true;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'workflows'
ORDER BY ordinal_position;
