-- SQL Migration for Universal Movie Scene Finder in Prompt4life
-- Safe for execution in Supabase SQL Editor

-- 1. Create Movies Table
CREATE TABLE IF NOT EXISTS public.movies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  original_title TEXT,
  year INTEGER NOT NULL,
  language TEXT NOT NULL, -- e.g. 'Malayalam', 'Tamil', 'Hindi', 'Telugu', 'English', 'Korean', etc.
  country TEXT NOT NULL,
  genres TEXT[] DEFAULT '{}',
  poster TEXT,
  backdrop TEXT,
  director TEXT,
  cast_members TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- 2. Create Movie Scenes Table
CREATE TABLE IF NOT EXISTS public.movie_scenes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  transcript TEXT,
  dialogue TEXT,
  start_time TEXT,
  end_time TEXT,
  duration INTEGER DEFAULT 0, -- in seconds
  emotions TEXT[] DEFAULT '{}', -- e.g. 'Funny', 'Angry', 'Romantic', 'Embarrassed', 'Shock', etc.
  categories TEXT[] DEFAULT '{}', -- e.g. 'Comedy', 'Betrayal', 'Hero Entry', 'Dialogue', 'Reaction', etc.
  characters TEXT[] DEFAULT '{}',
  actors TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  source_url TEXT,
  source_type TEXT DEFAULT 'external_watch', -- 'licensed_stream', 'user_upload', 'external_watch'
  rights_status TEXT DEFAULT 'external', -- 'licensed', 'user_uploaded', 'external'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- 3. Create Saved Scenes Table (for authenticated users)
CREATE TABLE IF NOT EXISTS public.saved_scenes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scene_id UUID REFERENCES public.movie_scenes(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  UNIQUE(user_id, scene_id)
);

-- 4. Create Reel Projects Table (for Reel editor drafts & creations)
CREATE TABLE IF NOT EXISTS public.reel_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scene_id UUID REFERENCES public.movie_scenes(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Reel',
  source_clip_url TEXT,
  text_layers JSONB DEFAULT '[]'::JSONB,
  caption TEXT,
  subtitle_settings JSONB DEFAULT '{}'::JSONB,
  crop_settings JSONB DEFAULT '{"aspectRatio": "9:16", "zoom": 1, "x": 0, "y": 0}'::JSONB,
  effects JSONB DEFAULT '{}'::JSONB,
  export_status TEXT DEFAULT 'draft', -- 'draft', 'rendering', 'exported'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reel_projects ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Movies & Scenes: Public read access
CREATE POLICY "Public can view movies" ON public.movies
  FOR SELECT USING (true);

CREATE POLICY "Public can view movie scenes" ON public.movie_scenes
  FOR SELECT USING (true);

-- Saved Scenes: Users can manage their own saved scenes
CREATE POLICY "Users can view own saved scenes" ON public.saved_scenes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved scenes" ON public.saved_scenes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved scenes" ON public.saved_scenes
  FOR DELETE USING (auth.uid() = user_id);

-- Reel Projects: Users can manage their own reel projects
CREATE POLICY "Users can view own reel projects" ON public.reel_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reel projects" ON public.reel_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reel projects" ON public.reel_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reel projects" ON public.reel_projects
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Indexes for Fast Search
CREATE INDEX IF NOT EXISTS idx_movie_scenes_emotions ON public.movie_scenes USING GIN (emotions);
CREATE INDEX IF NOT EXISTS idx_movie_scenes_categories ON public.movie_scenes USING GIN (categories);
CREATE INDEX IF NOT EXISTS idx_movie_scenes_actors ON public.movie_scenes USING GIN (actors);
CREATE INDEX IF NOT EXISTS idx_movie_scenes_keywords ON public.movie_scenes USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_movies_language ON public.movies (language);
