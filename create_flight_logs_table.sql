-- Flight Logs Table for Daily Mission Tracking
-- Compatible with both Gamifinity (Talentflow Spacelines) and Dream Maker

CREATE TABLE IF NOT EXISTS flight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  line_user_id TEXT NOT NULL,
  date DATE NOT NULL,
  morning_mission TEXT,
  night_gratitude TEXT[],
  is_mission_completed BOOLEAN DEFAULT FALSE,
  points_earned JSONB DEFAULT '{"morning": 0, "night": 0, "bonus": 0}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(line_user_id, date)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_flight_logs_user_date 
ON flight_logs(line_user_id, date DESC);

-- RLS Policies
ALTER TABLE flight_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read/write (using line_user_id for identification)
CREATE POLICY "Allow all for anon" ON flight_logs
  FOR ALL TO anon
  USING (true)
  WITH CHECK (true);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_flight_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER flight_logs_updated_at
  BEFORE UPDATE ON flight_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_flight_log_updated_at();
