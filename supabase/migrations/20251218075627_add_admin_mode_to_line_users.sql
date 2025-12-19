/*
  # Add admin mode tracking to line_users

  1. Changes
    - Add `is_admin_mode` boolean column to `line_users` table
    - Default value is false
    - Tracks whether user is currently in admin menu mode
  
  2. Purpose
    - Enable admin menu functionality
    - Allow users to toggle between normal and admin mode
    - Persist admin mode state across sessions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'line_users' AND column_name = 'is_admin_mode'
  ) THEN
    ALTER TABLE line_users ADD COLUMN is_admin_mode boolean DEFAULT false;
  END IF;
END $$;