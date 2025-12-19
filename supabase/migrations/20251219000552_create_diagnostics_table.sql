/*
  # Create Diagnostics Table for Brain Type Assessment

  1. New Tables
    - `diagnostics` (診断セット管理)
      - `id` (uuid, primary key)
      - `theme` (text) - 診断のテーマ（例：「仕事の進め方」）
      - `title` (text) - 診断タイトル
      - `description` (text) - 診断の説明
      - `questions` (jsonb) - 質問データ配列
      - `is_active` (boolean) - 有効/無効フラグ
      - `created_at`, `updated_at` (timestamptz)

  2. Questions JSON Structure
    Each question object contains:
    - question_id: string (unique identifier)
    - question_text: string (質問文)
    - options: array of objects with:
      - option_id: string
      - option_text: string (選択肢テキスト)
      - brain_type: string (left_3d, left_2d, right_3d, right_2d)
      - score: number (加算ポイント)

  3. Security
    - Enable RLS
    - Service role full access
    - Anonymous users can read active diagnostics
*/

CREATE TABLE IF NOT EXISTS diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  questions jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage diagnostics"
  ON diagnostics
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read active diagnostics"
  ON diagnostics
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE INDEX IF NOT EXISTS idx_diagnostics_is_active ON diagnostics(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_diagnostics_display_order ON diagnostics(display_order);