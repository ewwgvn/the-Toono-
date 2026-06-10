-- ============================================================
--  Uliger World — Row Level Security policies
--  Safe to re-run (drops existing policies first).
--  Run in: Supabase → SQL Editor → New query → paste → Run
-- ============================================================

-- ─────────────────────────────────────────────
-- profiles : public read, owner write
-- ─────────────────────────────────────────────
alter table profiles enable row level security;
drop policy if exists "profiles_select" on profiles;
drop policy if exists "profiles_insert" on profiles;
drop policy if exists "profiles_update" on profiles;
create policy "profiles_select" on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- ─────────────────────────────────────────────
-- works : published are public; owner sees & manages all
-- ─────────────────────────────────────────────
alter table works enable row level security;
drop policy if exists "works_select" on works;
drop policy if exists "works_insert" on works;
drop policy if exists "works_update" on works;
drop policy if exists "works_delete" on works;
create policy "works_select" on works for select using (status = 'published' or creator_id = auth.uid());
create policy "works_insert" on works for insert with check (creator_id = auth.uid());
create policy "works_update" on works for update using (creator_id = auth.uid()) with check (creator_id = auth.uid());
create policy "works_delete" on works for delete using (creator_id = auth.uid());

-- ─────────────────────────────────────────────
-- likes : public read, own write
-- ─────────────────────────────────────────────
alter table likes enable row level security;
drop policy if exists "likes_select" on likes;
drop policy if exists "likes_insert" on likes;
drop policy if exists "likes_delete" on likes;
create policy "likes_select" on likes for select using (true);
create policy "likes_insert" on likes for insert with check (user_id = auth.uid());
create policy "likes_delete" on likes for delete using (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- saves : private to owner
-- ─────────────────────────────────────────────
alter table saves enable row level security;
drop policy if exists "saves_select" on saves;
drop policy if exists "saves_insert" on saves;
drop policy if exists "saves_delete" on saves;
create policy "saves_select" on saves for select using (user_id = auth.uid());
create policy "saves_insert" on saves for insert with check (user_id = auth.uid());
create policy "saves_delete" on saves for delete using (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- follows : public read, own write
-- ─────────────────────────────────────────────
alter table follows enable row level security;
drop policy if exists "follows_select" on follows;
drop policy if exists "follows_insert" on follows;
drop policy if exists "follows_delete" on follows;
create policy "follows_select" on follows for select using (true);
create policy "follows_insert" on follows for insert with check (follower_id = auth.uid());
create policy "follows_delete" on follows for delete using (follower_id = auth.uid());

-- ─────────────────────────────────────────────
-- comments : public read, own write/delete
-- ─────────────────────────────────────────────
alter table comments enable row level security;
drop policy if exists "comments_select" on comments;
drop policy if exists "comments_insert" on comments;
drop policy if exists "comments_update" on comments;
drop policy if exists "comments_delete" on comments;
create policy "comments_select" on comments for select using (true);
create policy "comments_insert" on comments for insert with check (user_id = auth.uid());
create policy "comments_update" on comments for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "comments_delete" on comments for delete using (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- reviews : public read, reviewer writes own
-- ─────────────────────────────────────────────
alter table reviews enable row level security;
drop policy if exists "reviews_select" on reviews;
drop policy if exists "reviews_insert" on reviews;
drop policy if exists "reviews_update" on reviews;
drop policy if exists "reviews_delete" on reviews;
create policy "reviews_select" on reviews for select using (true);
create policy "reviews_insert" on reviews for insert with check (reviewer_id = auth.uid());
create policy "reviews_update" on reviews for update using (reviewer_id = auth.uid()) with check (reviewer_id = auth.uid());
create policy "reviews_delete" on reviews for delete using (reviewer_id = auth.uid());

-- ─────────────────────────────────────────────
-- orders : only buyer or seller
-- ─────────────────────────────────────────────
alter table orders enable row level security;
drop policy if exists "orders_select" on orders;
drop policy if exists "orders_insert" on orders;
drop policy if exists "orders_update" on orders;
create policy "orders_select" on orders for select using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "orders_insert" on orders for insert with check (buyer_id = auth.uid());
create policy "orders_update" on orders for update using (buyer_id = auth.uid() or seller_id = auth.uid()) with check (buyer_id = auth.uid() or seller_id = auth.uid());

-- ─────────────────────────────────────────────
-- commissions : only buyer or seller
-- ─────────────────────────────────────────────
alter table commissions enable row level security;
drop policy if exists "commissions_select" on commissions;
drop policy if exists "commissions_insert" on commissions;
drop policy if exists "commissions_update" on commissions;
create policy "commissions_select" on commissions for select using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "commissions_insert" on commissions for insert with check (buyer_id = auth.uid());
create policy "commissions_update" on commissions for update using (buyer_id = auth.uid() or seller_id = auth.uid()) with check (buyer_id = auth.uid() or seller_id = auth.uid());

-- ─────────────────────────────────────────────
-- notifications : read/update own; insert allowed for any
-- logged-in user (needed so a seller can notify a buyer, etc.)
-- ─────────────────────────────────────────────
alter table notifications enable row level security;
drop policy if exists "notifications_select" on notifications;
drop policy if exists "notifications_insert" on notifications;
drop policy if exists "notifications_update" on notifications;
create policy "notifications_select" on notifications for select using (user_id = auth.uid());
create policy "notifications_insert" on notifications for insert with check (auth.uid() is not null);
create policy "notifications_update" on notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─────────────────────────────────────────────
-- conversations : only participants
-- ─────────────────────────────────────────────
alter table conversations enable row level security;
drop policy if exists "conversations_select" on conversations;
drop policy if exists "conversations_insert" on conversations;
drop policy if exists "conversations_update" on conversations;
create policy "conversations_select" on conversations for select using (user_a = auth.uid() or user_b = auth.uid());
create policy "conversations_insert" on conversations for insert with check (user_a = auth.uid() or user_b = auth.uid());
create policy "conversations_update" on conversations for update using (user_a = auth.uid() or user_b = auth.uid()) with check (user_a = auth.uid() or user_b = auth.uid());

-- ─────────────────────────────────────────────
-- messages : only participants of the conversation
-- ─────────────────────────────────────────────
alter table messages enable row level security;
drop policy if exists "messages_select" on messages;
drop policy if exists "messages_insert" on messages;
drop policy if exists "messages_update" on messages;
create policy "messages_select" on messages for select using (
  exists (select 1 from conversations c where c.id = messages.conversation_id
          and (c.user_a = auth.uid() or c.user_b = auth.uid())));
create policy "messages_insert" on messages for insert with check (
  sender_id = auth.uid() and exists (
    select 1 from conversations c where c.id = messages.conversation_id
    and (c.user_a = auth.uid() or c.user_b = auth.uid())));
create policy "messages_update" on messages for update using (
  exists (select 1 from conversations c where c.id = messages.conversation_id
          and (c.user_a = auth.uid() or c.user_b = auth.uid())));

-- ─────────────────────────────────────────────
-- offers : buyer or the work's owner can read; buyer inserts
-- (optional table — applied only if it exists)
-- ─────────────────────────────────────────────
do $$ begin
  if to_regclass('public.offers') is not null then
    alter table offers enable row level security;
    drop policy if exists "offers_select" on offers;
    drop policy if exists "offers_insert" on offers;
    create policy "offers_select" on offers for select using (
      buyer_id = auth.uid() or exists (select 1 from works w where w.id = offers.work_id and w.creator_id = auth.uid()));
    create policy "offers_insert" on offers for insert with check (buyer_id = auth.uid());
  end if;
end $$;

-- ─────────────────────────────────────────────
-- return_requests : buyer or seller read; buyer inserts
-- (optional table — applied only if it exists)
-- ─────────────────────────────────────────────
do $$ begin
  if to_regclass('public.return_requests') is not null then
    alter table return_requests enable row level security;
    drop policy if exists "return_requests_select" on return_requests;
    drop policy if exists "return_requests_insert" on return_requests;
    create policy "return_requests_select" on return_requests for select using (buyer_id = auth.uid() or seller_id = auth.uid());
    create policy "return_requests_insert" on return_requests for insert with check (buyer_id = auth.uid());
  end if;
end $$;

-- ─────────────────────────────────────────────
-- reports : insert only (reads via service role / dashboard)
-- (optional table — applied only if it exists)
-- ─────────────────────────────────────────────
do $$ begin
  if to_regclass('public.reports') is not null then
    alter table reports enable row level security;
    drop policy if exists "reports_insert" on reports;
    create policy "reports_insert" on reports for insert with check (reporter_id = auth.uid());
  end if;
end $$;

-- ============================================================
--  STORAGE : public read, logged-in users can upload
--  Buckets: avatars, works, chat, commissions
-- ============================================================
drop policy if exists "uliger_storage_read" on storage.objects;
drop policy if exists "uliger_storage_insert" on storage.objects;
drop policy if exists "uliger_storage_update" on storage.objects;
drop policy if exists "uliger_storage_delete" on storage.objects;
create policy "uliger_storage_read" on storage.objects for select
  using (bucket_id in ('avatars','works','chat','commissions'));
create policy "uliger_storage_insert" on storage.objects for insert
  with check (bucket_id in ('avatars','works','chat','commissions') and auth.uid() is not null);
create policy "uliger_storage_update" on storage.objects for update
  using (bucket_id in ('avatars','works','chat','commissions') and auth.uid() is not null);
create policy "uliger_storage_delete" on storage.objects for delete
  using (bucket_id in ('avatars','works','chat','commissions') and auth.uid() is not null);

-- ============================================================
--  Done. Verify in: Database → Tables → (each) → RLS enabled,
--  and Authentication → Policies.
-- ============================================================
