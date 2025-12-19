/*
  # Allow anonymous update access to line_users brain_type

  1. Security Changes
    - Add UPDATE policy for anonymous role on line_users table
    - This allows the admin dashboard to update user brain types for testing
*/

CREATE POLICY "Allow anonymous update brain_type"
  ON line_users
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
