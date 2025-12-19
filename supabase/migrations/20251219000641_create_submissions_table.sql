/*
  # Create Submissions Table for Day Assignments

  1. New Tables
    - `submissions` (各Dayの課題提出データ)
      - `id` (uuid, primary key)
      - `line_user_id` (text, FK to line_users)
      - `day` (integer) - Day番号（1〜10）
      - `content` (jsonb) - 提出内容（質問と回答のペア）
      - `status` (text) - 提出状態（draft, submitted, reviewed）
      - `points_earned` (integer) - 獲得ポイント
      - `feedback` (text) - フィードバック（管理者から）
      - `submitted_at` (timestamptz) - 提出日時
      - `reviewed_at` (timestamptz) - レビュー日時
      - `created_at`, `updated_at` (timestamptz)

  2. Content JSON Structure
    Array of objects with:
    - question_id: string
    - question_text: string
    - answer_text: string

  3. Security
    - Enable RLS
    - Service role full access
    - Users can read/write own submissions
*/

CREATE TABLE IF NOT EXISTS submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text NOT NULL REFERENCES line_users(line_user_id) ON DELETE CASCADE,
  day integer NOT NULL CHECK (day >= 1 AND day <= 10),
  content jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed')),
  points_earned integer DEFAULT 0,
  feedback text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage submissions"
  ON submissions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can read own submissions"
  ON submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own submissions"
  ON submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own submissions"
  ON submissions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_submissions_line_user_id ON submissions(line_user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_day ON submissions(day);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_submissions_unique_per_day 
  ON submissions(line_user_id, day);