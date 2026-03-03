-- ============================================================
-- Warmup Calc - Supabase Database Setup
-- Run this in the Supabase SQL editor (in order)
-- ============================================================

-- 1. Profiles (extends auth.users)
create table public.profiles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- 2. User preferences
create table public.user_preferences (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  default_sets  integer not null default 4,
  percentages   jsonb not null default '[40,60,80,90]',
  reps          jsonb not null default '[10,6,3,1]',
  exercise_type text not null default 'barbell',
  unique(user_id)
);

-- 3. Workout sessions
create table public.workout_sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  exercise_name      text not null,
  exercise_type      text not null,
  working_weight_kg  numeric(6,2) not null,
  warmup_sets        jsonb not null default '[]',
  created_at         timestamptz not null default now()
);

-- Index for fast history queries
create index on public.workout_sessions(user_id, created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles         enable row level security;
alter table public.user_preferences enable row level security;
alter table public.workout_sessions enable row level security;

-- Users can only access their own rows
create policy "profiles: own rows" on public.profiles
  for all using (auth.uid() = user_id);

create policy "preferences: own rows" on public.user_preferences
  for all using (auth.uid() = user_id);

create policy "sessions: own rows" on public.workout_sessions
  for all using (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile + preferences on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id) values (new.id);
  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
