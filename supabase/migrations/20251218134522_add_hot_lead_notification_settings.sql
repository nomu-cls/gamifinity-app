/*
  # Add Hot Lead Notification Settings

  1. Changes to `line_settings`
    - `admin_line_user_id` (text) - LINE user ID of admin to receive hot lead notifications
    - `hot_lead_enabled` (boolean) - Enable/disable hot lead notifications
    - `hot_lead_threshold` (integer) - Score threshold (1-10) to trigger notification

  2. New Table `hot_lead_logs`
    - `id` (uuid, primary key)
    - `line_user_id` (text) - The user identified as hot lead
    - `user_email` (text) - User's email
    - `user_name` (text) - User's display name
    - `day_number` (integer) - Which day's assignment triggered this
    - `assignment_content` (text) - Summary of assignment content
    - `score` (integer) - Hot lead score (1-10)
    - `analysis_reason` (text) - AI's reasoning for the score
    - `notified_at` (timestamptz) - When admin was notified
    - `created_at` (timestamptz)

  3. New Message Template
    - `hot_lead_admin_notify` - Template for admin notification

  4. Security
    - Enable RLS on hot_lead_logs
    - Service role only access for hot_lead_logs
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'line_settings' AND column_name = 'admin_line_user_id'
  ) THEN
    ALTER TABLE line_settings ADD COLUMN admin_line_user_id text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'line_settings' AND column_name = 'hot_lead_enabled'
  ) THEN
    ALTER TABLE line_settings ADD COLUMN hot_lead_enabled boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'line_settings' AND column_name = 'hot_lead_threshold'
  ) THEN
    ALTER TABLE line_settings ADD COLUMN hot_lead_threshold integer NOT NULL DEFAULT 7;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS hot_lead_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text NOT NULL,
  user_email text,
  user_name text,
  day_number integer NOT NULL,
  assignment_content text NOT NULL,
  score integer NOT NULL CHECK (score >= 1 AND score <= 10),
  analysis_reason text NOT NULL,
  notified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hot_lead_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on hot_lead_logs"
  ON hot_lead_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read hot_lead_logs"
  ON hot_lead_logs
  FOR SELECT
  TO authenticated
  USING (true);

INSERT INTO line_message_templates (template_key, template_name, message_content) VALUES
('hot_lead_admin_notify', 'ホットリード通知（運営者向け）', '【ホットリード検知】

{{user_name}}さん（{{user_email}}）

Day{{day_number}}の課題回答を分析した結果、購買意欲が非常に高いと判断しました。

▼ スコア: {{score}}/10

▼ 分析理由:
{{analysis_reason}}

▼ 回答内容（抜粋）:
{{assignment_summary}}

今すぐ個別メッセージを送ってください！')
ON CONFLICT (template_key) DO NOTHING;
