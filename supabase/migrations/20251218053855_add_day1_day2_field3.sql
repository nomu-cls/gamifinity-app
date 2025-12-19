/*
  # Add field3 for Day 1 and Day 2

  1. Changes
    - Add `day1_field3` for "今日のセミナーの感想をお聞かせください"
    - Add `day2_field3` for "あなたの「好き」と「得意」が合わさることはどんなこと？"

  2. Notes
    - These fields support the complete questionnaires
    - All fields are nullable to maintain backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day1_field3'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day1_field3 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day2_field3'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day2_field3 text;
  END IF;
END $$;