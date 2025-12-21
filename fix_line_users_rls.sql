-- Fix RLS policies for line_users table in Gamifinity
-- Run this in Supabase SQL Editor

-- Step 1: Enable RLS if not already enabled
ALTER TABLE public.line_users ENABLE ROW LEVEL SECURITY;

-- Step 2: Grant SELECT permission to anon role
GRANT SELECT ON public.line_users TO anon;

-- Step 3: Grant INSERT/UPDATE permissions to anon role (for user creation/updates)
GRANT INSERT, UPDATE ON public.line_users TO anon;

-- Step 4: Create RLS policy to allow all operations for anon
-- (This is for development - in production, you'd want more restrictive policies)

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anon select" ON public.line_users;
DROP POLICY IF EXISTS "Allow anon insert" ON public.line_users;
DROP POLICY IF EXISTS "Allow anon update" ON public.line_users;
DROP POLICY IF EXISTS "Allow anon all" ON public.line_users;

-- Create a permissive policy for anon role
CREATE POLICY "Allow anon all" ON public.line_users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Verify the policy was created
SELECT * FROM pg_policies WHERE tablename = 'line_users';
