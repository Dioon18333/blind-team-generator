-- Run this once in Supabase SQL Editor.
create table if not exists public.events (
  id integer primary key check (id = 1),
  registration_open boolean not null default true,
  revealed boolean not null default false
);
insert into public.events (id, registration_open, revealed)
values (1, true, false)
on conflict (id) do nothing;

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 70),
  team_number integer null,
  created_at timestamptz not null default now()
);
create index if not exists participants_team_number_idx on public.participants(team_number);

-- No browser role can read or modify these tables. The server uses the
-- Supabase service-role key, which must remain in server environment variables.
alter table public.events enable row level security;
alter table public.participants enable row level security;
revoke all on public.events from anon, authenticated;
revoke all on public.participants from anon, authenticated;
