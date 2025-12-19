/*
  # Add LINE User ID to User Stories Table

  1. Changes
    - Add `line_user_id` column to `user_stories` table
    - Add foreign key constraint to `line_users` table
    - Create index for faster lookups

  2. Notes
    - This enables linking LINE users with their story data
    - Used for sending reminders only to users who haven't submitted tasks
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'line_user_id'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN line_user_id text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_stories_line_user_id ON user_stories(line_user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_stories_line_user_id_fkey'
  ) THEN
    ALTER TABLE user_stories
    ADD CONSTRAINT user_stories_line_user_id_fkey
    FOREIGN KEY (line_user_id)
    REFERENCES line_users(line_user_id)
    ON DELETE SET NULL;
  END IF;
END $$;