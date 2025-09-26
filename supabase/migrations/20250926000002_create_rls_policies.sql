-- Row Level Security Policies for Timetable Management System
-- Migration: 20250926000002_create_rls_policies.sql

-- Enable RLS (already enabled in schema file, but ensuring it's set)
alter table public.profiles enable row level security;
alter table public.departments enable row level security;
alter table public.subjects enable row level security;
alter table public.classrooms enable row level security;
alter table public.batches enable row level security;
alter table public.timetables enable row level security;
alter table public.time_slots enable row level security;
alter table public.timetable_entries enable row level security;
alter table public.subject_faculty enable row level security;
alter table public.faculty_availability enable row level security;
alter table public.timetable_parameters enable row level security;
alter table public.timetable_audit_log enable row level security;

-- Helper function to get current user's role
create or replace function auth.role() returns text as $$
  select coalesce((
    select role from public.profiles 
    where id = auth.uid()
  ), 'anonymous');
$$ language sql stable security definer;

-- Helper function to get current user's department
create or replace function auth.user_department_id() returns integer as $$
  select department_id from public.profiles 
  where id = auth.uid();
$$ language sql stable security definer;

-- PROFILES TABLE POLICIES
-- Users can view their own profile and others in same department
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can view profiles in same department"
  on public.profiles for select
  using (
    auth.role() in ('admin', 'coordinator') or 
    department_id = auth.user_department_id()
  );

-- Users can update their own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Only admins can insert new profiles (handled by trigger mostly)
create policy "Admin can manage all profiles"
  on public.profiles for all
  using (auth.role() = 'admin');

-- DEPARTMENTS TABLE POLICIES  
-- Everyone can read departments
create policy "Anyone can view departments"
  on public.departments for select
  to authenticated
  using (true);

-- Only admins can modify departments
create policy "Admin can manage departments"
  on public.departments for all
  using (auth.role() = 'admin');

-- SUBJECTS TABLE POLICIES
-- Users can view subjects in their department or all if admin
create policy "View subjects"
  on public.subjects for select
  using (
    auth.role() = 'admin' or 
    department_id = auth.user_department_id()
  );

-- Coordinators and admins can manage subjects in their department
create policy "Coordinators can manage department subjects"
  on public.subjects for all
  using (
    auth.role() = 'admin' or 
    (auth.role() = 'coordinator' and department_id = auth.user_department_id())
  );

-- CLASSROOMS TABLE POLICIES
-- Users can view classrooms (needed for scheduling)
create policy "View classrooms"
  on public.classrooms for select
  using (
    auth.role() = 'admin' or 
    department_id = auth.user_department_id() or
    department_id is null -- shared classrooms
  );

-- Coordinators and admins can manage classrooms
create policy "Coordinators can manage classrooms"
  on public.classrooms for all
  using (
    auth.role() = 'admin' or 
    (auth.role() = 'coordinator' and (
      department_id = auth.user_department_id() or 
      department_id is null
    ))
  );

-- BATCHES TABLE POLICIES
-- Users can view batches in their department
create policy "View batches"
  on public.batches for select
  using (
    auth.role() = 'admin' or 
    department_id = auth.user_department_id()
  );

-- Coordinators and admins can manage batches in their department
create policy "Coordinators can manage batches"
  on public.batches for all
  using (
    auth.role() = 'admin' or 
    (auth.role() = 'coordinator' and department_id = auth.user_department_id())
  );

-- TIME_SLOTS TABLE POLICIES
-- Everyone can read time slots
create policy "Anyone can view time slots"
  on public.time_slots for select
  to authenticated
  using (true);

-- Only admins can manage time slots
create policy "Admin can manage time slots"
  on public.time_slots for all
  using (auth.role() = 'admin');

-- TIMETABLES TABLE POLICIES
-- Users can view timetables in their department or created by them
create policy "View timetables"
  on public.timetables for select
  using (
    auth.role() = 'admin' or 
    department_id = auth.user_department_id() or
    created_by = auth.uid()
  );

-- Users can create timetables for their department
create policy "Create timetables"
  on public.timetables for insert
  with check (
    auth.role() in ('coordinator', 'admin') and
    (auth.role() = 'admin' or department_id = auth.user_department_id())
  );

-- Users can update their own timetables (unless approved)
create policy "Update own timetables"
  on public.timetables for update
  using (
    created_by = auth.uid() and status not in ('approved', 'active')
  );

-- Admins can update any timetable
create policy "Admin can manage all timetables"
  on public.timetables for all
  using (auth.role() = 'admin');

-- Coordinators can approve timetables in their department
create policy "Coordinators can approve timetables"
  on public.timetables for update
  using (
    auth.role() = 'coordinator' and 
    department_id = auth.user_department_id() and
    status in ('pending', 'under-review')
  );

-- TIMETABLE_ENTRIES TABLE POLICIES
-- Users can view entries for timetables they have access to
create policy "View timetable entries"
  on public.timetable_entries for select
  using (
    exists (
      select 1 from public.timetables t
      where t.id = timetable_id
      and (
        auth.role() = 'admin' or 
        t.department_id = auth.user_department_id() or
        t.created_by = auth.uid()
      )
    )
  );

-- Users can manage entries for their timetables
create policy "Manage own timetable entries"
  on public.timetable_entries for all
  using (
    exists (
      select 1 from public.timetables t
      where t.id = timetable_id
      and (
        auth.role() = 'admin' or 
        (t.created_by = auth.uid() and t.status not in ('approved', 'active'))
      )
    )
  );

-- SUBJECT_FACULTY TABLE POLICIES
-- Users can view subject-faculty mappings in their department
create policy "View subject faculty mappings"
  on public.subject_faculty for select
  using (
    auth.role() = 'admin' or
    exists (
      select 1 from public.subjects s 
      where s.id = subject_id 
      and s.department_id = auth.user_department_id()
    ) or
    faculty_id = auth.uid()
  );

-- Coordinators can manage subject-faculty mappings in their department
create policy "Coordinators can manage subject faculty mappings"
  on public.subject_faculty for all
  using (
    auth.role() = 'admin' or
    (auth.role() = 'coordinator' and exists (
      select 1 from public.subjects s 
      where s.id = subject_id 
      and s.department_id = auth.user_department_id()
    ))
  );

-- FACULTY_AVAILABILITY TABLE POLICIES
-- Faculty can manage their own availability
create policy "Faculty can manage own availability"
  on public.faculty_availability for all
  using (
    faculty_id = auth.uid() or auth.role() = 'admin'
  );

-- Coordinators can view availability of faculty in their department
create policy "Coordinators can view department faculty availability"
  on public.faculty_availability for select
  using (
    auth.role() = 'admin' or
    (auth.role() = 'coordinator' and exists (
      select 1 from public.profiles p
      where p.id = faculty_id
      and p.department_id = auth.user_department_id()
    )) or
    faculty_id = auth.uid()
  );

-- TIMETABLE_PARAMETERS TABLE POLICIES
-- Users can view parameters for timetables they have access to
create policy "View timetable parameters"
  on public.timetable_parameters for select
  using (
    exists (
      select 1 from public.timetables t
      where t.id = timetable_id
      and (
        auth.role() = 'admin' or 
        t.department_id = auth.user_department_id() or
        t.created_by = auth.uid()
      )
    )
  );

-- Users can manage parameters for their timetables
create policy "Manage timetable parameters"
  on public.timetable_parameters for all
  using (
    exists (
      select 1 from public.timetables t
      where t.id = timetable_id
      and (
        auth.role() = 'admin' or 
        (t.created_by = auth.uid() and t.status not in ('approved', 'active'))
      )
    )
  );

-- TIMETABLE_AUDIT_LOG TABLE POLICIES
-- Users can view audit logs for timetables they have access to
create policy "View timetable audit logs"
  on public.timetable_audit_log for select
  using (
    exists (
      select 1 from public.timetables t
      where t.id = timetable_id
      and (
        auth.role() = 'admin' or 
        t.department_id = auth.user_department_id() or
        t.created_by = auth.uid()
      )
    )
  );

-- System can insert audit logs
create policy "System can insert audit logs"
  on public.timetable_audit_log for insert
  with check (true);

-- Only admins can modify audit logs
create policy "Admin can manage audit logs"
  on public.timetable_audit_log for all
  using (auth.role() = 'admin');

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;

-- Grant read access to anonymous users for public data (if needed)
grant select on public.departments to anon;
grant select on public.time_slots to anon;