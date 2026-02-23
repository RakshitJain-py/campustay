-- BLOCK 1 — CORE IDENTITY SCHEMA + BASE RLS
-- Order: guardians before students (students.guardian_id references guardians.id)

-- 1. Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. PROFILES TABLE
create type user_role as enum ('student', 'hostel_owner', 'guardian');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  created_at timestamp with time zone default now()
);

create index idx_profiles_role on profiles(role);

-- 3. GUARDIANS TABLE (before students — students references guardians)
create table guardians (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text unique not null,
  email text unique not null,
  created_at timestamp with time zone default now()
);

-- 4. STUDENTS TABLE (guardian optional, nullable guardian_id)
create table students (
  id uuid primary key references auth.users(id) on delete cascade,
  guardian_id uuid references guardians(id) on delete set null,
  name text not null,
  phone text unique not null,
  curfew_time time,
  created_at timestamp with time zone default now()
);

create index idx_students_guardian_id on students(guardian_id);

-- 5. HOSTEL_OWNERS TABLE
create table hostel_owners (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- 6. Enable RLS
alter table profiles enable row level security;
alter table students enable row level security;
alter table guardians enable row level security;
alter table hostel_owners enable row level security;

-- 7 & 8. RLS POLICIES — PROFILES
create policy "Users can view own profile"
on profiles for select
using (auth.uid() = id);

create policy "Users can update own profile"
on profiles for update
using (auth.uid() = id);

create policy "User can insert own profile"
on profiles for insert
with check (auth.uid() = id);

-- STUDENTS
create policy "Student can view own record"
on students for select
using (
  auth.uid() = id
  or
  auth.uid() = guardian_id
);

create policy "Student can update own record"
on students for update
using (auth.uid() = id);

create policy "User can insert own student record"
on students for insert
with check (auth.uid() = id);

-- GUARDIANS
create policy "Guardian can view own record"
on guardians for select
using (auth.uid() = id);

create policy "Guardian can update own record"
on guardians for update
using (auth.uid() = id);

create policy "User can insert own guardian record"
on guardians for insert
with check (auth.uid() = id);

-- HOSTEL_OWNERS
create policy "Owner can view own record"
on hostel_owners for select
using (auth.uid() = id);

create policy "Owner can update own record"
on hostel_owners for update
using (auth.uid() = id);

create policy "User can insert own owner record"
on hostel_owners for insert
with check (auth.uid() = id);
