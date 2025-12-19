/*
  # Allow anonymous users to update line_settings

  1. Security Changes
    - Add policy to allow anon role to update line_settings
    - This is needed because the admin panel operates without Supabase auth
*/

CREATE POLICY "Anon users can update line_settings"
  ON line_settings
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon users can read line_settings"
  ON line_settings
  FOR SELECT
  TO anon
  USING (true);