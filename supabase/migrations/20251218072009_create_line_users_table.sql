/*
  # Create LINE Users Table

  1. New Tables
    - `line_users`
      - `id` (uuid, primary key)
      - `line_user_id` (text, unique) - LINE User ID
      - `display_name` (text) - User's display name
      - `reminder_enabled` (boolean) - Whether reminders are enabled
      - `reminder_time` (time) - Time to send daily reminders (default 09:00)
      - `last_reminded_at` (timestamptz) - Last reminder sent timestamp
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `line_users` table
    - Add policy for service role access only
*/

CREATE TABLE IF NOT EXISTS line_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text UNIQUE NOT NULL,
  display_name text,
  reminder_enabled boolean DEFAULT true,
  reminder_time time DEFAULT '09:00:00',
  last_reminded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE line_users ENABLE ROW LEVEL SECURITY;

-- Service role can manage all users
CREATE POLICY "Service role can manage line users"
  ON line_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_line_users_line_user_id ON line_users(line_user_id);
CREATE INDEX IF NOT EXISTS idx_line_users_reminder_enabled ON line_users(reminder_enabled) WHERE reminder_enabled = true;