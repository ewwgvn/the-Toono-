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

alter table public.disputes enable row level security;

drop policy if exists "disputes_insert" on public.disputes;
create policy "disputes_insert" on public.disputes
  for insert with check (reporter_id = auth.uid());

drop policy if exists "disputes_select_own" on public.disputes;
create policy "disputes_select_own" on public.disputes
  for select using (reporter_id = auth.uid());
