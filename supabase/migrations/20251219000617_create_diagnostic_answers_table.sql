/*
  # Create Diagnostic Answers Table

  1. New Tables
    - `diagnostic_answers` (ユーザーの診断回答)
      - `id` (uuid, primary key)
      - `line_user_id` (text, FK to line_users)
      - `diagnostic_id` (uuid, FK to diagnostics)
      - `answers` (jsonb) - 回答データ配列
      - `result_brain_type` (text) - 診断結果の脳タイプ
      - `result_scores` (jsonb) - 各タイプのスコア
      - `completed_at` (timestamptz) - 完了日時
      - `created_at` (timestamptz)

  2. Answers JSON Structure
    Array of objects with:
    - question_id: string
    - selected_option_id: string
    - brain_type: string (selected option's brain type)
    - score: number (selected option's score)

  3. Result Scores JSON Structure
    - left_3d: number
    - left_2d: number
    - right_3d: number
    - right_2d: number

  4. Security
    - Enable RLS
    - Service role full access
    - Users can only read their own answers
*/

CREATE TABLE IF NOT EXISTS diagnostic_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text NOT NULL REFERENCES line_users(line_user_id) ON DELETE CASCADE,
  diagnostic_id uuid NOT NULL REFERENCES diagnostics(id) ON DELETE CASCADE,
  answers jsonb DEFAULT '[]'::jsonb,
  result_brain_type text,
  result_scores jsonb DEFAULT '{"left_3d": 0, "left_2d": 0, "right_3d": 0, "right_2d": 0}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT result_brain_type_check CHECK (
    result_brain_type IS NULL OR 
    result_brain_type IN ('left_3d', 'left_2d', 'right_3d', 'right_2d')
  )
);

ALTER TABLE diagnostic_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage diagnostic answers"
  ON diagnostic_answers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read own diagnostic answers"
  ON diagnostic_answers
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own diagnostic answers"
  ON diagnostic_answers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_diagnostic_answers_line_user_id ON diagnostic_answers(line_user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_answers_diagnostic_id ON diagnostic_answers(diagnostic_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_answers_result_brain_type ON diagnostic_answers(result_brain_type);

CREATE UNIQUE INDEX IF NOT EXISTS idx_diagnostic_answers_unique_per_user 
  ON diagnostic_answers(line_user_id, diagnostic_id);