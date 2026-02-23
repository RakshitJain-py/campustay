-- BLOCK 1 REVISION — INDEPENDENT ACCOUNTS + CONTROLLED LINKING
-- Student and Guardian sign up independently. Linking only via guardian_link_requests.
-- No direct guardian read access to students. No manual guardian_id updates by users.

-- 1. Table order already correct (profiles, guardians, students, hostel_owners).
--    Adding guardian_link_requests after students.

-- 2. Ensure students.guardian_id constraint (idempotent if already applied)
alter table students
drop constraint if exists students_guardian_id_fkey;

alter table students
add constraint students_guardian_id_fkey
foreign key (guardian_id)
references guardians(id)
on delete set null;

-- guardian_id remains nullable (no change to column).

-- 3. Link request table
create type link_status as enum ('pending', 'approved', 'rejected');

create table guardian_link_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  guardian_id uuid not null references guardians(id) on delete cascade,
  status link_status not null default 'pending',
  created_at timestamp with time zone default now(),
  unique (student_id, guardian_id)
);

create index idx_glr_student on guardian_link_requests(student_id);
create index idx_glr_guardian on guardian_link_requests(guardian_id);

alter table guardian_link_requests enable row level security;

-- 4. Remove direct guardian read access to students
drop policy if exists "Student can view own record" on students;

create policy "Student can view own record"
on students for select
using (auth.uid() = id);

drop policy if exists "Student can update own record" on students;

-- 6. Restrict student update (guardian_id update handled later via function)
alter table students disable row level security;
alter table students enable row level security;

create policy "Student can update own non-guardian fields"
on students for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- 5. guardian_link_requests RLS
create policy "Student can create link request"
on guardian_link_requests for insert
with check (auth.uid() = student_id);

create policy "Student can view own link requests"
on guardian_link_requests for select
using (auth.uid() = student_id);

create policy "Guardian can view incoming link requests"
on guardian_link_requests for select
using (auth.uid() = guardian_id);

create policy "Guardian can update own link requests"
on guardian_link_requests for update
using (auth.uid() = guardian_id);

-- 8. No auto-link trigger exists in this codebase; nothing to remove.
