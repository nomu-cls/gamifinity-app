/*
  # Add additional fields for Day 3 questions

  1. Changes
    - Add `day3_field3` for "3日間の講座で一番の気づき"
    - Add `day3_field4` for "学んだことを続けるための環境"
    - Add `day3_field5` for "講座の評価（10段階）"
    - Add `day3_field6` for "評価の理由"

  2. Notes
    - These fields support the expanded Day 3 questionnaire
    - All fields are nullable to maintain backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day3_field3'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day3_field3 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day3_field4'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day3_field4 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day3_field5'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day3_field5 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day3_field6'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day3_field6 text;
  END IF;
END $$;