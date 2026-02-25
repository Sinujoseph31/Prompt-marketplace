-- SQL Script to migrate ai_model -> category and category -> subcategory
-- Just copy and paste this entire file into your Supabase SQL Editor and hit run!

-- 1. Rename columns (Safely checks if they need to be renamed first)
DO $$
BEGIN
  IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='prompts' and column_name='ai_model') THEN
      ALTER TABLE public.prompts RENAME COLUMN category TO subcategory;
      ALTER TABLE public.prompts RENAME COLUMN ai_model TO category;
  END IF;
END $$;

-- 2. Migrate the old data to exactly match the new Frontend Categories
-- This ensures that old prompts don't get hidden behind broken filter names
UPDATE public.prompts
SET 
  subcategory = 
    CASE 
      WHEN category = 'ChatGPT' THEN 'ChatGPT Prompts'
      WHEN category = 'Midjourney' THEN 'MidJourney Prompts'
      WHEN category = 'DALL-E' THEN 'DALL‑E Prompts'
      WHEN category = 'Stable Diffusion' THEN 'Stable Diffusion Prompts'
      WHEN category = 'Claude' THEN 'Claude Prompts'
      WHEN category = 'Gemini' THEN 'Gemini Prompts'
      WHEN category = 'DeepSeek' THEN 'DeepSeek Prompts'
      ELSE 'Other AI Models'
    END,
  category = 'Models'
WHERE category IN ('ChatGPT', 'Midjourney', 'DALL-E', 'Stable Diffusion', 'Claude', 'Gemini', 'DeepSeek', 'Other')
   OR category NOT IN ('Models', 'Art & Illustrations', 'Logos & Icons', 'Graphics & Design', 'Productivity & Writing', 'Marketing & Business', 'Photography', 'Games & 3D');
