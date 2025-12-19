/*
  # Add YouTube URL to Day Settings

  1. Changes
    - Add `youtube_url` column to `day_settings` table
    - This allows embedding YouTube videos for each day's content

  2. Notes
    - URL should be a YouTube video link (youtu.be or youtube.com format)
    - Used for embedded video player with view tracking
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'day_settings' AND column_name = 'youtube_url'
  ) THEN
    ALTER TABLE day_settings ADD COLUMN youtube_url text DEFAULT '';
  END IF;
END $$;