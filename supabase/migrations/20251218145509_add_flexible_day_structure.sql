/*
  # Add Flexible Day Structure Support

  ## Overview
  This migration adds support for flexible day numbering (e.g., Day 1, 3, 5, 7 instead of just 1, 2, 3).

  ## 1. Changes to `site_settings`
    - Add `active_days` (jsonb) - Array of active day numbers [1, 3, 5, 7] etc.
  
  ## 2. Changes to `user_stories`
    - Add `story_data` (jsonb) - Flexible storage for any day's data
      Structure: {"1": {"field1": "...", "field2": "..."}, "3": {...}, ...}
    - Keep existing day1_field1, day2_field1 etc. for backward compatibility

  ## 3. Notes
    - Existing data remains intact
    - New flexible structure can be used alongside old structure
    - Frontend will gradually migrate to use story_data
*/

-- Add active_days to site_settings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'active_days'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN active_days jsonb DEFAULT '[1, 2, 3]'::jsonb;
  END IF;
END $$;

-- Add story_data to user_stories for flexible day storage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'story_data'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN story_data jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Update existing site_settings to have default active_days
UPDATE site_settings 
SET active_days = '[1, 2, 3]'::jsonb 
WHERE active_days IS NULL OR active_days = 'null'::jsonb;

-- Create a function to migrate old data to new structure (for future use)
CREATE OR REPLACE FUNCTION migrate_story_to_flexible_structure(story_id uuid)
RETURNS void AS $$
DECLARE
  story_record RECORD;
  new_story_data jsonb := '{}'::jsonb;
BEGIN
  SELECT * INTO story_record FROM user_stories WHERE id = story_id;
  
  IF story_record IS NULL THEN
    RETURN;
  END IF;
  
  -- Migrate Day 1 data
  IF story_record.day1_field1 IS NOT NULL OR story_record.day1_field2 IS NOT NULL THEN
    new_story_data := jsonb_set(
      new_story_data,
      '{1}',
      jsonb_build_object(
        'field1', COALESCE(story_record.day1_field1, ''),
        'field2', COALESCE(story_record.day1_field2, ''),
        'field3', COALESCE(story_record.day1_field3, '')
      )
    );
  END IF;
  
  -- Migrate Day 2 data
  IF story_record.day2_field1 IS NOT NULL OR story_record.day2_field2 IS NOT NULL THEN
    new_story_data := jsonb_set(
      new_story_data,
      '{2}',
      jsonb_build_object(
        'field1', COALESCE(story_record.day2_field1, ''),
        'field2', COALESCE(story_record.day2_field2, ''),
        'field3', COALESCE(story_record.day2_field3, '')
      )
    );
  END IF;
  
  -- Migrate Day 3 data
  IF story_record.day3_field1 IS NOT NULL OR story_record.day3_field2 IS NOT NULL THEN
    new_story_data := jsonb_set(
      new_story_data,
      '{3}',
      jsonb_build_object(
        'field1', COALESCE(story_record.day3_field1, ''),
        'field2', COALESCE(story_record.day3_field2, ''),
        'field3', COALESCE(story_record.day3_field3, ''),
        'field4', COALESCE(story_record.day3_field4, ''),
        'field5', COALESCE(story_record.day3_field5, ''),
        'field6', COALESCE(story_record.day3_field6, '')
      )
    );
  END IF;
  
  UPDATE user_stories 
  SET story_data = new_story_data 
  WHERE id = story_id;
END;
$$ LANGUAGE plpgsql;