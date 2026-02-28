-- 1. Create the 'battles' table (to store weekly/daily themes)
CREATE TABLE IF NOT EXISTS public.battles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    theme_name TEXT NOT NULL,
    theme_description TEXT,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ends_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Protect the battles table (only admins can create/edit, anyone can view)
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active battles" 
ON public.battles FOR SELECT 
USING (true);

-- 2. Create the 'battle_entries' table (user submissions)
CREATE TABLE IF NOT EXISTS public.battle_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    battle_id UUID REFERENCES public.battles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    prompt_text TEXT NOT NULL,
    image_url TEXT,
    votes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(battle_id, user_id) -- One entry per user per battle max
);

-- RLS for entries
ALTER TABLE public.battle_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view battle entries" 
ON public.battle_entries FOR SELECT 
USING (true);
CREATE POLICY "Authenticated users can create an entry" 
ON public.battle_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Create the 'battle_votes' table (to track who voted for what and prevent double voting)
CREATE TABLE IF NOT EXISTS public.battle_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entry_id UUID REFERENCES public.battle_entries(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(entry_id, user_id) -- One vote per user per entry max
);

-- RLS for votes
ALTER TABLE public.battle_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view votes" 
ON public.battle_votes FOR SELECT 
USING (true);
CREATE POLICY "Authenticated users can vote" 
ON public.battle_votes FOR INSERT 
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own vote" 
ON public.battle_votes FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Create a function to safely upvote/downvote and update the count
CREATE OR REPLACE FUNCTION toggle_battle_vote(p_entry_id UUID, p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_vote_exists BOOLEAN;
BEGIN
    -- Check if vote exists
    SELECT EXISTS (
        SELECT 1 FROM public.battle_votes 
        WHERE entry_id = p_entry_id AND user_id = p_user_id
    ) INTO v_vote_exists;

    IF v_vote_exists THEN
        -- Remove vote
        DELETE FROM public.battle_votes WHERE entry_id = p_entry_id AND user_id = p_user_id;
        -- Decrement count
        UPDATE public.battle_entries SET votes_count = votes_count - 1 WHERE id = p_entry_id;
    ELSE
        -- Insert vote
        INSERT INTO public.battle_votes (entry_id, user_id) VALUES (p_entry_id, p_user_id);
        -- Increment count
        UPDATE public.battle_entries SET votes_count = votes_count + 1 WHERE id = p_entry_id;
    END IF;
END;
$$;

-- 5. INSERT YOUR VERY FIRST BATTLE!
INSERT INTO public.battles (theme_name, theme_description, ends_at) 
VALUES (
    'Animals in Inconvenient Human Jobs', 
    'Generate the funniest image of an animal trying (and failing) to do a very specific human job. E.g. A raccoon working as a TSA agent, or a bear trying to be a barista.', 
    now() + interval '7 days'
);
