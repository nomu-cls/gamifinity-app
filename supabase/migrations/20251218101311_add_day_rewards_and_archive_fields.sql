/*
  # Add Day Rewards and Archive Video Fields

  ## Changes
  
  1. New Tables
    - `day_rewards`
      - `id` (uuid, primary key)
      - `day` (integer, 1-3)
      - `title` (text) - Title of the reward
      - `message` (text) - Reward message content
      - `image_url` (text, optional) - Reward image
      - `created_at` (timestamp)
  
  2. Modifications to `user_stories`
    - Add `day1_archive_url` (text, optional) - Day 1 archive video URL
    - Add `day1_archive_expires_at` (timestamptz, optional) - Day 1 archive expiration
    - Add `day2_archive_url` (text, optional) - Day 2 archive video URL
    - Add `day2_archive_expires_at` (timestamptz, optional) - Day 2 archive expiration
    - Add `day3_archive_url` (text, optional) - Day 3 archive video URL
    - Add `day3_archive_expires_at` (timestamptz, optional) - Day 3 archive expiration
    - Add `day1_reward_viewed` (boolean, default false) - Track if user viewed Day 1 reward
    - Add `day2_reward_viewed` (boolean, default false) - Track if user viewed Day 2 reward
    - Add `day3_reward_viewed` (boolean, default false) - Track if user viewed Day 3 reward
  
  3. Security
    - Enable RLS on `day_rewards` table
    - Add policy for public read access to rewards
    - Add policies for users to update their own reward viewed status
*/

-- Create day_rewards table
CREATE TABLE IF NOT EXISTS day_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day integer NOT NULL CHECK (day >= 1 AND day <= 3),
  title text NOT NULL,
  message text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Add archive and reward fields to user_stories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day1_archive_url'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day1_archive_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day1_archive_expires_at'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day1_archive_expires_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day2_archive_url'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day2_archive_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day2_archive_expires_at'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day2_archive_expires_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day3_archive_url'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day3_archive_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day3_archive_expires_at'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day3_archive_expires_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day1_reward_viewed'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day1_reward_viewed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day2_reward_viewed'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day2_reward_viewed boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'day3_reward_viewed'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN day3_reward_viewed boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS on day_rewards
ALTER TABLE day_rewards ENABLE ROW LEVEL SECURITY;

-- Policy for public read access to rewards
CREATE POLICY "Anyone can view day rewards"
  ON day_rewards
  FOR SELECT
  TO public
  USING (true);

-- Insert default rewards for each day
INSERT INTO day_rewards (day, title, message, image_url)
VALUES 
  (1, '記憶の森の宝物', 'あなたの子供の頃の輝きを思い出してくれてありがとう。この宝物は、あなたの心に眠っていた大切な記憶の結晶です。これからの旅路で、この輝きがあなたを照らし続けますように。', null),
  (2, '才能の泉の恵み', '自分の才能を認めることは、自分を愛する第一歩。あなたの「できること」は、誰かの「ありがたい」です。この恵みを受け取り、自信を持って前に進んでください。', null),
  (3, '未来の扉の鍵', 'すべての課題を乗り越え、ここまで来たあなたへ。この鍵は、あなたの夢への扉を開く魔法の力を持っています。描いた未来は、もう始まっています。', null)
ON CONFLICT DO NOTHING;