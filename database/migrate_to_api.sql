-- Update user_favorites table to store ICD-10 codes as strings
-- This allows using the NIH API without needing a local icd10_codes table

-- Step 1: Drop the foreign key constraint
ALTER TABLE user_favorites 
  DROP CONSTRAINT IF EXISTS user_favorites_icd10_id_fkey;

-- Step 2: Rename and change column type
ALTER TABLE user_favorites 
  RENAME COLUMN icd10_id TO icd10_code;

ALTER TABLE user_favorites 
  ALTER COLUMN icd10_code TYPE TEXT;

-- Step 3: Add code metadata columns (to store locally)
ALTER TABLE user_favorites 
  ADD COLUMN IF NOT EXISTS code_title TEXT,
  ADD COLUMN IF NOT EXISTS code_chapter TEXT;

-- Step 4: Update unique constraint
ALTER TABLE user_favorites 
  DROP CONSTRAINT IF EXISTS user_favorites_user_id_icd10_id_key;

ALTER TABLE user_favorites 
  ADD CONSTRAINT user_favorites_user_id_code_unique 
  UNIQUE (user_id, icd10_code);

-- Step 5: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_favorites_code 
  ON user_favorites(icd10_code);

-- Note: Run this in your Supabase SQL Editor
-- The icd10_codes table can be dropped after migration if desired
