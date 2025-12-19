/*
  # Add zoom_passcode column to day_settings table

  ## Overview
  Adds a zoom_passcode field to the day_settings table to store Zoom meeting passcodes
  alongside the zoom_link field.

  ## Changes
  - Add `zoom_passcode` (text, nullable) column to day_settings table

  ## Notes
  - The field is optional since not all Zoom meetings require passcodes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'day_settings' AND column_name = 'zoom_passcode'
  ) THEN
    ALTER TABLE day_settings ADD COLUMN zoom_passcode text;
  END IF;
END $$;