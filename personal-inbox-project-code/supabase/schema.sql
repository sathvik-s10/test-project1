-- Personal Inbox Project - database schema
-- Run this in your Supabase project's SQL editor (Dashboard -> SQL Editor -> New query)
-- after creating the project. Safe to re-run (uses IF NOT EXISTS / OR REPLACE).

-- ---------------------------------------------------------------------------
-- Tickets: every message a signed-in, verified user sends to the site owner.
-- ---------------------------------------------------------------------------
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  category text not null default 'general',
  subject text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tickets_user_id_idx on public.tickets (user_id);
create index if not exists tickets_created_at_idx on public.tickets (created_at desc);

alter table public.tickets enable row level security;

-- Users may only ever see and create their own tickets. There is no policy
-- allowing users to read other users' tickets, which is what keeps this a
-- "user <-> admin" inbox instead of a chat between users. Admin access goes
-- through the server-side service-role key, which bypasses RLS entirely.
drop policy if exists "tickets_select_own" on public.tickets;
create policy "tickets_select_own"
  on public.tickets for select
  using (auth.uid() = user_id);

drop policy if exists "tickets_insert_own" on public.tickets;
create policy "tickets_insert_own"
  on public.tickets for insert
  with check (auth.uid() = user_id);

-- Keep updated_at current on every row change.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tickets_set_updated_at on public.tickets;
create trigger tickets_set_updated_at
  before update on public.tickets
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Banned emails: a permanent blacklist. Once an email is banned it can never
-- sign up or sign in again. Only ever written to via the service-role key
-- from an admin-only server action.
-- ---------------------------------------------------------------------------
create table if not exists public.banned_emails (
  email text primary key,
  reason text,
  banned_by text,
  banned_at timestamptz not null default now()
);

alter table public.banned_emails enable row level security;
-- No policies are defined for anon/authenticated roles on purpose: this table
-- is only ever touched by the service-role key on the server, which bypasses
-- RLS. Regular users and even logged-in non-admins cannot read or write it.
