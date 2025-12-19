/*
  # Create health_metrics table for HRV/PPG measurements

  1. New Tables
    - `health_metrics`
      - `id` (uuid, primary key)
      - `line_user_id` (text) - LINE user identifier
      - `heart_rate` (integer) - measured heart rate in BPM
      - `hrv_sdnn` (numeric) - HRV SDNN value in ms
      - `hrv_rmssd` (numeric) - HRV RMSSD value in ms
      - `stress_level` (text) - 'low', 'moderate', 'high'
      - `autonomic_balance` (text) - 'sympathetic', 'balanced', 'parasympathetic'
      - `brain_type` (text) - user's brain type at time of measurement
      - `ai_feedback` (text) - AI-generated coaching feedback
      - `measurement_duration` (integer) - measurement duration in seconds
      - `signal_quality` (numeric) - quality score 0-100
      - `raw_rr_intervals` (jsonb) - raw R-R interval data
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `health_metrics` table
    - Add policies for anon access (admin panel)
*/

CREATE TABLE IF NOT EXISTS health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id text NOT NULL,
  heart_rate integer,
  hrv_sdnn numeric,
  hrv_rmssd numeric,
  stress_level text DEFAULT 'moderate',
  autonomic_balance text DEFAULT 'balanced',
  brain_type text,
  ai_feedback text,
  measurement_duration integer DEFAULT 30,
  signal_quality numeric DEFAULT 0,
  raw_rr_intervals jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_health_metrics_line_user_id ON health_metrics(line_user_id);
CREATE INDEX IF NOT EXISTS idx_health_metrics_created_at ON health_metrics(created_at DESC);

ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read health_metrics"
  ON health_metrics
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anon can insert health_metrics"
  ON health_metrics
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update health_metrics"
  ON health_metrics
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);