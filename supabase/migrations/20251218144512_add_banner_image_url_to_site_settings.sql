/*
  # Add Banner Image URL to Site Settings

  1. Changes
    - Add `banner_image_url` field to `site_settings` table
      - Stores the URL for the banner image/icon
      - Optional field (nullable)
      - Allows administrators to customize the banner visual

  2. Purpose
    - Enable customization of the banner icon/image displayed in the session invitation banner
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'banner_image_url'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN banner_image_url text;
  END IF;
END $$;