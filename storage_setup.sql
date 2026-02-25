-- Phase 3 updates: Storage for Prompt Images

-- 1. Create a public bucket called 'prompt-images'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('prompt-images', 'prompt-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload images to this bucket
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'prompt-images');

-- 3. Allow public to read images from this bucket
CREATE POLICY "Public can view images" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'prompt-images');
