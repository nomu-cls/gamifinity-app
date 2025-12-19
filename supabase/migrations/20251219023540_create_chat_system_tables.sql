/*
  # Create Chat System Tables

  1. New Tables
    - `line_messages` - Stores all sent and received LINE messages
      - `id` (uuid, primary key)
      - `line_user_id` (text, references line_users)
      - `direction` (text: 'inbound' or 'outbound')
      - `message_type` (text: 'text', 'image', 'sticker', etc.)
      - `message_text` (text, nullable)
      - `message_data` (jsonb, for non-text message data)
      - `line_message_id` (text, LINE's message ID)
      - `reply_to_message_id` (uuid, nullable, self-reference)
      - `sent_by_admin` (text, nullable, admin who sent the message)
      - `created_at` (timestamptz)

    - `chat_status` - Tracks chat status for each user
      - `id` (uuid, primary key)
      - `line_user_id` (text, unique, references line_users)
      - `unread_count` (integer)
      - `last_message_at` (timestamptz)
      - `last_admin_reply_at` (timestamptz, nullable)
      - `is_starred` (boolean)
      - `notes` (text, admin notes about the user)
      - `updated_at` (timestamptz)

    - `chat_templates` - Pre-defined message templates by brain type
      - `id` (uuid, primary key)
      - `brain_type` (text: 'left_3d', 'left_2d', 'right_3d', 'right_2d', 'general')
      - `category` (text: 'greeting', 'follow_up', 'motivation', 'support')
      - `title` (text)
      - `content` (text)
      - `sort_order` (integer)
      - `is_active` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Allow anonymous read/write for chat operations (managed by edge functions)
*/

CREATE TABLE IF NOT EXISTS line_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type text NOT NULL DEFAULT 'text',
  message_text text,
  message_data jsonb DEFAULT '{}',
  line_message_id text,
  reply_to_message_id uuid REFERENCES line_messages(id),
  sent_by_admin text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_line_messages_user_id ON line_messages(line_user_id);
CREATE INDEX IF NOT EXISTS idx_line_messages_created_at ON line_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_line_messages_direction ON line_messages(direction);

CREATE TABLE IF NOT EXISTS chat_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text UNIQUE NOT NULL,
  unread_count integer DEFAULT 0,
  last_message_at timestamptz DEFAULT now(),
  last_admin_reply_at timestamptz,
  is_starred boolean DEFAULT false,
  notes text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_status_last_message ON chat_status(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_status_unread ON chat_status(unread_count DESC);

CREATE TABLE IF NOT EXISTS chat_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brain_type text NOT NULL DEFAULT 'general',
  category text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  content text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_templates_brain_type ON chat_templates(brain_type);

ALTER TABLE line_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read line_messages"
  ON line_messages FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert line_messages"
  ON line_messages FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous read chat_status"
  ON chat_status FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert chat_status"
  ON chat_status FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update chat_status"
  ON chat_status FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anonymous read chat_templates"
  ON chat_templates FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anonymous insert chat_templates"
  ON chat_templates FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous update chat_templates"
  ON chat_templates FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

INSERT INTO chat_templates (brain_type, category, title, content, sort_order) VALUES
  ('left_3d', 'greeting', '合理的な挨拶', 'お疲れ様です。ワークの進捗状況を確認させていただきました。目標達成に向けて、具体的なアクションプランを一緒に整理しましょう。', 1),
  ('left_3d', 'motivation', '目標達成サポート', '現在の進捗から逆算すると、あと◯日で完了できる見込みです。効率的に進めるポイントをお伝えしますね。', 2),
  ('left_3d', 'follow_up', '進捗確認', 'ワークの提出ありがとうございます。データを分析した結果、次のステップとして◯◯に取り組むと効果的です。', 3),
  ('left_3d', 'support', '問題解決', 'ご質問の件、論理的に整理してお答えします。ポイントは3つあります。', 4),
  
  ('left_2d', 'greeting', '丁寧な挨拶', 'いつもワークに取り組んでいただきありがとうございます。一歩一歩着実に進めていらっしゃいますね。', 1),
  ('left_2d', 'motivation', '継続応援', '毎日コツコツと続けることで、確実に成果が積み上がっています。このペースを大切にしていきましょう。', 2),
  ('left_2d', 'follow_up', '詳細フィードバック', 'ワークの内容を丁寧に拝見しました。特に◯◯の部分が素晴らしいです。細部まで気を配っていらっしゃいますね。', 3),
  ('left_2d', 'support', '寄り添いサポート', 'お困りの点について、順を追ってご説明させていただきますね。', 4),
  
  ('right_3d', 'greeting', 'クリエイティブな挨拶', 'こんにちは！あなたのユニークな視点、いつも刺激をもらっています。次はどんな発見があるか楽しみです！', 1),
  ('right_3d', 'motivation', '可能性の提示', '今回のワークから見えた可能性は無限大！この方向性で突き進むと、面白い展開が待っていそうですね。', 2),
  ('right_3d', 'follow_up', 'インスピレーション', 'あなたの回答から、こんなアイデアが浮かびました。ぜひ次のステップで試してみてください！', 3),
  ('right_3d', 'support', '自由な発想サポート', '型にはまらない発想、素晴らしいです！その方向で自由に探求してみましょう。', 4),
  
  ('right_2d', 'greeting', '温かい挨拶', 'こんにちは♪ いつもあなたの温かいワークを読ませていただくのが楽しみです。今日も素敵な一日をお過ごしくださいね。', 1),
  ('right_2d', 'motivation', '感謝と共感', 'あなたの想いがワークから伝わってきて、心が温かくなりました。その感性を大切にしてくださいね。', 2),
  ('right_2d', 'follow_up', '感情に寄り添う', 'ワークに込められた気持ち、しっかり受け取りました。あなたらしさが溢れていて、とても素敵です。', 3),
  ('right_2d', 'support', '安心サポート', '一緒に考えていきましょうね。焦らず、あなたのペースで大丈夫ですよ。', 4),
  
  ('general', 'greeting', '標準挨拶', 'こんにちは。ワークへのご参加ありがとうございます。何かご質問があればお気軽にどうぞ。', 1),
  ('general', 'motivation', '励まし', '順調に進んでいますね！この調子で頑張りましょう。', 2),
  ('general', 'follow_up', 'フォローアップ', 'ワークの提出ありがとうございました。次のステップに進む準備ができましたね。', 3),
  ('general', 'support', 'サポート', 'ご質問ありがとうございます。詳しくご説明させていただきますね。', 4)
ON CONFLICT DO NOTHING;