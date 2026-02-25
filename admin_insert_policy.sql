-- Fix: Allow Admins to insert prompts

-- We previously added public.is_admin() function in fix_rls.sql, 
-- but we only updated SELECT and UPDATE policies on profiles, not INSERT on prompts.

CREATE POLICY "Admins can insert prompts" ON public.prompts
  FOR INSERT WITH CHECK (
    public.is_admin() OR 
    -- Alternatively, ensure they are inserting for themselves as an admin
    (auth.uid() = seller_id AND public.is_admin())
  );
