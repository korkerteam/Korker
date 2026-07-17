-- Blocked users table for social blocking
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New query)

create table blocked_users (
  id uuid default gen_random_uuid() primary key,
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  blocked_at timestamptz default now(),
  unblocked_at timestamptz default null,
  unique (blocker_id, blocked_id)
);

alter table blocked_users add constraint no_self_block check (blocker_id != blocked_id);

alter table blocked_users enable row level security;

create policy "Users can view own blocks"
  on blocked_users for select
  using (auth.uid() = blocker_id);

create policy "Users can block others"
  on blocked_users for insert
  with check (auth.uid() = blocker_id);

create policy "Users can update own blocks"
  on blocked_users for update
  using (auth.uid() = blocker_id);

create index idx_blocked_users_blocker on blocked_users (blocker_id);
create index idx_blocked_users_blocked on blocked_users (blocked_id);
