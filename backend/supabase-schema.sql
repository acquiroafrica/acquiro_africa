-- =============================================================
-- ACQUIRO — Supabase Schema
-- Run this in your Supabase SQL editor
-- =============================================================

-- 1. User roles (buyer | seller | admin)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  role text not null check (role in ('buyer','seller','admin')),
  first_name text,
  last_name text,
  phone_number text,
  created_at timestamptz default now()
);

alter table public.user_roles enable row level security;

-- Policies for user_roles
create policy "Users can read own role" on public.user_roles
  for select using (auth.uid() = user_id);

-- This allows the signup process to create the profile record
create policy "Users can insert own role" on public.user_roles
  for insert with check (true); 

create policy "Users can update own profile" on public.user_roles
  for update using (auth.uid() = user_id);

-- Helper function to check if user is admin (bypasses RLS to avoid recursion)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Admin access to user_roles
create policy "Admins can read all roles" on public.user_roles
  for select using (is_admin());

-- 2. Listings (created by sellers, approved by admin)
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  sector text not null,
  state text not null,
  lga text,
  asking_price text not null,
  revenue_band text not null,
  years_operating text not null,
  staff_range text not null,
  deal_type text not null,
  description text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  financials_url text,
  audit_report_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.listings enable row level security;

-- Listings Policies
create policy "Sellers read own listings" on public.listings
  for select using (auth.uid() = seller_id);

create policy "All read approved" on public.listings
  for select using (status = 'approved');

create policy "Sellers insert" on public.listings
  for insert with check (auth.uid() = seller_id);

create policy "Sellers update own" on public.listings
  for update using (auth.uid() = seller_id);

create policy "Admins can do everything on listings" on public.listings
  for all using (is_admin());

-- 3. Access requests (buyer requests access to a specific listing)
create table if not exists public.access_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references public.listings(id) on delete cascade not null,
  buyer_id uuid references auth.users(id) on delete cascade not null,
  note text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now(),
  unique(listing_id, buyer_id)
);

alter table public.access_requests enable row level security;

-- Access Requests Policies
create policy "Buyers read own requests" on public.access_requests
  for select using (auth.uid() = buyer_id);

create policy "Buyers insert requests" on public.access_requests
  for insert with check (auth.uid() = buyer_id);

create policy "Admins can do everything on access_requests" on public.access_requests
  for all using (is_admin());

-- 4. Buyer interest submissions (business they want that is not listed)
create table if not exists public.buyer_requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references auth.users(id) on delete cascade not null,
  sector text not null,
  preferred_state text not null,
  budget_range text not null,
  deal_type text not null,
  description text not null,
  status text not null default 'pending' check (status in ('pending','reviewed')),
  created_at timestamptz default now()
);

alter table public.buyer_requests enable row level security;

-- Buyer Requests Policies
create policy "Buyers read own buyer_requests" on public.buyer_requests
  for select using (auth.uid() = buyer_id);

create policy "Buyers insert buyer_requests" on public.buyer_requests
  for insert with check (auth.uid() = buyer_id);

create policy "Admins can do everything on buyer_requests" on public.buyer_requests
  for all using (is_admin());

-- 5. Helper function for handling updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for listings
create trigger on_listings_updated
  before update on public.listings
  for each row execute procedure public.handle_updated_at();
-- 6. Trigger for automatic profile creation on signup
--    NOTE: The /api/register server route (using service role) is the PRIMARY
--    mechanism for inserting into user_roles. This trigger acts as a fallback.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_roles (user_id, role, first_name, last_name, phone_number)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'phone_number'
  )
  on conflict (user_id) do update set
    role = excluded.role,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    phone_number = excluded.phone_number;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

