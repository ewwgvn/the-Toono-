-- ============================================================
--  Uliger World — Admin role: full RLS permissions
--  Run AFTER supabase-admin-migration.sql and supabase-rls.sql
--  Safe to re-run (drops existing policies first).
--  Run in: Supabase → SQL Editor → New query → paste → Run
-- ============================================================

-- ─────────────────────────────────────────────
-- Helper: is_admin()
-- security definer ⇒ bypasses RLS on profiles when checking the
-- caller's own role, avoiding infinite-recursion in profiles policies.
-- ─────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated;

-- ─────────────────────────────────────────────
-- profiles : admin can update any profile
-- (suspend users, set verified, etc. — adminSuspendUser / adminSetVerified)
-- ─────────────────────────────────────────────
drop policy if exists "profiles_admin_update" on profiles;
create policy "profiles_admin_update" on profiles
  for update using (is_admin()) with check (is_admin());

-- ─────────────────────────────────────────────
-- works : admin can see and manage every work, including
-- unpublished / suspended ones (adminGetAllWorks / adminSuspendWork)
-- ─────────────────────────────────────────────
drop policy if exists "works_admin_select" on works;
create policy "works_admin_select" on works
  for select using (is_admin());

drop policy if exists "works_admin_update" on works;
create policy "works_admin_update" on works
  for update using (is_admin()) with check (is_admin());

drop policy if exists "works_admin_delete" on works;
create policy "works_admin_delete" on works
  for delete using (is_admin());

-- ─────────────────────────────────────────────
-- disputes : admin can read & resolve all disputes
-- (adminGetDisputes / adminResolveDispute)
-- ─────────────────────────────────────────────
drop policy if exists "disputes_admin_select" on disputes;
create policy "disputes_admin_select" on disputes
  for select using (is_admin());

drop policy if exists "disputes_admin_update" on disputes;
create policy "disputes_admin_update" on disputes
  for update using (is_admin()) with check (is_admin());

-- ─────────────────────────────────────────────
-- reports : admin can read & resolve all reports
-- (adminGetReports / adminResolveReport)
-- (optional table — applied only if it exists)
-- ─────────────────────────────────────────────
do $$ begin
  if to_regclass('public.reports') is not null then
    alter table public.reports enable row level security;

    drop policy if exists "reports_admin_select" on public.reports;
    create policy "reports_admin_select" on public.reports
      for select using (is_admin());

    drop policy if exists "reports_admin_update" on public.reports;
    create policy "reports_admin_update" on public.reports
      for update using (is_admin()) with check (is_admin());
  end if;
end $$;

-- ─────────────────────────────────────────────
-- orders : admin can read & update any order
-- (needed when resolving a dispute releases/refunds escrow via
-- DB.updateOrder on an order the admin is neither buyer nor seller of)
-- ─────────────────────────────────────────────
drop policy if exists "orders_admin_select" on orders;
create policy "orders_admin_select" on orders
  for select using (is_admin());

drop policy if exists "orders_admin_update" on orders;
create policy "orders_admin_update" on orders
  for update using (is_admin()) with check (is_admin());

-- ─────────────────────────────────────────────
-- commissions : admin can read & update any commission
-- ─────────────────────────────────────────────
drop policy if exists "commissions_admin_select" on commissions;
create policy "commissions_admin_select" on commissions
  for select using (is_admin());

drop policy if exists "commissions_admin_update" on commissions;
create policy "commissions_admin_update" on commissions
  for update using (is_admin()) with check (is_admin());

-- ============================================================
--  Finally: grant YOUR account the admin role.
--  Run this once (uncomment and run):
-- ============================================================
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'galtbilguun0@gmail.com');

-- ============================================================
--  Done. Verify with:
--    select id, name, role from public.profiles where role = 'admin';
-- ============================================================
