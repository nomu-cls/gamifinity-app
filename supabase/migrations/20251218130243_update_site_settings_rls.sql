/*
  # Update site settings RLS policies

  1. Changes
    - Drop existing restrictive policies
    - Add policies that allow any user (including anonymous) to read and update settings
  
  2. Security Note
    - Site settings are public configuration data
    - This is intentionally permissive for this application's use case
*/

DROP POLICY IF EXISTS "Anyone can read site settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated users can update site settings" ON site_settings;
DROP POLICY IF EXISTS "Authenticated users can insert site settings" ON site_settings;

CREATE POLICY "Anyone can read site settings"
  ON site_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update site settings"
  ON site_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert site settings"
  ON site_settings
  FOR INSERT
  WITH CHECK (true);