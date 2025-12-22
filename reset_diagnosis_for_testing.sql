-- =====================================================
-- Reset Diagnosis for Testing (Your User)
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

-- Also reset user_stories brain_type
UPDATE user_stories 
SET brain_type = NULL
WHERE line_user_id IS NOT NULL;

-- Delete diagnostic answers
DELETE FROM diagnostic_answers;

-- Verify reset
SELECT line_user_id, display_name, brain_type, diagnosis_completed 
FROM line_users;

-- =====================================================
-- Done! Now clear localStorage and try again
-- =====================================================
