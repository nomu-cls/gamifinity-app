-- =====================================================
-- FULL FIX: AI Settings Permissions
-- =====================================================
-- Run this in DreamMaker's Supabase SQL Editor

-- Step 1: Make sure table exists with proper structure
CREATE TABLE IF NOT EXISTS ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text UNIQUE NOT NULL,
  api_key_encrypted text,
  is_active boolean DEFAULT false,
  is_valid boolean,
  last_validated_at timestamptz,
  validation_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 2: Disable RLS completely
ALTER TABLE ai_settings DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop all existing policies
DROP POLICY IF EXISTS "Service role can manage ai_settings" ON ai_settings;
DROP POLICY IF EXISTS "Allow all on ai_settings" ON ai_settings;
DROP POLICY IF EXISTS "anon_select" ON ai_settings;
DROP POLICY IF EXISTS "anon_insert" ON ai_settings;
DROP POLICY IF EXISTS "anon_update" ON ai_settings;

-- Step 4: Grant ALL privileges to ALL roles
GRANT ALL PRIVILEGES ON ai_settings TO anon;
GRANT ALL PRIVILEGES ON ai_settings TO authenticated;
GRANT ALL PRIVILEGES ON ai_settings TO service_role;
GRANT ALL PRIVILEGES ON ai_settings TO postgres;

-- Step 5: Grant usage on sequence (if any)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Step 6: Ensure default rows exist
INSERT INTO ai_settings (provider, is_active) 
VALUES ('gemini', false) 
ON CONFLICT (provider) DO NOTHING;

INSERT INTO ai_settings (provider, is_active) 
VALUES ('openai', false) 
ON CONFLICT (provider) DO NOTHING;

-- Step 7: Verify
SELECT * FROM ai_settings;

-- =====================================================
-- DONE - Now refresh browser and try again
-- =====================================================
