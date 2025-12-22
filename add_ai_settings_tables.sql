-- =====================================================
-- Add AI Settings and Other Missing Tables
-- =====================================================
-- Run this in DreamMaker's Supabase SQL Editor

-- 1. AI Settings Table (for Gemini/OpenAI API keys)
CREATE TABLE IF NOT EXISTS ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text UNIQUE NOT NULL CHECK (provider IN ('gemini', 'openai')),
  api_key_encrypted text,
  is_active boolean DEFAULT false,
  is_valid boolean DEFAULT NULL,
  last_validated_at timestamptz,
  validation_error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Service role only - RLS will deny anon access (managed via Edge Function)
CREATE POLICY "Service role can manage ai_settings" 
  ON ai_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Insert default rows for each provider
INSERT INTO ai_settings (provider, is_active) VALUES ('gemini', false) ON CONFLICT (provider) DO NOTHING;
INSERT INTO ai_settings (provider, is_active) VALUES ('openai', false) ON CONFLICT (provider) DO NOTHING;

-- 2. Diagnostic Answers Table (stores user answers)
CREATE TABLE IF NOT EXISTS diagnostic_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text NOT NULL,
  diagnostic_id uuid REFERENCES diagnostics(id) ON DELETE SET NULL,
  answers jsonb DEFAULT '{}'::jsonb,
  result_brain_type text,
  scores jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_answers_line_user_id ON diagnostic_answers(line_user_id);

ALTER TABLE diagnostic_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can insert diagnostic_answers" 
  ON diagnostic_answers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can read diagnostic_answers" 
  ON diagnostic_answers FOR SELECT TO anon USING (true);

-- 3. Hot Lead Logs Table (optional, for chat admin features)
CREATE TABLE IF NOT EXISTS hot_lead_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text NOT NULL,
  triggered_at timestamptz DEFAULT now(),
  score integer,
  sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hot_lead_logs_line_user_id ON hot_lead_logs(line_user_id);

ALTER TABLE hot_lead_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read hot_lead_logs" ON hot_lead_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert hot_lead_logs" ON hot_lead_logs FOR INSERT TO anon WITH CHECK (true);

-- =====================================================
-- Done! AI settings and other tables created
-- =====================================================
