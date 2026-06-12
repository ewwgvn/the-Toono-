-- ══════════════════════════════════════════════════════════════
-- Uliger World — Admin / Trust / Digital Delivery Migration
-- Supabase SQL Editor에서 한 번에 실행
-- ══════════════════════════════════════════════════════════════

-- 1. profiles: role, verified, bank account fields
alter table profiles
  add column if not exists role             text    not null default 'buyer',
  add column if not exists verified         boolean not null default false,
  add column if not exists bank_code        text,
  add column if not exists bank_account_no  text,
  add column if not exists bank_account_name text,
  add column if not exists suspended        boolean not null default false;

-- 2. works: suspended flag
alter table works
  add column if not exists suspended boolean not null default false,
  add column if not exists digital    boolean not null default false;

-- 3. orders: escrow auto-confirm timer + release timestamp
alter table orders
  add column if not exists escrow_auto_confirm_at timestamptz,
  add column if not exists escrow_released_at     timestamptz;

-- 4. commissions: milestone payment stages
alter table commissions
  add column if not exists milestone_stage  int     not null default 0,
  add column if not exists deposit_paid     boolean not null default false,
  add column if not exists deposit_order_id text,
  add column if not exists final_paid       boolean not null default false,
  add column if not exists final_order_id   text;

-- 5. Digital files (per work)
create table if not exists digital_files (
  id           uuid primary key default gen_random_uuid(),
  work_id      text not null,
  uploader_id  uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  file_name    text not null,
  file_size    bigint,
  created_at   timestamptz not null default now()
);

-- 6. Digital download tokens (per order)
create table if not exists digital_downloads (
  id              uuid    primary key default gen_random_uuid(),
  order_id        text    not null unique,
  work_id         text    not null,
  buyer_id        uuid    references auth.users(id),
  download_count  int     not null default 0,
  max_downloads   int     not null default 5,
  expires_at      timestamptz not null,
  token           text    not null unique default gen_random_uuid()::text,
  created_at      timestamptz not null default now()
);

-- 7. RLS for digital tables (only buyer can see their own tokens)
alter table digital_downloads enable row level security;
create policy if not exists "owner can view download" on digital_downloads
  for select using (buyer_id = auth.uid());

alter table digital_files enable row level security;
create policy if not exists "uploader can manage" on digital_files
  for all using (uploader_id = auth.uid());

-- 8. Admin: set your own user's role to admin
-- update profiles set role = 'admin' where id = '<your-user-id>';
