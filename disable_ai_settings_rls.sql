-- =====================================================
-- Disable RLS on ai_settings for testing
-- =====================================================
-- Run this in DreamMaker's Supabase SQL Editor

-- Disable RLS entirely on ai_settings table
ALTER TABLE ai_settings DISABLE ROW LEVEL SECURITY;

-- Grant all permissions
GRANT ALL ON ai_settings TO anon;
GRANT ALL ON ai_settings TO authenticated;
GRANT ALL ON ai_settings TO service_role;

-- Verify data exists
SELECT * FROM ai_settings;

-- =====================================================
-- Done!
-- =====================================================
