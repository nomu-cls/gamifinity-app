/*
  # Add bot_basic_id to line_settings

  1. Changes
    - Add bot_basic_id column to store LINE Official Account Basic ID (starts with @)
    - This is needed to generate correct LINE chat URLs
*/

ALTER TABLE line_settings
ADD COLUMN IF NOT EXISTS bot_basic_id text DEFAULT '';