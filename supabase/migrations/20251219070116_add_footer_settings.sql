/*
  # Add Footer Settings to Site Settings

  1. Changes
    - Add `footer_line1` text column for first line of footer (e.g., "Produced by ...")
    - Add `footer_line2` text column for second line of footer (e.g., "© 2026 ...")
    
  2. Notes
    - Both fields are optional with empty string defaults
    - Allows admin to customize footer content through the admin panel
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'footer_line1'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN footer_line1 text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'footer_line2'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN footer_line2 text DEFAULT '';
  END IF;
END $$;