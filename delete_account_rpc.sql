-- Create an RPC function to securely delete the currently authenticated user
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  -- Delete the user from auth.users. 
  -- Because our profiles, prompts, and comments tables have ON DELETE CASCADE,
  -- this will automatically wipe all associated data for the user securely.
  DELETE FROM auth.users WHERE id = auth.uid();
$$;
