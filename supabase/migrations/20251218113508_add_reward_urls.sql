/*
  # Add Reward URLs to Day Rewards and Gift Contents

  ## Changes
  
  1. Modifications to `day_rewards`
    - Add `reward_url` (text, optional) - External URL for the reward content
  
  2. Modifications to `gift_contents`
    - Add `reward_url` (text, optional) - External URL for the perfect award content

  ## Notes
  - These URLs will be fetched from Google Sheets "特典" sheet
  - Used to send reward links via LINE after task completion
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'day_rewards' AND column_name = 'reward_url'
  ) THEN
    ALTER TABLE day_rewards ADD COLUMN reward_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'gift_contents' AND column_name = 'reward_url'
  ) THEN
    ALTER TABLE gift_contents ADD COLUMN reward_url text;
  END IF;
END $$;