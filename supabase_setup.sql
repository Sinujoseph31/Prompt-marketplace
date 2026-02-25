-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Profiles Table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  role text check (role in ('buyer', 'seller', 'admin')) default 'buyer',
  approved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Prompts Table
create table public.prompts (
  id uuid default uuid_generate_v4() primary key,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  category text not null,
  price numeric(10,2),
  full_prompt text not null,
  preview_image text,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Trigger to create a profile automatically when a user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role, approved)
  values (new.id, new.raw_user_meta_data->>'full_name', 'buyer', false);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.prompts enable row level security;

-- 5. RLS Policies

-- PROFILES
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Admins can view all profiles" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Admins can update all profiles" on public.profiles
  for update using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

-- PROMPTS
create policy "Public can view approved prompts" on public.prompts
  for select using (status = 'approved');

create policy "Sellers can view own prompts" on public.prompts
  for select using (auth.uid() = seller_id);

create policy "Admins can view all prompts" on public.prompts
  for select using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Approved sellers can insert prompts" on public.prompts
  for insert with check (
    auth.uid() = seller_id and
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'seller' and approved = true
    )
  );

create policy "Admins can update all prompts" on public.prompts
  for update using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete prompts" on public.prompts
  for delete using (
    exists (
      select 1 from public.profiles where id = auth.uid() and role = 'admin'
    )
  );
