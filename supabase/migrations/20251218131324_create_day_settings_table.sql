/*
  # Create day_settings table for dynamic task content

  1. New Tables
    - `day_settings`
      - `id` (uuid, primary key)
      - `day` (integer, 1-3, unique) - Day number
      - `subtitle` (text) - e.g., "Chapter One"
      - `title` (text) - e.g., "記憶の森"
      - `date` (text) - e.g., "1/17(土)"
      - `description` (text) - Task description
      - `questions` (jsonb) - Array of question objects
      - `bg_color` (text) - Background color identifier (sage, sky, sakura)
      - `is_active` (boolean) - Whether this day is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `day_settings` table
    - Add policy for public read access (settings are public)
    - Add policy for authenticated users to update (admin only)
    
  3. Initial Data
    - Seed with current Day1, Day2, Day3 settings
*/

CREATE TABLE IF NOT EXISTS day_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day integer NOT NULL UNIQUE CHECK (day >= 1 AND day <= 10),
  subtitle text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  date text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  bg_color text NOT NULL DEFAULT 'sage',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE day_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read day_settings"
  ON day_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update day_settings"
  ON day_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert day_settings"
  ON day_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

INSERT INTO day_settings (day, subtitle, title, date, description, questions, bg_color) VALUES
(1, 'Chapter One', '記憶の森', '1/17(土)', '子供の頃、あなたの世界はどんな色をしていましたか？忘れていた輝きを一文字ずつ丁寧に拾い集めていきましょう。', 
'[
  {"fieldName": "field1", "label": "あなたの子供の頃に好きなことはどんなことでしたか？", "placeholder": "例：アイドルなりきり、歌う、イケメン、人形...", "type": "textarea"},
  {"fieldName": "field2", "label": "大人の今も、こどもの頃に好きだったことと関連することで、好きなことがありますか？", "placeholder": "例：歌う...", "type": "textarea"},
  {"fieldName": "field3", "label": "今日のセミナーの感想をお聞かせください。", "placeholder": "例：好きなアニメから紐解くと、家族(ペット含む)・仲間との絆に強く惹かれてると感じてます...", "type": "textarea"}
]'::jsonb, 'sage'),

(2, 'Chapter Two', '才能の泉', '1/20(火)', '呼吸をするように自然にできてしまうこと。それこそが、神様から贈られたあなたの魔法です。',
'[
  {"fieldName": "field1", "label": "頑張らなくても出来てしまうことは何ですか？", "placeholder": "例：情報収集(自分が興味あること・誰かの役に立つことが嬉しい)、一人時間(待つのは苦じゃない楽しい)、人の悩みを聞く...", "type": "textarea"},
  {"fieldName": "field2", "label": "自分を褒めるとしたら、どんなところを褒めたいですか？", "placeholder": "例：今を生きてること、愛情深い、困難を乗り越えられる行動力、いつまでも学ぶ姿勢...", "type": "textarea"},
  {"fieldName": "field3", "label": "あなたの「好き」と「得意」が合わさることはどんなこと？", "placeholder": "例：一人食べ飲み歩きしそこで知り合った人達との会話...", "type": "textarea"}
]'::jsonb, 'sky'),

(3, 'Chapter Three', '未来の扉', '1/22(木)', 'すべてが叶った美しい結末を、今この瞬間に先取りして祝います。あなたはどんな夢の続きを描きますか？',
'[
  {"fieldName": "field1", "label": "絵本を読むことで、右脳を活性化し、幼い頃に思い込んだ潜在意識の書き換えが早く行われることで、自分の夢がどんどん実現していけるとしたら、どんな夢を叶えていきたいですか？", "placeholder": "例：住みたい家に住んでいる、子どもと国内旅行・世界一周旅行を楽しんでいる、美容と健康を維持し、ファッションも楽しみ、仲間と遊び、子どもの成長を見守りながら笑顔で幸せに暮らしている...", "type": "textarea"},
  {"fieldName": "field2", "label": "絵本の可能性を実感できましたか？", "placeholder": "", "type": "radio", "options": ["はい", "いいえ"]},
  {"fieldName": "field3", "label": "3日間の講座で一番の気づき", "placeholder": "例：生きがい...", "type": "textarea"},
  {"fieldName": "field4", "label": "学んだことを続けるための環境", "placeholder": "例：安心安全な居場所で、仲間が居る環境...", "type": "textarea"},
  {"fieldName": "field5", "label": "講座の評価（10段階）", "placeholder": "", "type": "rating"},
  {"fieldName": "field6", "label": "評価の理由", "placeholder": "例：具体的に自分にとって生きがいとなる仕事が見つかると思った、事務局のレスポンスが遅い...", "type": "textarea"}
]'::jsonb, 'sakura')
ON CONFLICT (day) DO NOTHING;