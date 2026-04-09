-- ══════════════════════════════════════════
-- TOONO — Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ══════════════════════════════════════════

-- 1. PROFILES (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null default '',
  field text default '',
  bio text default '',
  tags text[] default '{}',
  photo text default null,
  role text not null default 'buyer' check (role in ('creator','buyer')),
  comm_open boolean default false,
  followers_count int default 0,
  following_count int default 0,
  rating numeric(2,1) default 0,
  response_rate int default 100,
  on_time_rate int default 100,
  total_orders int default 0,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
begin
  user_role := coalesce(new.raw_user_meta_data->>'role', 'buyer');
  insert into public.profiles (id, name, role, comm_open)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    user_role,
    (user_role = 'creator')
  )
  on conflict (id) do update set
    name = excluded.name,
    role = excluded.role,
    comm_open = excluded.comm_open;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. WORKS (products/artworks)
create table public.works (
  id bigint generated always as identity primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text default '',
  category text default '',
  price int default 0,
  material text default '',
  medium text default '',
  dimensions text default '',
  tags text[] default '{}',
  sizes text[] default '{}',
  colors text[] default '{}',
  images text[] default '{}',
  video text default null,
  digital boolean default false,
  stock int default 1,
  badge text default null,
  status text default 'published' check (status in ('draft','published','archived')),
  accent text default '#5B8FE8',
  likes_count int default 0,
  views_count int default 0,
  sales_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. ORDERS
create table public.orders (
  id bigint generated always as identity primary key,
  buyer_id uuid references public.profiles(id) not null,
  seller_id uuid references public.profiles(id) not null,
  items jsonb not null default '[]',
  total_price int not null default 0,
  shipping_fee int default 0,
  status text default 'pending' check (status in ('pending','confirmed','making','shipped','delivered','done','cancelled','disputed')),
  payment_method text default 'card',
  address jsonb default '{}',
  tracking_number text default null,
  note text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. COMMISSIONS (custom orders)
create table public.commissions (
  id bigint generated always as identity primary key,
  buyer_id uuid references public.profiles(id) not null,
  seller_id uuid references public.profiles(id) not null,
  type text default '',
  budget text default '',
  delivery_date text default '',
  description text default '',
  attachments text[] default '{}',
  status text default 'pending' check (status in ('pending','accepted','ongoing','delivered','done','rejected','cancelled')),
  step int default 0,
  created_at timestamptz default now()
);

-- 5. CONVERSATIONS & MESSAGES
create table public.conversations (
  id bigint generated always as identity primary key,
  user_a uuid references public.profiles(id) not null,
  user_b uuid references public.profiles(id) not null,
  last_message text default '',
  last_at timestamptz default now(),
  unread_a int default 0,
  unread_b int default 0
);

create table public.messages (
  id bigint generated always as identity primary key,
  conversation_id bigint references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  text text default '',
  image text default null,
  read boolean default false,
  created_at timestamptz default now()
);

-- 6. NOTIFICATIONS
create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  icon text default 'info',
  title text not null,
  description text default '',
  link text default '',
  read boolean default false,
  created_at timestamptz default now()
);

-- 7. REVIEWS
create table public.reviews (
  id bigint generated always as identity primary key,
  order_id bigint references public.orders(id),
  reviewer_id uuid references public.profiles(id) not null,
  seller_id uuid references public.profiles(id) not null,
  work_id bigint references public.works(id),
  rating int not null check (rating between 1 and 5),
  text text default '',
  created_at timestamptz default now()
);

-- 8. LIKES & SAVES & FOLLOWS
create table public.likes (
  user_id uuid references public.profiles(id) on delete cascade,
  work_id bigint references public.works(id) on delete cascade,
  primary key (user_id, work_id)
);

create table public.saves (
  user_id uuid references public.profiles(id) on delete cascade,
  work_id bigint references public.works(id) on delete cascade,
  primary key (user_id, work_id)
);

create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  primary key (follower_id, following_id)
);

-- 8b. COMMENTS
create table public.comments (
  id bigint generated always as identity primary key,
  work_id bigint references public.works(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);
alter table public.comments enable row level security;
create policy "Comments visible" on public.comments for select using (true);
create policy "Own comments" on public.comments for insert with check (user_id = auth.uid());
create policy "Delete own comments" on public.comments for delete using (user_id = auth.uid());

-- 9. OFFERS (price negotiation)
create table public.offers (
  id bigint generated always as identity primary key,
  buyer_id uuid references public.profiles(id) not null,
  work_id bigint references public.works(id) not null,
  price int not null,
  message text default '',
  status text default 'pending' check (status in ('pending','accepted','rejected','expired')),
  created_at timestamptz default now()
);

-- 10. CART (server-side persistence)
create table public.cart_items (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  work_id bigint references public.works(id) on delete cascade not null,
  size text default null,
  color text default null,
  quantity int default 1,
  created_at timestamptz default now(),
  unique(user_id, work_id)
);

-- ══════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ══════════════════════════════════════

alter table public.profiles enable row level security;
alter table public.works enable row level security;
alter table public.orders enable row level security;
alter table public.commissions enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reviews enable row level security;
alter table public.likes enable row level security;
alter table public.saves enable row level security;
alter table public.follows enable row level security;
alter table public.offers enable row level security;
alter table public.cart_items enable row level security;

-- Profiles: anyone can read, owner can insert/update
create policy "Profiles visible to all" on public.profiles for select using (true);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Works: published visible to all, creators manage own
create policy "Published works visible" on public.works for select using (status = 'published' or creator_id = auth.uid());
create policy "Creators insert works" on public.works for insert with check (creator_id = auth.uid());
create policy "Creators update works" on public.works for update using (creator_id = auth.uid());
create policy "Creators delete works" on public.works for delete using (creator_id = auth.uid());

-- Orders: buyer and seller can see their orders
create policy "Order participants" on public.orders for select using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "Buyers create orders" on public.orders for insert with check (buyer_id = auth.uid());
create policy "Participants update orders" on public.orders for update using (buyer_id = auth.uid() or seller_id = auth.uid());

-- Commissions
create policy "Commission participants" on public.commissions for select using (buyer_id = auth.uid() or seller_id = auth.uid());
create policy "Buyers create commissions" on public.commissions for insert with check (buyer_id = auth.uid());
create policy "Participants update commissions" on public.commissions for update using (buyer_id = auth.uid() or seller_id = auth.uid());

-- Notifications: only own
create policy "Own notifications" on public.notifications for all using (user_id = auth.uid());

-- Messages: conversation participants
create policy "Message participants" on public.messages for select using (
  conversation_id in (select id from public.conversations where user_a = auth.uid() or user_b = auth.uid())
);
create policy "Send messages" on public.messages for insert with check (sender_id = auth.uid());

-- Conversations
create policy "Conversation participants" on public.conversations for select using (user_a = auth.uid() or user_b = auth.uid());
create policy "Create conversations" on public.conversations for insert with check (user_a = auth.uid() or user_b = auth.uid());
create policy "Update conversations" on public.conversations for update using (user_a = auth.uid() or user_b = auth.uid());

-- Reviews: anyone reads, verified buyers write
create policy "Reviews visible" on public.reviews for select using (true);
create policy "Buyers write reviews" on public.reviews for insert with check (reviewer_id = auth.uid());

-- Likes/Saves/Follows: own
create policy "Own likes" on public.likes for all using (user_id = auth.uid());
create policy "Own saves" on public.saves for all using (user_id = auth.uid());
create policy "Own follows" on public.follows for all using (follower_id = auth.uid());

-- Offers
create policy "Offer participants" on public.offers for select using (buyer_id = auth.uid() or work_id in (select id from public.works where creator_id = auth.uid()));
create policy "Buyers create offers" on public.offers for insert with check (buyer_id = auth.uid());

-- Cart: own only
create policy "Own cart" on public.cart_items for all using (user_id = auth.uid());

-- ══════════════════════════════════════
-- RPC FUNCTIONS
-- ══════════════════════════════════════
create or replace function public.increment_likes(wid bigint)
returns void as $$
begin
  update public.works set likes_count = likes_count + 1 where id = wid;
end;
$$ language plpgsql security definer;

create or replace function public.decrement_likes(wid bigint)
returns void as $$
begin
  update public.works set likes_count = greatest(0, likes_count - 1) where id = wid;
end;
$$ language plpgsql security definer;

-- ══════════════════════════════════════
-- MIGRATIONS (run if tables already exist)
-- ══════════════════════════════════════
-- alter table public.works add column if not exists duration text default '';

-- ══════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════
create index idx_works_creator on public.works(creator_id);
create index idx_works_category on public.works(category);
create index idx_works_status on public.works(status);
create index idx_works_material on public.works(material);
create index idx_orders_buyer on public.orders(buyer_id);
create index idx_orders_seller on public.orders(seller_id);
create index idx_notifications_user on public.notifications(user_id);
create index idx_messages_conversation on public.messages(conversation_id);

-- ══════════════════════════════════════
-- REALTIME (enable for live updates)
-- ══════════════════════════════════════
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.orders;

-- ══════════════════════════════════════
-- STORAGE BUCKETS (run in Supabase dashboard)
-- ══════════════════════════════════════
-- Create bucket: "avatars" (public)
-- Create bucket: "works" (public) 
-- Create bucket: "attachments" (private)
