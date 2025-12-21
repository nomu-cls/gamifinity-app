-- =====================================================
-- Add vision_board_images Table to DreamMaker Supabase
-- =====================================================
-- Run this in DreamMaker's Supabase SQL Editor
-- Project ID: brzxkuknvtknmhzviylf

-- Create vision_board_images table
CREATE TABLE IF NOT EXISTS vision_board_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES user_stories(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_vision_board_story_id ON vision_board_images(story_id);

-- Enable Row Level Security
ALTER TABLE vision_board_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vision_board_images
CREATE POLICY "Guest users can view vision board"
  ON vision_board_images FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Guest users can insert vision board images"
  ON vision_board_images FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Guest users can delete vision board images"
  ON vision_board_images FOR DELETE
  TO anon
  USING (true);

-- Authenticated user policies (if needed)
CREATE POLICY "Users can view own vision board"
  ON vision_board_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_stories
      WHERE user_stories.id = vision_board_images.story_id
      AND user_stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own vision board images"
  ON vision_board_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_stories
      WHERE user_stories.id = vision_board_images.story_id
      AND user_stories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own vision board images"
  ON vision_board_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_stories
      WHERE user_stories.id = vision_board_images.story_id
      AND user_stories.user_id = auth.uid()
    )
  );

-- Done!
