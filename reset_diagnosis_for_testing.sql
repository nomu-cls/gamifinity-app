-- =====================================================
-- Reset All Progress for Testing (Complete Reset)
-- =====================================================
-- Run this in DreamMaker's Supabase SQL Editor

-- First, see all users with diagnosis completed
SELECT line_user_id, display_name, brain_type, diagnosis_completed 
FROM line_users 
WHERE diagnosis_completed = true;

-- Reset diagnosis for your users (remove brain_type)
UPDATE line_users 
SET 
  brain_type = NULL,
  brain_type_scores = NULL,
  diagnosis_completed = false,
  diagnosis_completed_at = NULL
WHERE line_user_id IS NOT NULL;

-- Reset user_stories (brain_type + user_phase + missions)
UPDATE user_stories 
SET 
  brain_type = NULL,
  user_phase = 'passenger',
  day1_field1 = NULL,
  day1_field2 = NULL,
  day1_field3 = NULL,
  day2_field1 = NULL,
  day2_field2 = NULL,
  day2_field3 = NULL,
  day3_field1 = NULL,
  day3_field2 = NULL,
  day3_field3 = NULL,
  unlocked_days = NULL,
  progress = 0
WHERE line_user_id IS NOT NULL;

-- Delete diagnostic answers
DELETE FROM diagnostic_answers;

-- Verify reset
SELECT line_user_id, display_name, brain_type, diagnosis_completed 
FROM line_users;

SELECT id, name, user_phase, brain_type, day1_field1, day2_field1 
FROM user_stories;

-- =====================================================
-- Done! Now clear localStorage and try again:
-- localStorage.clear()
-- Then refresh the page
-- =====================================================
