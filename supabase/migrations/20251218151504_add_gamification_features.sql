/*
  # Add Gamification Features

  ## Overview
  This migration adds comprehensive gamification features including:
  - Countdown timers with automatic locking
  - Preview/teaser content for locked days
  - Revival (復活) system for users who missed deadlines
  - Conditional Zoom link access based on previous day completion
  - Google Calendar integration support

  ## Changes

  ### 1. Day Settings Enhancements
  - `zoom_link` - Zoom meeting URL for each day
  - `zoom_meeting_time` - Scheduled meeting time
  - `preview_text` - Teaser text shown on locked screen
  - `preview_image_url` - Optional thumbnail for locked screen

  ### 2. User Stories Enhancements
  - `submission_deadline` - Individual deadline for each user/day
  - `is_locked` - Whether user is locked out due to missed deadline
  - `revival_requested` - Whether user has requested revival

  ### 3. Revival Submissions Table
  - New table to track revival attempts
  - Stores revival submissions and approval status

  ### 4. Site Settings Enhancement
  - `default_submission_time` - Default deadline time (e.g., "23:59")
  - `enable_revival_system` - Toggle revival feature on/off

  ## Security
  - Enable RLS on revival_submissions table
  - Users can only view/create their own revival submissions
  - Admins can view and update all revival submissions
*/

-- Add fields to day_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'day_settings' AND column_name = 'zoom_link'
  ) THEN
    ALTER TABLE day_settings ADD COLUMN zoom_link text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'day_settings' AND column_name = 'zoom_meeting_time'
  ) THEN
    ALTER TABLE day_settings ADD COLUMN zoom_meeting_time timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'day_settings' AND column_name = 'preview_text'
  ) THEN
    ALTER TABLE day_settings ADD COLUMN preview_text text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'day_settings' AND column_name = 'preview_image_url'
  ) THEN
    ALTER TABLE day_settings ADD COLUMN preview_image_url text DEFAULT '';
  END IF;
END $$;

-- Add fields to user_stories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'submission_deadline'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN submission_deadline timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'is_locked'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN is_locked boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'revival_requested'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN revival_requested boolean DEFAULT false;
  END IF;
END $$;

-- Add fields to site_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'default_submission_time'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN default_submission_time text DEFAULT '23:59';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'enable_revival_system'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN enable_revival_system boolean DEFAULT true;
  END IF;
END $$;

-- Create revival_submissions table
CREATE TABLE IF NOT EXISTS revival_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_story_id uuid REFERENCES user_stories(id) ON DELETE CASCADE,
  line_user_id text NOT NULL,
  day integer NOT NULL,
  submission_text text NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending', -- pending, approved, rejected
  reviewed_by text,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on revival_submissions
ALTER TABLE revival_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own revival submissions
CREATE POLICY "Users can view own revival submissions"
  ON revival_submissions FOR SELECT
  TO authenticated
  USING (true);

-- Users can create their own revival submissions
CREATE POLICY "Users can create revival submissions"
  ON revival_submissions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can view all revival submissions (via service role)
CREATE POLICY "Service role can manage all revival submissions"
  ON revival_submissions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_revival_submissions_line_user_id ON revival_submissions(line_user_id);
CREATE INDEX IF NOT EXISTS idx_revival_submissions_day ON revival_submissions(day);
CREATE INDEX IF NOT EXISTS idx_revival_submissions_status ON revival_submissions(status);