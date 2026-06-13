-- supabase-disputes-migration.sql
-- idempotent: can be run multiple times safely
--
-- orders.id is bigint (confirmed from supabase-schema.sql pattern).
-- reporter_id references auth / profiles.id (uuid).
-- RLS: users can insert their own disputes and read their own;
--      admin access is via service-role key (bypasses RLS).

create table if not exists public.disputes (
  id            bigint generated always as identity primary key,
  order_id      bigint references public.orders(id) on delete set null,
  reporter_id   uuid   references public.profiles(id) not null,
  type          text   not null,
  type_label    text,
  details       text   default '',
  amount        int    default 0,
  status        text   default 'pending'
                  check (status in ('pending', 'resolved', 'rejected')),
  admin_note    text   default '',
  created_at    timestamptz default now(),
  resolved_at   timestamptz
);

do $$ begin
  if to_regclass('public.disputes') is not null then

    alter table public.disputes enable row level security;

    drop policy if exists "disputes_insert" on public.disputes;
    create policy "disputes_insert" on public.disputes
      for insert with check (reporter_id = auth.uid());

    drop policy if exists "disputes_select_own" on public.disputes;
    create policy "disputes_select_own" on public.disputes
      for select using (reporter_id = auth.uid());

    -- Admin read/write goes through service-role key (RLS bypassed server-side).
    -- No separate admin policy needed.

  end if;
end $$;
