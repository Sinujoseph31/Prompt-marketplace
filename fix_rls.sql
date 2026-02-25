-- Fix infinite recursion in RLS policies for profiles

-- Drop the old policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a new policy that doesn't recursively query the profiles table itself
-- We can simply check the auth.jwt() claims or use a simpler security definer function, 
-- but since Supabase doesn't put role in JWT by default unless custom claims are set,
-- we'll use a separate secure function to check admin status without triggering RLS recursively.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role text;
BEGIN
  -- Need to bypass RLS to read the role
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();
  RETURN v_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the policy using the secure function
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Also fix the update policy which had the same issue
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());
