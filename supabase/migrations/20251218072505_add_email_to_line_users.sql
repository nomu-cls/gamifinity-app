/*
  # Add Email to LINE Users Table

  1. Changes
    - Add `email` column to `line_users` table
    - Create index for faster email lookups

  2. Notes
    - This enables matching LINE users with their story data via email
    - Users can register their email by sending it via LINE
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'line_users' AND column_name = 'email'
  ) THEN
    ALTER TABLE line_users ADD COLUMN email text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_line_users_email ON line_users(email);