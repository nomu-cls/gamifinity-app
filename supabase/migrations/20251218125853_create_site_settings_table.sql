/*
  # Create site settings table for deadline management

  1. New Tables
    - `site_settings`
      - `id` (uuid, primary key)
      - `day1_archive_deadline` (timestamptz) - Day1 archive viewing deadline
      - `day2_archive_deadline` (timestamptz) - Day2 archive viewing deadline
      - `day3_archive_deadline` (timestamptz) - Day3 archive viewing deadline
      - `day1_assignment_deadline` (timestamptz) - Day1 assignment submission deadline
      - `day2_assignment_deadline` (timestamptz) - Day2 assignment submission deadline
      - `day3_assignment_deadline` (timestamptz) - Day3 assignment submission deadline
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS on `site_settings` table
    - Add policy for public read access (settings are public)
    - Add policy for authenticated admin updates
  
  3. Initial Data
    - Insert default row for settings
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day1_archive_deadline timestamptz,
  day2_archive_deadline timestamptz,
  day3_archive_deadline timestamptz,
  day1_assignment_deadline timestamptz,
  day2_assignment_deadline timestamptz,
  day3_assignment_deadline timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site settings"
  ON site_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert site settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

INSERT INTO site_settings (id) VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;