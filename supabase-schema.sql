-- Arclo database schema
-- Run this in Supabase → SQL Editor

-- Players table (extends Supabase auth.users)
create table if not exists public.players (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  region text not null check (region in ('oce', 'na', 'eu', 'sea', 'latam', 'mea')),
  game text not null default 'rocket_league',
  division text not null default 'bronze' check (division in ('bronze', 'silver', 'gold')),
  points integer not null default 0,
  wins integer not null default 0,
  losses integer not null default 0,
  win_streak integer not null default 0,
  rank_position integer,
  is_champion boolean not null default false,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Matches table
create table if not exists public.matches (
  id uuid default gen_random_uuid() primary key,
  player_one_id uuid references public.players(id) not null,
  player_two_id uuid references public.players(id) not null,
  player_one_score integer default 0,
  player_two_score integer default 0,
  winner_id uuid references public.players(id),
  division text not null,
  region text not null,
  season integer not null default 1,
  week integer not null default 1,
  scheduled_at timestamp with time zone not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'completed', 'cancelled')),
  stream_url text,
  created_at timestamp with time zone default timezone('utc', now())
);

-- Seasons table
create table if not exists public.seasons (
  id serial primary key,
  number integer not null,
  region text not null,
  game text not null default 'rocket_league',
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'completed')),
  prize_gold integer not null default 300,
  prize_silver integer not null default 75,
  prize_bronze integer not null default 25,
  entry_fee integer not null default 0,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc', now()),
  unique (number, region)
);

-- Insert season 1 (safe - won't duplicate)
insert into public.seasons (number, region, game, status, prize_gold, prize_silver, prize_bronze, entry_fee)
values
  (1, 'oce', 'rocket_league', 'active', 300, 75, 0, 0),
  (1, 'na', 'rocket_league', 'active', 300, 75, 0, 0),
  (1, 'eu', 'rocket_league', 'active', 300, 75, 0, 0)
on conflict (number, region) do nothing;

-- Row level security (RLS)
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.seasons enable row level security;

-- Players policies
drop policy if exists "Players are viewable by everyone" on public.players;
drop policy if exists "Players can update their own profile" on public.players;
drop policy if exists "Players can insert their own profile" on public.players;
drop policy if exists "Matches are viewable by everyone" on public.matches;
drop policy if exists "Seasons are viewable by everyone" on public.seasons;

create policy "Players are viewable by everyone"
  on public.players for select using (true);

create policy "Players can update their own profile"
  on public.players for update using (auth.uid() = id);

create policy "Players can insert their own profile"
  on public.players for insert with check (auth.uid() = id);

create policy "Matches are viewable by everyone"
  on public.matches for select using (true);

create policy "Seasons are viewable by everyone"
  on public.seasons for select using (true);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.players (id, username, region, game)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'region',
    coalesce(new.raw_user_meta_data->>'game', 'rocket_league')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger: create player profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
