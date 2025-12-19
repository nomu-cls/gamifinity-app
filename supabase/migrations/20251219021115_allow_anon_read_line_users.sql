/*
  # Allow anonymous read access to line_users

  1. Security Changes
    - Add SELECT policy for anonymous role on line_users table
    - This allows the frontend to display user lists in admin mode
*/

CREATE POLICY "Allow anonymous read line_users"
  ON line_users
  FOR SELECT
  TO anon
  USING (true);