/*
  # Restrict AI Settings Table Access for Security

  1. Security Changes
    - Drop all authenticated user policies (SELECT, INSERT, UPDATE)
    - Only service_role can access the ai_settings table
    - This ensures API keys are only accessible via Edge Functions

  2. Rationale
    - API keys should never be exposed to the frontend
    - All operations must go through the manage-ai-settings edge function
    - Edge function uses service_role to access the database securely
*/

DROP POLICY IF EXISTS "Authenticated users can read ai_settings" ON ai_settings;
DROP POLICY IF EXISTS "Authenticated users can insert ai_settings" ON ai_settings;
DROP POLICY IF EXISTS "Authenticated users can update ai_settings" ON ai_settings;
