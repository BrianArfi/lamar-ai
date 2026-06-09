-- Job Seeker AI — Database Schema
-- Run this in Supabase SQL Editor

-- Profiles (extends auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  email text,
  cv_markdown text,
  plan_tier text not null default 'free',
  evaluations_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Evaluations
create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company text,
  role text,
  jd_url text,
  jd_text text not null default '',
  score numeric(3,1),
  legitimacy_tier text,
  report_markdown text,
  status text not null default 'Evaluated',
  created_at timestamptz not null default now()
);

-- Applications (pipeline tracker)
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  evaluation_id uuid references evaluations(id) on delete set null,
  company text not null,
  role text not null,
  score numeric(3,1),
  status text not null default 'Evaluated',
  pdf_generated boolean not null default false,
  notes text,
  applied_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS Policies
alter table profiles enable row level security;
alter table evaluations enable row level security;
alter table applications enable row level security;

-- Profiles: users see/edit only their own
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Evaluations: users see/edit only their own
create policy "evaluations_select_own" on evaluations for select using (auth.uid() = user_id);
create policy "evaluations_insert_own" on evaluations for insert with check (auth.uid() = user_id);
create policy "evaluations_update_own" on evaluations for update using (auth.uid() = user_id);
create policy "evaluations_delete_own" on evaluations for delete using (auth.uid() = user_id);

-- Applications: users see/edit only their own
create policy "applications_select_own" on applications for select using (auth.uid() = user_id);
create policy "applications_insert_own" on applications for insert with check (auth.uid() = user_id);
create policy "applications_update_own" on applications for update using (auth.uid() = user_id);
create policy "applications_delete_own" on applications for delete using (auth.uid() = user_id);

-- Updated_at trigger for applications
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger applications_updated_at
  before update on applications
  for each row execute procedure set_updated_at();

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();
