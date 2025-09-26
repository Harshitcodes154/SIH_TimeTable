-- Timetable Management System Database Schema
-- Migration: 20250926000001_create_timetable_schema.sql

-- Enable Row Level Security
alter database postgres set "app.jwt_secret" = 'your-jwt-secret-here';

-- Users table (Supabase Auth manages users, but you can extend with roles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  role text not null check (role in ('admin', 'faculty', 'coordinator')),
  department_id integer,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Departments
create table if not exists public.departments (
  id serial primary key,
  name text not null unique,
  code text unique,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Subjects
create table if not exists public.subjects (
  id serial primary key,
  name text not null,
  code text,
  department_id integer references public.departments(id) on delete cascade,
  credits integer default 3,
  hours_per_week integer default 3,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Classrooms
create table if not exists public.classrooms (
  id serial primary key,
  name text not null,
  capacity integer,
  type text check (type in ('lecture_hall', 'lab', 'tutorial_room', 'auditorium')),
  department_id integer references public.departments(id) on delete set null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Batches
create table if not exists public.batches (
  id serial primary key,
  name text not null,
  department_id integer references public.departments(id) on delete cascade,
  semester text not null,
  academic_year text not null,
  student_count integer,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Timetables
create table if not exists public.timetables (
  id uuid primary key default gen_random_uuid(),
  title text,
  department_id integer references public.departments(id) on delete set null,
  semester text not null,
  academic_year text not null,
  created_by uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('draft', 'pending', 'under-review', 'approved', 'rejected', 'active')),
  score integer,
  conflicts integer default 0,
  max_classes_per_day integer default 6,
  submitted_date timestamp with time zone,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamp with time zone,
  review_comment text,
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Time Slots (define available time periods)
create table if not exists public.time_slots (
  id serial primary key,
  period_number integer not null,
  start_time time not null,
  end_time time not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Timetable Entries (each row = one class slot)
create table if not exists public.timetable_entries (
  id serial primary key,
  timetable_id uuid references public.timetables(id) on delete cascade,
  batch_id integer references public.batches(id) on delete set null,
  subject_id integer references public.subjects(id) on delete set null,
  faculty_id uuid references public.profiles(id) on delete set null,
  classroom_id integer references public.classrooms(id) on delete set null,
  time_slot_id integer references public.time_slots(id) on delete set null,
  day_of_week integer not null check (day_of_week between 1 and 7), -- 1=Monday, 7=Sunday
  week_number integer default 1, -- for alternating weeks if needed
  class_type text check (class_type in ('lecture', 'lab', 'tutorial', 'seminar')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  
  -- Ensure no double booking
  unique(classroom_id, day_of_week, time_slot_id, week_number),
  unique(faculty_id, day_of_week, time_slot_id, week_number),
  unique(batch_id, day_of_week, time_slot_id, week_number)
);

-- Subject-Faculty mapping (who can teach what)
create table if not exists public.subject_faculty (
  id serial primary key,
  subject_id integer references public.subjects(id) on delete cascade,
  faculty_id uuid references public.profiles(id) on delete cascade,
  is_preferred boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  
  unique(subject_id, faculty_id)
);

-- Faculty availability
create table if not exists public.faculty_availability (
  id serial primary key,
  faculty_id uuid references public.profiles(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 1 and 7),
  time_slot_id integer references public.time_slots(id) on delete cascade,
  is_available boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  
  unique(faculty_id, day_of_week, time_slot_id)
);

-- Timetable parameters/constraints
create table if not exists public.timetable_parameters (
  id serial primary key,
  timetable_id uuid references public.timetables(id) on delete cascade,
  parameter_name text not null,
  parameter_value jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Audit log for changes
create table if not exists public.timetable_audit_log (
  id serial primary key,
  timetable_id uuid references public.timetables(id) on delete cascade,
  action text not null,
  changed_by uuid references public.profiles(id) on delete set null,
  changes jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add foreign key reference after profiles table is created
alter table public.profiles add constraint fk_profiles_department 
  foreign key (department_id) references public.departments(id) on delete set null;

-- Indexes for performance
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_department on public.profiles(department_id);
create index if not exists idx_subjects_department on public.subjects(department_id);
create index if not exists idx_batches_department on public.batches(department_id);
create index if not exists idx_batches_semester on public.batches(semester);
create index if not exists idx_timetables_department on public.timetables(department_id);
create index if not exists idx_timetables_status on public.timetables(status);
create index if not exists idx_timetable_entries_timetable on public.timetable_entries(timetable_id);
create index if not exists idx_timetable_entries_schedule on public.timetable_entries(day_of_week, time_slot_id);
create index if not exists idx_subject_faculty_subject on public.subject_faculty(subject_id);
create index if not exists idx_subject_faculty_faculty on public.subject_faculty(faculty_id);

-- Insert default time slots (9 AM to 5 PM with 1-hour slots)
insert into public.time_slots (period_number, start_time, end_time) values
  (1, '09:00:00', '10:00:00'),
  (2, '10:00:00', '11:00:00'),
  (3, '11:00:00', '12:00:00'),
  (4, '12:00:00', '13:00:00'), -- Lunch break
  (5, '13:00:00', '14:00:00'),
  (6, '14:00:00', '15:00:00'),
  (7, '15:00:00', '16:00:00'),
  (8, '16:00:00', '17:00:00');

-- Insert sample departments
insert into public.departments (name, code) values
  ('Computer Science', 'CS'),
  ('Information Technology', 'IT'),
  ('Electronics and Communication', 'ECE'),
  ('Mechanical Engineering', 'ME'),
  ('Civil Engineering', 'CE');

-- Enable Row Level Security on all tables
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

-- Function to handle user profile creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, new.email, 'faculty'); -- Default role
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile when user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add updated_at triggers to relevant tables
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure update_updated_at_column();

create trigger update_departments_updated_at before update on public.departments
  for each row execute procedure update_updated_at_column();

create trigger update_subjects_updated_at before update on public.subjects
  for each row execute procedure update_updated_at_column();

create trigger update_classrooms_updated_at before update on public.classrooms
  for each row execute procedure update_updated_at_column();

create trigger update_batches_updated_at before update on public.batches
  for each row execute procedure update_updated_at_column();

create trigger update_timetables_updated_at before update on public.timetables
  for each row execute procedure update_updated_at_column();

create trigger update_timetable_entries_updated_at before update on public.timetable_entries
  for each row execute procedure update_updated_at_column();