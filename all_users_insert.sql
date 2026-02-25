-- Allow all authenticated users to submit prompts

-- Drop the old overly restrictive policy
DROP POLICY IF EXISTS "Approved sellers can insert prompts" ON public.prompts;

-- Create a new policy that allows ANY logged-in user to insert a prompt
-- Note: the server action will automatically set their status to 'pending'
CREATE POLICY "Authenticated users can insert prompts" ON public.prompts
  FOR INSERT WITH CHECK (
    auth.uid() = seller_id
  );
