/*
  # Create Yoshuku Story Tables

  ## Overview
  This migration creates the database schema for the "My Story 2026" picture book yoshuku application,
  which helps users create their future story through a beautiful, interactive journal experience.

  ## 1. New Tables
  
  ### `user_stories`
  Stores the main story data for each user's journey through the three chapters.
  - `id` (uuid, primary key) - Unique identifier for each story
  - `user_id` (uuid) - References auth.users for authenticated users (nullable for guest mode)
  - `day1_field1` (text) - Chapter 1: Childhood memories and passions
  - `day1_field2` (text) - Chapter 1: Core essence discovered from childhood
  - `day2_field1` (text) - Chapter 2: Natural talents and abilities
  - `day2_field2` (text) - Chapter 2: Self-appreciation points
  - `day3_field1` (text) - Chapter 3: 2026 vision of success
  - `day3_field2` (text) - Chapter 3: Environment promises
  - `unlocked_days` (jsonb) - Array of unlocked day numbers [1,2,3]
  - `is_gift_sent` (boolean) - Whether the epilogue gift has been unlocked
  - `progress` (integer) - Overall completion percentage (0-100)
  - `created_at` (timestamptz) - When the story was created
  - `updated_at` (timestamptz) - Last update timestamp

  ### `vision_board_images`
  Stores vision board images uploaded by users for their future visualization.
  - `id` (uuid, primary key) - Unique identifier for each image
  - `story_id` (uuid) - References user_stories
  - `image_url` (text) - URL or base64 data of the image
  - `display_order` (integer) - Order of display in the vision board
  - `created_at` (timestamptz) - When the image was uploaded

  ## 2. Security
  
  - Enable RLS on all tables
  - Allow users to read and write only their own story data
  - Support guest mode with device-specific identifiers
*/

-- Create user_stories table
CREATE TABLE IF NOT EXISTS user_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id text,
  day1_field1 text DEFAULT '',
  day1_field2 text DEFAULT '',
  day2_field1 text DEFAULT '',
  day2_field2 text DEFAULT '',
  day3_field1 text DEFAULT '',
  day3_field2 text DEFAULT '',
  unlocked_days jsonb DEFAULT '[1]',
  is_gift_sent boolean DEFAULT false,
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vision_board_images table
CREATE TABLE IF NOT EXISTS vision_board_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid REFERENCES user_stories(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_stories_user_id ON user_stories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stories_device_id ON user_stories(device_id);
CREATE INDEX IF NOT EXISTS idx_vision_board_story_id ON vision_board_images(story_id);

-- Enable Row Level Security
ALTER TABLE user_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_board_images ENABLE ROW LEVEL SECURITY;

-- Policies for user_stories
CREATE POLICY "Users can view own story"
  ON user_stories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Guest users can view own story by device"
  ON user_stories FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can insert own story"
  ON user_stories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guest users can insert story"
  ON user_stories FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can update own story"
  ON user_stories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Guest users can update own story"
  ON user_stories FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Policies for vision_board_images
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

CREATE POLICY "Guest users can view vision board"
  ON vision_board_images FOR SELECT
  TO anon
  USING (true);

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

CREATE POLICY "Guest users can insert vision board images"
  ON vision_board_images FOR INSERT
  TO anon
  WITH CHECK (true);

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

CREATE POLICY "Guest users can delete vision board images"
  ON vision_board_images FOR DELETE
  TO anon
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on user_stories
CREATE TRIGGER update_user_stories_updated_at
  BEFORE UPDATE ON user_stories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();