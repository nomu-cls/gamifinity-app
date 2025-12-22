-- =====================================================
-- 21日間プログラム用カラム追加
-- TalentFlow-Test で実行してください
-- =====================================================

-- line_users テーブルにプログラム管理カラムを追加
ALTER TABLE line_users
ADD COLUMN IF NOT EXISTS program_enrolled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS program_day INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS program_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS total_miles INTEGER DEFAULT 0;

-- line_users テーブルに DreamMaker形式の能力カラムを追加
ALTER TABLE line_users
ADD COLUMN IF NOT EXISTS ego_observation INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ego_control INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ego_efficacy INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ego_affirmation INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS stress_tolerance INTEGER DEFAULT 0;

-- user_stories テーブルにプログラム管理カラムを追加
ALTER TABLE user_stories
ADD COLUMN IF NOT EXISTS program_enrolled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS program_day INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS program_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS total_miles INTEGER DEFAULT 0;

-- 完了
SELECT 'Program columns added successfully!' as status;
