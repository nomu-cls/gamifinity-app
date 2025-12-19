/*
  # Fix day_settings UPDATE policy

  ## Overview
  Update the UPDATE policy to also allow anonymous users, ensuring consistency
  with the INSERT policy fix.

  ## Changes
  - Drop existing UPDATE policy
  - Create new UPDATE policy that allows both anon and authenticated users

  ## Security
  - Maintains same security model as INSERT policy
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can update day_settings" ON day_settings;

-- Create new policy allowing both anon and authenticated users
CREATE POLICY "Allow update day_settings"
  ON day_settings
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);