-- =====================================================
-- Setup Demo User Data for Testing Boarding Pass
-- =====================================================
-- Run this in DreamMaker's Supabase SQL Editor

-- 1. Ensure demo user exists in line_users
INSERT INTO line_users (line_user_id, display_name, brain_type, diagnosis_completed)
VALUES ('U8e44334cf4e0df84846ec2e8327ca727', 'Demo User', 'right_3d', true)
ON CONFLICT (line_user_id) 
DO UPDATE SET 
  display_name = 'Demo User',
  brain_type = 'right_3d',
  diagnosis_completed = true,
  updated_at = now();

-- 2. Ensure demo user has a story with name
INSERT INTO user_stories (line_user_id, name, email, brain_type, unlocked_days, progress)
VALUES (
  'U8e44334cf4e0df84846ec2e8327ca727', 
  'Demo User', 
  'demo@example.com',
  'right_3d',
  '[1]'::jsonb,
  0
)
ON CONFLICT DO NOTHING;

-- If user_stories already exists but name is null, update it
UPDATE user_stories 
SET 
  name = COALESCE(name, 'Demo User'),
  brain_type = 'right_3d'
WHERE line_user_id = 'U8e44334cf4e0df84846ec2e8327ca727';

-- =====================================================
-- Done! Demo user data configured
-- =====================================================
