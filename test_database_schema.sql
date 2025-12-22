-- =====================================================
-- TalentFlow-Test Database Schema
-- =====================================================
-- Run this in TalentFlow-Test Supabase SQL Editor
-- This creates all necessary tables for testing

-- =====================================================
-- 1. LINE Users Table
-- =====================================================
CREATE TABLE IF NOT EXISTS line_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text UNIQUE NOT NULL,
  display_name text,
  email text,
  reminder_enabled boolean DEFAULT true,
  reminder_time time DEFAULT '09:00:00',
  last_reminded_at timestamptz,
  brain_type text CHECK (brain_type IS NULL OR brain_type IN ('left_3d', 'left_2d', 'right_3d', 'right_2d')),
  brain_type_scores jsonb DEFAULT '{"left_3d": 0, "left_2d": 0, "right_3d": 0, "right_2d": 0}'::jsonb,
  diagnosis_completed boolean DEFAULT false,
  diagnosis_completed_at timestamptz,
  progress_level integer DEFAULT 1,
  total_points integer DEFAULT 0,
  is_admin_mode boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_line_users_line_user_id ON line_users(line_user_id);
ALTER TABLE line_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon read line_users" ON line_users FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert line_users" ON line_users FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update line_users" ON line_users FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access line_users" ON line_users FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- 2. User Stories Table
-- =====================================================
CREATE TABLE IF NOT EXISTS user_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  line_user_id text,
  device_id text,
  name text,
  email text DEFAULT '',
  day1_field1 text DEFAULT '',
  day1_field2 text DEFAULT '',
  day1_field3 text,
  day2_field1 text DEFAULT '',
  day2_field2 text DEFAULT '',
  day2_field3 text,
  day3_field1 text DEFAULT '',
  day3_field2 text DEFAULT '',
  day3_field3 text,
  story_data jsonb DEFAULT '{}'::jsonb,
  unlocked_days jsonb DEFAULT '[1]',
  progress integer DEFAULT 0,
  is_locked boolean DEFAULT false,
  user_phase text DEFAULT 'passenger',
  intro_progress integer DEFAULT 0,
  daily_logs jsonb DEFAULT '{}'::jsonb,
  brain_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_stories_device_id ON user_stories(device_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_line_user_id ON user_stories(line_user_id);
ALTER TABLE user_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can view story" ON user_stories FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert story" ON user_stories FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update story" ON user_stories FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- =====================================================
-- 3. Site Settings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  active_days jsonb DEFAULT '[1, 2, 3]'::jsonb,
  site_title text,
  site_subtitle text,
  app_title text,
  admin_users text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can update site_settings" ON site_settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can insert site_settings" ON site_settings FOR INSERT WITH CHECK (true);

INSERT INTO site_settings (site_title, app_title, admin_users) 
VALUES ('TalentFlow Test', 'SPACELINES', '')
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. Day Settings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS day_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day integer NOT NULL UNIQUE CHECK (day >= 1 AND day <= 10),
  subtitle text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  date text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  bg_color text NOT NULL DEFAULT 'sage',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE day_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read day_settings" ON day_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Allow insert day_settings" ON day_settings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow update day_settings" ON day_settings FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- =====================================================
-- 5. Diagnostics Table
-- =====================================================
CREATE TABLE IF NOT EXISTS diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  questions jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can read diagnostics" ON diagnostics FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert diagnostics" ON diagnostics FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update diagnostics" ON diagnostics FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete diagnostics" ON diagnostics FOR DELETE TO anon USING (true);

-- =====================================================
-- 6. Diagnostic Answers Table
-- =====================================================
CREATE TABLE IF NOT EXISTS diagnostic_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text NOT NULL,
  diagnostic_id uuid REFERENCES diagnostics(id),
  answers jsonb DEFAULT '[]'::jsonb,
  result_type text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE diagnostic_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can read diagnostic_answers" ON diagnostic_answers FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert diagnostic_answers" ON diagnostic_answers FOR INSERT TO anon WITH CHECK (true);

-- =====================================================
-- 7. Health Metrics Table (HRV)
-- =====================================================
CREATE TABLE IF NOT EXISTS health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text NOT NULL,
  heart_rate integer,
  hrv_sdnn numeric,
  hrv_rmssd numeric,
  stress_level text DEFAULT 'moderate',
  autonomic_balance text DEFAULT 'balanced',
  brain_type text,
  ai_feedback text,
  measurement_duration integer DEFAULT 30,
  signal_quality numeric DEFAULT 0,
  raw_rr_intervals jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_metrics_line_user_id ON health_metrics(line_user_id);
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can read health_metrics" ON health_metrics FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert health_metrics" ON health_metrics FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update health_metrics" ON health_metrics FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- =====================================================
-- 8. Vision Board Images Table
-- =====================================================
CREATE TABLE IF NOT EXISTS vision_board_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text NOT NULL,
  image_url text NOT NULL,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vision_board_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can read vision_board_images" ON vision_board_images FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert vision_board_images" ON vision_board_images FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can delete vision_board_images" ON vision_board_images FOR DELETE TO anon USING (true);

-- =====================================================
-- 9. AI Settings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL UNIQUE,
  api_key_encrypted text,
  is_active boolean DEFAULT false,
  is_valid boolean DEFAULT NULL,
  last_validated_at timestamptz DEFAULT NULL,
  validation_error text DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_settings DISABLE ROW LEVEL SECURITY;
GRANT ALL ON ai_settings TO anon, authenticated, service_role;

INSERT INTO ai_settings (provider, is_active) VALUES ('gemini', false), ('openai', false) ON CONFLICT DO NOTHING;

-- =====================================================
-- Done! Test database schema created
-- =====================================================
