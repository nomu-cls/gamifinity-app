/*
  # Fix day_settings INSERT policy

  ## Overview
  The current INSERT policy only allows authenticated users to insert day_settings.
  However, the frontend operates as an anonymous user, so we need to update the policy
  to allow anon users to insert as well.

  ## Changes
  - Drop existing INSERT policy
  - Create new INSERT policy that allows both anon and authenticated users

  ## Security
  - While this allows anonymous users to insert, the admin interface should implement
    additional checks to ensure only authorized users can access the day settings editor
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Authenticated users can insert day_settings" ON day_settings;

-- Create new policy allowing both anon and authenticated users
CREATE POLICY "Allow insert day_settings"
  ON day_settings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);