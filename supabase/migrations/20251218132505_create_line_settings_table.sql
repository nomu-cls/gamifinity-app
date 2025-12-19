/*
  # Create line_settings table for LINE configuration

  1. New Tables
    - `line_settings`
      - `id` (uuid, primary key)
      - `channel_access_token` (text) - LINE Messaging API access token
      - `channel_secret` (text) - LINE channel secret for signature verification
      - `liff_url` (text) - LIFF app URL for the form
      - `admin_password` (text) - Password for admin mode in LINE
      - `is_active` (boolean) - Whether LINE integration is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `line_message_templates`
      - `id` (uuid, primary key)
      - `template_key` (text, unique) - Template identifier
      - `template_name` (text) - Display name for admin
      - `message_content` (text) - Message template with placeholders
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Only authenticated users can read/update settings

  3. Initial Data
    - Seed with current settings and default message templates
*/

CREATE TABLE IF NOT EXISTS line_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_access_token text NOT NULL DEFAULT '',
  channel_secret text NOT NULL DEFAULT '',
  liff_url text NOT NULL DEFAULT '',
  admin_password text NOT NULL DEFAULT 'admin2025',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE line_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read line_settings"
  ON line_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update line_settings"
  ON line_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on line_settings"
  ON line_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS line_message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text NOT NULL UNIQUE,
  template_name text NOT NULL,
  message_content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE line_message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read line_message_templates"
  ON line_message_templates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update line_message_templates"
  ON line_message_templates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on line_message_templates"
  ON line_message_templates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

INSERT INTO line_settings (channel_access_token, channel_secret, liff_url, admin_password) VALUES
('LubWxNCaMtbj69PfOEXBajeK02Zcyf1AmPuQq8NmEIOmcLsm06WckxP401TagSBE3K4p/7RwKNj1yrfJzwH6CoBsIArWQy7LgYdEv8DtTlCSPgCcq+24Dq3siOfE12ITtMi4RJIO9voGYBXmOIkhhQdB04t89/1O/w1cDnyilFU=',
'4c1a835ee80751a4b7d4e0dda12dca03',
'https://liff.line.me/2008723961-kvLXuRgp',
'admin2025')
ON CONFLICT DO NOTHING;

INSERT INTO line_message_templates (template_key, template_name, message_content) VALUES
('welcome', '友だち追加時メッセージ', '友だち追加ありがとうございます！

予測ストーリー記録システムへようこそ。

まずはメールアドレスを登録してください
このメッセージに返信する形で、あなたのメールアドレスを送信してください。

例: example@mail.com

メールアドレスを登録すると：
- 課題の提出状況と連携
- 未提出時に自動リマインダー
- 学習の進捗をサポート'),

('email_registered', 'メールアドレス登録完了', 'メールアドレス「{{email}}」を登録しました！

課題の提出状況と連携され、未提出時にリマインダーをお送りします。

「リマインダーオン」でリマインダーを有効化できます。'),

('reminder', '課題リマインダー', 'おはようございます！

Day {{day}} 「{{title}}」の課題がまだ未提出です。
今日の予測ストーリーを書きましょう！

下記のフォームから記入してください：
{{liff_url}}'),

('reward_notification', '特典送信通知', '{{reward_type}}をお届けします！

{{reward_title}}

{{reward_message}}

▼ 特典はこちら ▼
{{reward_url}}'),

('help', 'ヘルプメッセージ', 'こんにちは！予測ストーリー記録システムです。

コマンド：
- 「ヘルプ」→使い方表示
- 「メール」→登録情報確認
- 「リマインダーオン」→リマインダー有効化
- 「リマインダーオフ」→リマインダー停止'),

('email_request', 'メール登録依頼', 'メールアドレスが未登録です

このシステムを利用するには、メールアドレスの登録が必要です。

メールアドレスを送信してください
このメッセージに返信する形で、あなたのメールアドレスを送信してください。

例: example@mail.com'),

('reminder_on', 'リマインダー有効化', 'リマインダーをオンにしました！毎日朝9時に予測リマインダーをお送りします。'),

('reminder_off', 'リマインダー無効化', 'リマインダーをオフにしました。')
ON CONFLICT (template_key) DO NOTHING;