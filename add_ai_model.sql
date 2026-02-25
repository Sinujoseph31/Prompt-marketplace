-- SQL Script to add ai_model to the prompts table

-- 1. Add the column
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS ai_model TEXT;

-- 2. Backfill existing data with a default value so we don't have nulls breaking the UI
UPDATE public.prompts SET ai_model = 'Midjourney' WHERE ai_model IS NULL;

-- 3. Make the column NOT NULL for future inserts
ALTER TABLE public.prompts ALTER COLUMN ai_model SET NOT NULL;
