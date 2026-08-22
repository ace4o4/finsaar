-- ==============================================================================
-- FINSAAR BLOG SYSTEM - SUPABASE DATABASE & STORAGE SCHEMA
-- ==============================================================================
-- Run this entire script in your Supabase project's SQL Editor (supabase.com -> SQL Editor)

-- 1. Create Posts Table
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null,
  category text not null default 'Strategy',
  author text not null default 'Finsaar Team',
  author_role text not null default 'CFO Advisory',
  date date not null default current_date,
  read_time text not null default '5 min',
  featured boolean not null default false,
  published boolean not null default true,
  tags text[] default '{}',
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast lookup by slug and category
create index if not exists idx_posts_slug on public.posts (slug);
create index if not exists idx_posts_category on public.posts (category);
create index if not exists idx_posts_published on public.posts (published);

-- Auto-update updated_at timestamp trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at
  before update on public.posts
  for each row
  execute function public.handle_updated_at();

-- 2. Enable Row Level Security (RLS)
alter table public.posts enable row level security;

-- Policies for posts table:
-- 1. Allow reading posts (public website + admin panel)
drop policy if exists "Allow public read access to posts" on public.posts;
drop policy if exists "Allow public read access to published posts" on public.posts;
create policy "Allow public read access to posts" 
on public.posts for select 
to public 
using (true);

-- 2. Allow inserting new blog posts
drop policy if exists "Allow public insert on posts" on public.posts;
create policy "Allow public insert on posts" 
on public.posts for insert 
to public 
with check (true);

-- 3. Allow updating blog posts
drop policy if exists "Allow public update on posts" on public.posts;
create policy "Allow public update on posts" 
on public.posts for update 
to public 
using (true) 
with check (true);

-- 4. Allow deleting blog posts
drop policy if exists "Allow public delete on posts" on public.posts;
create policy "Allow public delete on posts" 
on public.posts for delete 
to public 
using (true);

-- 3. Storage Bucket for Blog Images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  10485760, -- 10MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
on conflict (id) do update set public = true;

-- Storage Policies:
-- Allow anyone to view/download images
drop policy if exists "Public Access for blog-images" on storage.objects;
create policy "Public Access for blog-images"
on storage.objects for select
using (bucket_id = 'blog-images');

-- Allow anyone / anon to upload images to blog-images bucket
drop policy if exists "Allow upload for blog-images" on storage.objects;
create policy "Allow upload for blog-images"
on storage.objects for insert
with check (bucket_id = 'blog-images');

-- Allow update and delete on blog-images
drop policy if exists "Allow update on blog-images" on storage.objects;
create policy "Allow update on blog-images"
on storage.objects for update
using (bucket_id = 'blog-images');

drop policy if exists "Allow delete on blog-images" on storage.objects;
create policy "Allow delete on blog-images"
on storage.objects for delete
using (bucket_id = 'blog-images');

-- ==============================================================================
-- 4. Create Leads / Strategy Calls Table
-- ==============================================================================
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  email text not null,
  description text,
  source text default 'strategy_call_modal',
  status text default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

-- Ensure deleted_at exists if table was created previously
alter table public.leads add column if not exists deleted_at timestamp with time zone;

-- Index for querying leads by date and status
create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_status on public.leads (status);

-- Enable RLS
alter table public.leads enable row level security;

-- Policies for leads table:
-- 1. Allow anyone to insert lead submissions
drop policy if exists "Allow public insert into leads" on public.leads;
create policy "Allow public insert into leads"
on public.leads for insert
to public
with check (true);

-- 2. Allow reading leads in admin panel
drop policy if exists "Allow public select on leads" on public.leads;
create policy "Allow public select on leads"
on public.leads for select
to public
using (true);

-- 3. Allow updating lead status (New, Contacted, Closed)
drop policy if exists "Allow public update on leads" on public.leads;
create policy "Allow public update on leads"
on public.leads for update
to public
using (true)
with check (true);

-- 4. Allow deleting leads
drop policy if exists "Allow public delete on leads" on public.leads;
create policy "Allow public delete on leads"
on public.leads for delete
to public
using (true);

-- ==============================================================================
-- 5. Create Compliance Items Table
-- ==============================================================================
create table if not exists public.compliance_items (
  id uuid default gen_random_uuid() primary key,
  category text not null default 'Every Month',
  date text not null,
  task text not null,
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_compliance_category on public.compliance_items (category);
create index if not exists idx_compliance_order on public.compliance_items (order_index);

alter table public.compliance_items enable row level security;

-- Policies for compliance_items:
drop policy if exists "Allow public select on compliance_items" on public.compliance_items;
create policy "Allow public select on compliance_items"
on public.compliance_items for select
to public
using (true);

drop policy if exists "Allow public insert on compliance_items" on public.compliance_items;
create policy "Allow public insert on compliance_items"
on public.compliance_items for insert
to public
with check (true);

drop policy if exists "Allow public update on compliance_items" on public.compliance_items;
create policy "Allow public update on compliance_items"
on public.compliance_items for update
to public
using (true)
with check (true);

drop policy if exists "Allow public delete on compliance_items" on public.compliance_items;
create policy "Allow public delete on compliance_items"
on public.compliance_items for delete
to public
using (true);

-- ==============================================================================
-- 6. Create Case Studies Table
-- ==============================================================================
create table if not exists public.case_studies (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  industry text not null,
  metric text not null,
  description text not null,
  glow text default 'bg-orange-500',
  link text default '#',
  order_index integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_case_studies_order on public.case_studies (order_index);

alter table public.case_studies enable row level security;

-- Policies for case_studies:
drop policy if exists "Allow public select on case_studies" on public.case_studies;
create policy "Allow public select on case_studies"
on public.case_studies for select
to public
using (true);

drop policy if exists "Allow public insert on case_studies" on public.case_studies;
create policy "Allow public insert on case_studies"
on public.case_studies for insert
to public
with check (true);

drop policy if exists "Allow public update on case_studies" on public.case_studies;
create policy "Allow public update on case_studies"
on public.case_studies for update
to public
using (true)
with check (true);

drop policy if exists "Allow public delete on case_studies" on public.case_studies;
create policy "Allow public delete on case_studies"
on public.case_studies for delete
to public
using (true);

-- ==============================================================================
-- 7. Create Compliance Calendars Table (Dedicated Monthly Calendar Posts)
-- ==============================================================================
create table if not exists public.compliance_calendars (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content text not null,
  category text not null default 'Monthly Calendar',
  author text not null default 'Finsaar Team',
  date date not null default current_date,
  published boolean not null default true,
  image text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for fast lookup by slug
create index if not exists idx_compliance_calendars_slug on public.compliance_calendars (slug);
create index if not exists idx_compliance_calendars_published on public.compliance_calendars (published);

-- Auto-update updated_at timestamp trigger for compliance_calendars
drop trigger if exists set_compliance_calendars_updated_at on public.compliance_calendars;
create trigger set_compliance_calendars_updated_at
  before update on public.compliance_calendars
  for each row
  execute function public.handle_updated_at();

-- Enable RLS & Policies for Compliance Calendars
alter table public.compliance_calendars enable row level security;

drop policy if exists "Allow public read access to compliance_calendars" on public.compliance_calendars;
create policy "Allow public read access to compliance_calendars" 
on public.compliance_calendars for select 
to public 
using (true);

drop policy if exists "Allow public insert on compliance_calendars" on public.compliance_calendars;
create policy "Allow public insert on compliance_calendars" 
on public.compliance_calendars for insert 
to public 
with check (true);

drop policy if exists "Allow public update on compliance_calendars" on public.compliance_calendars;
create policy "Allow public update on compliance_calendars" 
on public.compliance_calendars for update 
to public 
using (true) 
with check (true);

drop policy if exists "Allow public delete on compliance_calendars" on public.compliance_calendars;
create policy "Allow public delete on compliance_calendars" 
on public.compliance_calendars for delete 
to public 
using (true);
