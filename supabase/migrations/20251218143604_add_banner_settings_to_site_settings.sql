/*
  # Add Banner Settings to Site Settings

  1. Changes
    - Add `banner_text` field to `site_settings` table
      - Stores the main banner message text (e.g., "個別セッションでは、この物語を一緒に読み解き、")
      - Default: "個別セッションでは、この物語を一緒に読み解き、"
    - Add `banner_subtext` field to `site_settings` table
      - Stores the banner subtext (e.g., "あなたの魂を癒す「魔法のアファメーション」を贈ります。")
      - Default: "あなたの魂を癒す「魔法のアファメーション」を贈ります。"
    - Add `banner_button_text` field to `site_settings` table
      - Stores the button text on the banner (e.g., "物語の続きをセッションで描く")
      - Default: "物語の続きをセッションで描く"

  2. Purpose
    - Allow administrators to customize the banner content displayed to users
    - Provides flexibility for different messaging and call-to-actions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'banner_text'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN banner_text text DEFAULT '個別セッションでは、この物語を一緒に読み解き、';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'banner_subtext'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN banner_subtext text DEFAULT 'あなたの魂を癒す「魔法のアファメーション」を贈ります。';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'banner_button_text'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN banner_button_text text DEFAULT '物語の続きをセッションで描く';
  END IF;
END $$;