-- =====================================================
-- Add Missing Tables to DreamMaker Supabase
-- =====================================================
-- Run this in DreamMaker's Supabase SQL Editor
-- Only adds tables that don't exist yet

-- =====================================================
-- 1. Diagnostics Table (Brain Type) - MISSING
-- =====================================================
CREATE TABLE IF NOT EXISTS diagnostics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  questions jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any, then recreate
DROP POLICY IF EXISTS "Anon can read all diagnostics" ON diagnostics;
DROP POLICY IF EXISTS "Anon can insert diagnostics" ON diagnostics;
DROP POLICY IF EXISTS "Anon can update diagnostics" ON diagnostics;
DROP POLICY IF EXISTS "Anon can delete diagnostics" ON diagnostics;

CREATE POLICY "Anon can read all diagnostics" ON diagnostics FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert diagnostics" ON diagnostics FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update diagnostics" ON diagnostics FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete diagnostics" ON diagnostics FOR DELETE TO anon USING (true);

-- =====================================================
-- 2. Vision Board Images Table - MISSING
-- =====================================================
CREATE TABLE IF NOT EXISTS vision_board_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES user_stories(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vision_board_story_id ON vision_board_images(story_id);

ALTER TABLE vision_board_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Guest users can view vision board" ON vision_board_images;
DROP POLICY IF EXISTS "Guest users can insert vision board images" ON vision_board_images;
DROP POLICY IF EXISTS "Guest users can delete vision board images" ON vision_board_images;

CREATE POLICY "Guest users can view vision board" ON vision_board_images FOR SELECT TO anon USING (true);
CREATE POLICY "Guest users can insert vision board images" ON vision_board_images FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Guest users can delete vision board images" ON vision_board_images FOR DELETE TO anon USING (true);

-- =====================================================
-- 3. Insert default site_settings row if not exists
-- =====================================================
INSERT INTO site_settings (id) 
SELECT gen_random_uuid() 
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);

-- =====================================================
-- Done! Missing tables added
-- =====================================================
