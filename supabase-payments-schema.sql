-- Uliger World — 결제/정산 테이블 마이그레이션
-- Supabase SQL Editor에서 실행 (기존 테이블과 충돌 없음 — pay_ 접두어 사용)
-- Prisma migrate를 사용하는 경우 이 파일은 참고용으로만 사용

-- 결제 창작자 (Supabase profiles.id 와 동일한 UUID 공유)
create table if not exists pay_creators (
  id              uuid primary key,
  name            text not null,
  email           text not null unique,
  bank_code       text,          -- 예: '050000' Khan Bank
  bank_account_no text,
  bank_account_name text,
  commission_bps  int  not null default 1000,  -- 10% = 1000bps
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- 결제 주문
create table if not exists pay_orders (
  id           uuid primary key default gen_random_uuid(),
  creator_id   uuid not null references pay_creators(id),
  work_id      text,             -- Supabase works.id (선택적)
  buyer_email  text not null,
  buyer_name   text,
  item_title   text not null,
  amount       numeric(12,2) not null,
  currency     text not null default 'MNT',
  status       text not null default 'PENDING'
               check (status in ('PENDING','PAID','FULFILLED','REFUNDED','CANCELLED','EXPIRED')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists pay_orders_creator_status on pay_orders(creator_id, status);

-- 결제 정보 (QPay 인보이스)
create table if not exists pay_payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null unique references pay_orders(id),
  provider            text not null default 'QPAY',
  qpay_invoice_id     text unique,
  sender_invoice_no   text not null unique,
  qpay_payment_id     text,
  qr_text             text,
  qr_image            text,    -- base64
  short_url           text,
  deeplinks           jsonb,   -- 은행앱 딥링크 목록
  amount              numeric(12,2) not null,
  status              text not null default 'CREATED'
                      check (status in ('CREATED','PAID','FAILED','REFUNDED','EXPIRED')),
  paid_at             timestamptz,
  raw_check_response  jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 복식 원장
create table if not exists pay_ledger_entries (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid references pay_orders(id),
  payout_id  uuid,             -- pay_payouts.id (나중에 FK 추가)
  account    text not null
             check (account in ('PLATFORM_CASH','CREATOR_PAYABLE','PLATFORM_REVENUE')),
  direction  text not null check (direction in ('DEBIT','CREDIT')),
  amount     numeric(12,2) not null,
  memo       text,
  created_at timestamptz not null default now()
);
create index if not exists pay_ledger_account_created on pay_ledger_entries(account, created_at);

-- 정산 지급
create table if not exists pay_payouts (
  id              uuid primary key default gen_random_uuid(),
  creator_id      uuid not null references pay_creators(id),
  amount          numeric(12,2) not null,
  bank_code       text not null,
  bank_account_no text not null,
  status          text not null default 'PENDING'
                  check (status in ('PENDING','PROCESSING','COMPLETED','FAILED')),
  bank_ref        text,     -- Khan Bank 이체 참조번호
  requested_at    timestamptz not null default now(),
  completed_at    timestamptz
);
create index if not exists pay_payouts_creator_status on pay_payouts(creator_id, status);

-- payout_id FK (순환 참조 방지를 위해 테이블 생성 후 추가)
alter table pay_ledger_entries
  add constraint if not exists pay_ledger_payout_fk
  foreign key (payout_id) references pay_payouts(id);

-- updated_at 자동 갱신 트리거
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'pay_creators_updated_at') then
    create trigger pay_creators_updated_at before update on pay_creators for each row execute function update_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'pay_orders_updated_at') then
    create trigger pay_orders_updated_at before update on pay_orders for each row execute function update_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'pay_payments_updated_at') then
    create trigger pay_payments_updated_at before update on pay_payments for each row execute function update_updated_at();
  end if;
end $$;

-- Realtime: 결제 상태(PENDING→PAID) 변경을 프론트(useOrderStatus)가 즉시 수신하도록
-- pay_orders 테이블을 supabase_realtime publication에 추가.
-- (DATABASE_URL이 이 Supabase 프로젝트의 Postgres를 가리키는 경우에만 유효)
do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'pay_orders'
  ) then
    alter publication supabase_realtime add table pay_orders;
  end if;
end $$;

-- 참고: pay_orders는 RLS가 비활성 상태(create table 시 미설정)이므로
-- anon key로 구독해도 Realtime 이벤트가 전달됨. buyer_email/amount 등
-- 행 전체가 payload.new에 포함되니, 더 강한 격리가 필요해지면
-- RLS 활성화 + 적절한 SELECT 정책을 추가할 것.
