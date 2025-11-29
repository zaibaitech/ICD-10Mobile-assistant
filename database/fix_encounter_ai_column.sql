-- Add ai_result column to encounters table if it doesn't exist
ALTER TABLE public.encounters 
ADD COLUMN IF NOT EXISTS ai_result JSONB;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'encounters' 
  AND column_name = 'ai_result';
