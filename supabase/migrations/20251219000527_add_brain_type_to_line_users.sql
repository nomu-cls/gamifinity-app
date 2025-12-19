/*
  # Add Brain Type and Progress Fields to line_users

  1. Changes
    - Add `brain_type` column (enum: left_3d, left_2d, right_3d, right_2d)
    - Add `brain_type_scores` column (jsonb for storing scores per type)
    - Add `diagnosis_completed` boolean flag
    - Add `diagnosis_completed_at` timestamp
    - Add `progress_level` integer for gamification
    - Add `total_points` integer for gamification

  2. Brain Type Definition
    - left_3d: 左脳3次元（合理主義）- 論理的、本質重視、効率的
    - left_2d: 左脳2次元（原理主義）- 緻密、規則・ルール重視
    - right_3d: 右脳3次元（拡張主義）- 行動的、情熱、独創的
    - right_2d: 右脳2次元（温情主義）- 人間関係重視、平和、共感

  3. Notes
    - These fields enable brain type diagnosis and personalization
    - Scores are stored as JSON to track per-type scoring
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'line_users' AND column_name = 'brain_type'
  ) THEN
    ALTER TABLE line_users ADD COLUMN brain_type text;
    ALTER TABLE line_users ADD CONSTRAINT brain_type_check 
      CHECK (brain_type IS NULL OR brain_type IN ('left_3d', 'left_2d', 'right_3d', 'right_2d'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'line_users' AND column_name = 'brain_type_scores'
  ) THEN
    ALTER TABLE line_users ADD COLUMN brain_type_scores jsonb DEFAULT '{"left_3d": 0, "left_2d": 0, "right_3d": 0, "right_2d": 0}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'line_users' AND column_name = 'diagnosis_completed'
  ) THEN
    ALTER TABLE line_users ADD COLUMN diagnosis_completed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'line_users' AND column_name = 'diagnosis_completed_at'
  ) THEN
    ALTER TABLE line_users ADD COLUMN diagnosis_completed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'line_users' AND column_name = 'progress_level'
  ) THEN
    ALTER TABLE line_users ADD COLUMN progress_level integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'line_users' AND column_name = 'total_points'
  ) THEN
    ALTER TABLE line_users ADD COLUMN total_points integer DEFAULT 0;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_line_users_brain_type ON line_users(brain_type);
CREATE INDEX IF NOT EXISTS idx_line_users_diagnosis_completed ON line_users(diagnosis_completed) WHERE diagnosis_completed = true;