-- Phase 4 Updates: Support multiple images per prompt

-- Add a text array column to store multiple public URLs
ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS preview_images text[] DEFAULT ARRAY[]::text[];
