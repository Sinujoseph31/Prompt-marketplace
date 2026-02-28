-- Add a rating column to the comments table
ALTER TABLE public.comments 
ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Update existing comments to have a default rating of 5 (optional)
UPDATE public.comments SET rating = 5 WHERE rating IS NULL;
