-- Add columns for Daily Navigation System
ALTER TABLE user_stories ADD COLUMN IF NOT EXISTS user_phase text DEFAULT 'passenger';
ALTER TABLE user_stories ADD COLUMN IF NOT EXISTS intro_progress integer DEFAULT 0;
ALTER TABLE user_stories ADD COLUMN IF NOT EXISTS daily_logs jsonb DEFAULT '{}'::jsonb;
ALTER TABLE user_stories ADD COLUMN IF NOT EXISTS brain_type text;

-- Comment on columns for clarity (optional)
COMMENT ON COLUMN user_stories.user_phase IS 'Current phase: passenger (Phase 1) or commander (Phase 2)';
COMMENT ON COLUMN user_stories.intro_progress IS 'Progress in Intro Phase (0-2 videos watched)';
COMMENT ON COLUMN user_stories.daily_logs IS 'JSONB storage for 21-day challenge logs and detailed scores';
COMMENT ON COLUMN user_stories.brain_type IS 'User diagnosis type: SORA, SHIN, PIKU, MAMORU';
