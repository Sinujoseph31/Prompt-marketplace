-- Add points column to public.profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS points int DEFAULT 200;

-- Update existing profiles without points to have 200
UPDATE public.profiles SET points = 200 WHERE points IS NULL;

-- Create public.prompt_reveals table
CREATE TABLE IF NOT EXISTS public.prompt_reveals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  prompt_id uuid REFERENCES public.prompts(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, prompt_id)
);

-- Enable RLS for prompt_reveals
ALTER TABLE public.prompt_reveals ENABLE ROW LEVEL SECURITY;

-- Drop policy to avoid errors if it already exists
DROP POLICY IF EXISTS "Users can view their own reveals" ON public.prompt_reveals;

CREATE POLICY "Users can view their own reveals" ON public.prompt_reveals
  FOR SELECT USING (auth.uid() = user_id);

-- Update handle_new_user trigger to set initial points
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, approved, points)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'buyer', false, 200);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create reveal_prompt_rpc function for atomic reveal/deduction
CREATE OR REPLACE FUNCTION public.reveal_prompt_rpc(p_prompt_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_points int;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check if already revealed
  IF EXISTS (SELECT 1 FROM public.prompt_reveals WHERE user_id = v_user_id AND prompt_id = p_prompt_id) THEN
    RETURN jsonb_build_object('success', true, 'message', 'Already revealed');
  END IF;

  -- Get current points with lock for update
  SELECT points INTO v_points FROM public.profiles WHERE id = v_user_id FOR UPDATE;

  IF v_points < 10 THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  -- Deduct points and record reveal
  UPDATE public.profiles SET points = points - 10 WHERE id = v_user_id;
  
  INSERT INTO public.prompt_reveals (user_id, prompt_id) VALUES (v_user_id, p_prompt_id);

  RETURN jsonb_build_object('success', true, 'new_points', v_points - 10);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create award_points_rpc function for atomic addition
CREATE OR REPLACE FUNCTION public.award_points_rpc(p_amount int)
RETURNS jsonb AS $$
DECLARE
  v_points int;
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.profiles SET points = points + p_amount WHERE id = v_user_id RETURNING points INTO v_points;

  RETURN jsonb_build_object('success', true, 'new_points', v_points);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
