-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- SPACES TABLE
create table public.spaces (
  id text primary key default uuid_generate_v4()::text,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  icon text,
  color text,
  user_id uuid references auth.users(id)
);

-- NODES TABLE
create table public.nodes (
  id text primary key default uuid_generate_v4()::text,
  space_id text references public.spaces(id) on delete cascade,
  type text not null,
  title text not null,
  summary text,
  content text,
  url text,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text check (status in ('new', 'learned', 'archived')),
  pinned boolean default false,
  source text,
  user_id uuid references auth.users(id)
);

-- Enable Row Level Security (RLS)
alter table public.spaces enable row level security;
alter table public.nodes enable row level security;

-- RLS Policies (Allow access to own data)
create policy "Users can view their own spaces" 
on public.spaces for select 
using (auth.uid() = user_id);

create policy "Users can insert their own spaces" 
on public.spaces for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own spaces" 
on public.spaces for update 
using (auth.uid() = user_id);

create policy "Users can delete their own spaces" 
on public.spaces for delete 
using (auth.uid() = user_id);

-- Nodes policies
create policy "Users can view their own nodes" 
on public.nodes for select 
using (auth.uid() = user_id);

create policy "Users can insert their own nodes" 
on public.nodes for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own nodes" 
on public.nodes for update 
using (auth.uid() = user_id);

create policy "Users can delete their own nodes" 
on public.nodes for delete 
using (auth.uid() = user_id);
