-- =====================================================
-- Alternative: Store AI keys in site_settings
-- =====================================================
-- Run this in DreamMaker's Supabase SQL Editor

-- Add columns to site_settings for AI configuration
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS gemini_api_key text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS gemini_is_active boolean DEFAULT false;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS openai_api_key text;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS openai_is_active boolean DEFAULT false;

-- Verify
SELECT id, gemini_api_key, gemini_is_active FROM site_settings LIMIT 1;

-- =====================================================
-- Done!
-- =====================================================
