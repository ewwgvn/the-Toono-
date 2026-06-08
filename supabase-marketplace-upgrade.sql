-- TOONO marketplace order protection upgrade
-- Run this once in Supabase SQL Editor for existing projects.

alter table public.orders
  add column if not exists platform_fee int default 0,
  add column if not exists seller_payout int default 0,
  add column if not exists payment_status text default 'paid',
  add column if not exists escrow_status text default 'held',
  add column if not exists payout_status text default 'pending',
  add column if not exists protection_until date default (current_date + 7);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_payment_status_check'
  ) then
    alter table public.orders
      add constraint orders_payment_status_check
      check (payment_status in ('pending','paid','failed','refunded'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'orders_escrow_status_check'
  ) then
    alter table public.orders
      add constraint orders_escrow_status_check
      check (escrow_status in ('held','released','refunded','disputed'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'orders_payout_status_check'
  ) then
    alter table public.orders
      add constraint orders_payout_status_check
      check (payout_status in ('pending','scheduled','paid','cancelled'));
  end if;
end $$;

update public.orders
set
  platform_fee = case when coalesce(platform_fee, 0) = 0 then round((total_price - coalesce(shipping_fee, 0)) * 0.08)::int else platform_fee end,
  seller_payout = case when coalesce(seller_payout, 0) = 0 then greatest(0, (total_price - coalesce(shipping_fee, 0)) - coalesce(platform_fee, 0)) else seller_payout end,
  payment_status = coalesce(payment_status, 'paid'),
  escrow_status = coalesce(escrow_status, case when status = 'done' then 'released' when status = 'cancelled' then 'refunded' else 'held' end),
  payout_status = coalesce(payout_status, case when status = 'done' then 'scheduled' when status = 'cancelled' then 'cancelled' else 'pending' end),
  protection_until = coalesce(protection_until, current_date + 7);
