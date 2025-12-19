/*
  # Add Email and Google Sheets Integration
  
  ## Description
  This migration adds support for email capture and Google Sheets integration
  to enable data export when users submit their stories.
  
  ## Changes
  1. Add `email` field to user_stories table to capture user email addresses
  2. Add `google_sheets_url` field to store the Google Apps Script webhook URL
  3. Add `submitted_at` timestamp to track when the story was submitted to Google Sheets
  
  ## New Fields
  - `email` (text) - User's email address for submission tracking
  - `google_sheets_url` (text) - Google Apps Script web app URL for data export
  - `submitted_at` (timestamptz) - Timestamp when data was submitted to Google Sheets
*/

-- Add email field to user_stories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'email'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN email text DEFAULT '';
  END IF;
END $$;

-- Add google_sheets_url field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'google_sheets_url'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN google_sheets_url text DEFAULT '';
  END IF;
END $$;

-- Add submitted_at timestamp
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_stories' AND column_name = 'submitted_at'
  ) THEN
    ALTER TABLE user_stories ADD COLUMN submitted_at timestamptz;
  END IF;
END $$;