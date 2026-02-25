-- Phase 2 updates

-- 1. Add must_change_password to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

-- 2. Create the default admin auth.users record if it doesn't exist
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_admin_id uuid := uuid_generate_v4();
BEGIN
  -- Cleanup any broken admin users from previous script attempts
  DELETE FROM auth.users WHERE email = 'admin@example.com';

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@example.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      new_admin_id,
      'authenticated',
      'authenticated',
      'admin@example.com',
      crypt('admin', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Default Admin"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
    ) VALUES (
      new_admin_id,
      new_admin_id,
      format('{"sub":"%s","email":"%s"}', new_admin_id::text, 'admin@example.com')::jsonb,
      'email',
      'admin@example.com',
      now(),
      now(),
      now()
    );

    -- Ensure we update the trigger-created profile
    UPDATE public.profiles 
    SET role = 'admin', must_change_password = true, approved = true
    WHERE id = new_admin_id;
  END IF;
END
$$;
