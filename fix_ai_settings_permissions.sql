-- =====================================================
-- Fix AI Settings Permissions and Add Missing Columns
-- =====================================================
-- Run this in DreamMaker's Supabase SQL Editor

-- 1. Add missing column to hot_lead_logs
ALTER TABLE hot_lead_logs ADD COLUMN IF NOT EXISTS analysis_reason text;

-- 2. Fix ai_settings permissions - allow all operations
DROP POLICY IF EXISTS "Service role can manage ai_settings" ON ai_settings;

-- Allow full access for service role and anon (since Edge Function uses service role internally)
CREATE POLICY "Allow all on ai_settings" ON ai_settings FOR ALL USING (true) WITH CHECK (true);

-- 3. Grant permissions to anon role as well (fallback)
GRANT ALL ON ai_settings TO anon;
GRANT ALL ON ai_settings TO authenticated;

-- =====================================================
-- Done!
-- =====================================================
