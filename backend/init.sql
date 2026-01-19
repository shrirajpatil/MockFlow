-- Run in Supabase SQL Editor

CREATE TABLE mock_apis (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE endpoints (
  id TEXT PRIMARY KEY,
  mock_api_id TEXT REFERENCES mock_apis(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  path TEXT NOT NULL,
  name TEXT NOT NULL,
  workflow JSONB NOT NULL, -- Visual workflow nodes
  request_schema JSONB DEFAULT '{}'::jsonb,
  response_configs JSONB DEFAULT '[]'::jsonb,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mock_state (
  mock_api_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (mock_api_id, key)
);

CREATE TABLE request_logs (
  id TEXT PRIMARY KEY,
  mock_api_id TEXT NOT NULL,
  endpoint_id TEXT,
  method TEXT,
  path TEXT,
  request_body JSONB,
  response_status INTEGER,
  response_body JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tunnel_connections (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  mock_api_id TEXT,
  local_port INTEGER NOT NULL,
  status TEXT NOT NULL,
  last_heartbeat TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
