/*
  # Allow anonymous users to manage diagnostics

  1. Security Changes
    - Add policies for anon role to insert, update, delete diagnostics
    - Update read policy to allow reading all diagnostics (not just active)
*/

DROP POLICY IF EXISTS "Anyone can read active diagnostics" ON diagnostics;

CREATE POLICY "Anon can read all diagnostics"
  ON diagnostics
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert diagnostics"
  ON diagnostics
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update diagnostics"
  ON diagnostics
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete diagnostics"
  ON diagnostics
  FOR DELETE
  TO anon
  USING (true);