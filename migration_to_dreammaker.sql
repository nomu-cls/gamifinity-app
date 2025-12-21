-- =====================================================
-- Gamifinity Tables Migration for Dream Maker Supabase
-- =====================================================
-- Run this in Dream Maker's Supabase SQL Editor
-- This adds Gamifinity tables alongside existing Dream Maker tables

-- =====================================================
-- 1. LINE Users Table (Central user linking)
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
  -- Link to Dream Maker users table
  dm_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_line_users_line_user_id ON line_users(line_user_id);
CREATE INDEX IF NOT EXISTS idx_line_users_email ON line_users(email);
CREATE INDEX IF NOT EXISTS idx_line_users_dm_user_id ON line_users(dm_user_id);

ALTER TABLE line_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read line_users" ON line_users FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous update line_users" ON line_users FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access line_users" ON line_users FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- 2. User Stories Table (Gamifinity journey data)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  line_user_id text REFERENCES line_users(line_user_id) ON DELETE SET NULL,
  device_id text,
  name text,
  email text DEFAULT '',
  
  -- Day 1-3 fields
  day1_field1 text DEFAULT '',
  day1_field2 text DEFAULT '',
  day1_field3 text,
  day2_field1 text DEFAULT '',
  day2_field2 text DEFAULT '',
  day2_field3 text,
  day3_field1 text DEFAULT '',
  day3_field2 text DEFAULT '',
  day3_field3 text,
  day3_field4 text,
  day3_field5 text,
  day3_field6 text,
  
  -- Flexible story data
  story_data jsonb DEFAULT '{}'::jsonb,
  
  -- Progress tracking
  unlocked_days jsonb DEFAULT '[1]',
  progress integer DEFAULT 0,
  is_locked boolean DEFAULT false,
  
  -- Gift system
  is_gift_sent boolean DEFAULT false,
  is_gift_viewed boolean DEFAULT false,
  
  -- Deadlines & Revival
  submission_deadline timestamptz,
  revival_requested boolean DEFAULT false,
  
  -- Rewards
  day1_reward_viewed boolean DEFAULT false,
  day2_reward_viewed boolean DEFAULT false,
  day3_reward_viewed boolean DEFAULT false,
  
  -- Archive URLs
  day1_archive_url text,
  day1_archive_expires_at timestamptz,
  day2_archive_url text,
  day2_archive_expires_at timestamptz,
  day3_archive_url text,
  day3_archive_expires_at timestamptz,
  
  -- Google Sheets
  google_sheets_url text DEFAULT '',
  submitted_at timestamptz,
  
  -- Session booking
  is_session_booked boolean DEFAULT false,
  booked_at timestamptz,
  event_schedule text,
  event_url text,
  event_password text,
  
  -- Daily Navigation System
  user_phase text DEFAULT 'passenger',
  intro_progress integer DEFAULT 0,
  daily_logs jsonb DEFAULT '{}'::jsonb,
  brain_type text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_stories_user_id ON user_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_device_id ON user_stories(device_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_line_user_id ON user_stories(line_user_id);

ALTER TABLE user_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guest users can view story" ON user_stories FOR SELECT TO anon USING (true);
CREATE POLICY "Guest users can insert story" ON user_stories FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Guest users can update story" ON user_stories FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_stories_updated_at
  BEFORE UPDATE ON user_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. Site Settings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  active_days jsonb DEFAULT '[1, 2, 3]'::jsonb,
  day1_archive_deadline timestamptz,
  day2_archive_deadline timestamptz,
  day3_archive_deadline timestamptz,
  day1_assignment_deadline timestamptz,
  day2_assignment_deadline timestamptz,
  day3_assignment_deadline timestamptz,
  default_submission_time text DEFAULT '23:59',
  enable_revival_system boolean DEFAULT true,
  site_title text,
  site_subtitle text,
  app_title text,
  banner_text text DEFAULT '',
  banner_subtext text DEFAULT '',
  banner_button_text text DEFAULT '',
  banner_image_url text,
  banner_link_url text,
  footer_line1 text DEFAULT '',
  footer_line2 text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can update site_settings" ON site_settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can insert site_settings" ON site_settings FOR INSERT WITH CHECK (true);

INSERT INTO site_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

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
  zoom_link text DEFAULT '',
  zoom_passcode text,
  zoom_meeting_time timestamptz,
  youtube_url text DEFAULT '',
  preview_text text DEFAULT '',
  preview_image_url text DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE day_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read day_settings" ON day_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow insert day_settings" ON day_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow update day_settings" ON day_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 5. Day Rewards Table
-- =====================================================
CREATE TABLE IF NOT EXISTS day_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day integer NOT NULL CHECK (day >= 1 AND day <= 10),
  title text NOT NULL,
  message text NOT NULL,
  image_url text,
  reward_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE day_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view day_rewards" ON day_rewards FOR SELECT TO public USING (true);

-- =====================================================
-- 6. Gift Contents Table
-- =====================================================
CREATE TABLE IF NOT EXISTS gift_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  audio_url text,
  image_url text,
  reward_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gift_contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active gift_contents" ON gift_contents FOR SELECT USING (is_active = true);

-- =====================================================
-- 7. LINE Settings Table
-- =====================================================
CREATE TABLE IF NOT EXISTS line_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_access_token text NOT NULL DEFAULT '',
  channel_secret text NOT NULL DEFAULT '',
  liff_url text NOT NULL DEFAULT '',
  bot_basic_id text DEFAULT '',
  admin_password text NOT NULL DEFAULT 'admin2025',
  admin_line_user_id text DEFAULT '',
  hot_lead_enabled boolean NOT NULL DEFAULT false,
  hot_lead_threshold integer NOT NULL DEFAULT 7,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE line_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon can read line_settings" ON line_settings FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can update line_settings" ON line_settings FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access line_settings" ON line_settings FOR ALL TO service_role USING (true) WITH CHECK (true);

INSERT INTO line_settings (channel_access_token, channel_secret, liff_url, admin_password) 
VALUES ('', '', '', 'admin2025') ON CONFLICT DO NOTHING;

-- =====================================================
-- 8. LINE Message Templates Table
-- =====================================================
CREATE TABLE IF NOT EXISTS line_message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE,
  template_name text NOT NULL,
  message_content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE line_message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read line_message_templates" ON line_message_templates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can update line_message_templates" ON line_message_templates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- 9. Diagnostics Table (Brain Type)
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
CREATE POLICY "Anon can read all diagnostics" ON diagnostics FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert diagnostics" ON diagnostics FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update diagnostics" ON diagnostics FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete diagnostics" ON diagnostics FOR DELETE TO anon USING (true);

-- =====================================================
-- 10. LINE Messages Table (Chat)
-- =====================================================
CREATE TABLE IF NOT EXISTS line_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type text NOT NULL DEFAULT 'text',
  message_text text,
  message_data jsonb DEFAULT '{}',
  line_message_id text,
  reply_to_message_id uuid REFERENCES line_messages(id),
  sent_by_admin text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_line_messages_user_id ON line_messages(line_user_id);
CREATE INDEX IF NOT EXISTS idx_line_messages_created_at ON line_messages(created_at DESC);

ALTER TABLE line_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read line_messages" ON line_messages FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert line_messages" ON line_messages FOR INSERT TO anon WITH CHECK (true);

-- =====================================================
-- 11. Chat Status Table
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text UNIQUE NOT NULL,
  unread_count integer DEFAULT 0,
  last_message_at timestamptz DEFAULT now(),
  last_admin_reply_at timestamptz,
  is_starred boolean DEFAULT false,
  notes text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous read chat_status" ON chat_status FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert chat_status" ON chat_status FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous update chat_status" ON chat_status FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- =====================================================
-- 12. Health Metrics Table (HRV)
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
-- Done! Gamifinity tables added to Dream Maker
-- =====================================================
