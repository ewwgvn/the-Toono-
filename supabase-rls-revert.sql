-- ============================================================
--  REVERT — undo the Uliger World RLS policies
--  Restores the previous behaviour (RLS off, policies removed).
--  Run in: Supabase → SQL Editor → New query → paste → Run
-- ============================================================

-- core tables: disable RLS + drop policies
alter table profiles      disable row level security;
alter table works         disable row level security;
alter table likes         disable row level security;
alter table saves         disable row level security;
alter table follows       disable row level security;
alter table comments      disable row level security;
alter table reviews       disable row level security;
alter table orders        disable row level security;
alter table commissions   disable row level security;
alter table notifications disable row level security;
alter table conversations disable row level security;
alter table messages      disable row level security;

drop policy if exists "profiles_select" on profiles;
drop policy if exists "profiles_insert" on profiles;
drop policy if exists "profiles_update" on profiles;
drop policy if exists "works_select" on works;
drop policy if exists "works_insert" on works;
drop policy if exists "works_update" on works;
drop policy if exists "works_delete" on works;
drop policy if exists "likes_select" on likes;
drop policy if exists "likes_insert" on likes;
drop policy if exists "likes_delete" on likes;
drop policy if exists "saves_select" on saves;
drop policy if exists "saves_insert" on saves;
drop policy if exists "saves_delete" on saves;
drop policy if exists "follows_select" on follows;
drop policy if exists "follows_insert" on follows;
drop policy if exists "follows_delete" on follows;
drop policy if exists "comments_select" on comments;
drop policy if exists "comments_insert" on comments;
drop policy if exists "comments_update" on comments;
drop policy if exists "comments_delete" on comments;
drop policy if exists "reviews_select" on reviews;
drop policy if exists "reviews_insert" on reviews;
drop policy if exists "reviews_update" on reviews;
drop policy if exists "reviews_delete" on reviews;
drop policy if exists "orders_select" on orders;
drop policy if exists "orders_insert" on orders;
drop policy if exists "orders_update" on orders;
drop policy if exists "commissions_select" on commissions;
drop policy if exists "commissions_insert" on commissions;
drop policy if exists "commissions_update" on commissions;
drop policy if exists "notifications_select" on notifications;
drop policy if exists "notifications_insert" on notifications;
drop policy if exists "notifications_update" on notifications;
drop policy if exists "conversations_select" on conversations;
drop policy if exists "conversations_insert" on conversations;
drop policy if exists "conversations_update" on conversations;
drop policy if exists "messages_select" on messages;
drop policy if exists "messages_insert" on messages;
drop policy if exists "messages_update" on messages;

-- optional tables (only if they exist)
do $$ begin
  if to_regclass('public.offers') is not null then
    alter table offers disable row level security;
    drop policy if exists "offers_select" on offers;
    drop policy if exists "offers_insert" on offers;
  end if;
  if to_regclass('public.return_requests') is not null then
    alter table return_requests disable row level security;
    drop policy if exists "return_requests_select" on return_requests;
    drop policy if exists "return_requests_insert" on return_requests;
  end if;
  if to_regclass('public.reports') is not null then
    alter table reports disable row level security;
    drop policy if exists "reports_insert" on reports;
  end if;
end $$;

-- storage: remove the policies this project added
drop policy if exists "uliger_storage_read" on storage.objects;
drop policy if exists "uliger_storage_insert" on storage.objects;
drop policy if exists "uliger_storage_update" on storage.objects;
drop policy if exists "uliger_storage_delete" on storage.objects;

-- ============================================================
--  Done — back to the pre-RLS state.
-- ============================================================
