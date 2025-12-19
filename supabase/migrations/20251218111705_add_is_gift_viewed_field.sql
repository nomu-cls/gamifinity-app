/*
  # Add is_gift_viewed field

  1. Changes
    - Add `is_gift_viewed` boolean column to `user_stories` table
    - Track whether user has viewed the perfect award gift
  
  2. Default Value
    - Defaults to false (not viewed)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'is_gift_viewed'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN is_gift_viewed boolean DEFAULT false;
  END IF;
END $$;