/*
  # Add site title settings to site_settings table

  1. Changes
    - Add `site_title` field (text, nullable) - Main site title
    - Add `site_subtitle` field (text, nullable) - Site subtitle/description
    
  2. Notes
    - These fields will be used to display customizable site title and subtitle
    - Defaults will be set by application code if not specified
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'site_title'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN site_title text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'site_subtitle'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN site_subtitle text;
  END IF;
END $$;
