-- =====================================================
-- Delete old brain type diagnosis
-- =====================================================
-- Run this in DreamMaker's Supabase SQL Editor

-- First, view all diagnostics to identify which to delete
SELECT id, theme, title FROM diagnostics;

-- Delete the old one (brain_type with title '脳タイプ診断')
DELETE FROM diagnostics 
WHERE theme = 'brain_type' 
AND title = '脳タイプ診断';

-- Verify deletion
SELECT id, theme, title FROM diagnostics;

-- =====================================================
-- Done!
-- =====================================================
