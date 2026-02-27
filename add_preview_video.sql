-- Add the preview_video column to the prompts table to support auto-playing video generation models (Sora, Runway, Pika, etc.)
ALTER TABLE public.prompts 
ADD COLUMN preview_video text;
