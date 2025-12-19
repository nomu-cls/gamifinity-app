/*
  # ギフトコンテンツテーブルの作成

  1. 新しいテーブル
    - `gift_contents`
      - `id` (uuid, primary key)
      - `title` (text) - ギフトのタイトル
      - `message` (text) - メッセージテキスト
      - `audio_url` (text) - 音声ファイルのURL
      - `is_active` (boolean) - 表示するかどうか（デフォルト: true）
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. セキュリティ
    - RLSを有効化
    - 認証済みユーザーは読み取り可能
    - サービスロールのみが作成・更新可能（管理者用）
*/

CREATE TABLE IF NOT EXISTS gift_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  audio_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gift_contents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active gift contents"
  ON gift_contents
  FOR SELECT
  USING (is_active = true);

-- 初期データを挿入
INSERT INTO gift_contents (title, message, audio_url, is_active)
VALUES (
  'おめでとうございます！',
  'すべての課題を完了されました。あなたの魔法の旅路はここから始まります。',
  '',
  true
);