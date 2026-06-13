# The TOONO — 결제·주문·정산·관리자 시스템 감사 리포트

**작성일**: 2026-06-13
**범위**: QPay/Khan Bank 결제 모듈, 주문/에스크로 흐름, 정산(Payout) 흐름, 관리자 패널, 분쟁(Dispute) 처리

---

## 1. 이번 감사에서 수정 완료한 항목

### 1.1 수수료율 불일치 (8% → 10%)
- **파일**: `src/screens/Checkout.jsx`, `src/screens/OrderDetail.jsx`
- **문제**: `Checkout.jsx`는 결제 시 플랫폼 수수료를 8%로 계산해 표시했지만, 실제 정산 로직(`commissionBps` 기본값, `settlement.ts`)은 10% 기준이었음. `OrderDetail.jsx`의 주문 상세 화면도 동일하게 8%로 표시되어 있어 결제 시점과 주문 상세 화면에서 창작자에게 보이는 정산 예상액이 서로 달랐음.
- **수정**: 두 곳 모두 `* 0.10`으로 통일하고, `OrderDetail.jsx`에는 `Checkout.jsx`의 `PLATFORM_FEE_RATE`와 일치시킨다는 주석을 추가.
- **남은 작업**: 이 비율은 현재 프런트엔드 두 곳에 하드코딩되어 있음. 추후 `commissionBps`를 서버(Prisma `PayCreator` 또는 설정 테이블)에서 가져와 단일 소스로 관리하는 것을 권장 (창작자별 차등 수수료를 도입할 경우 더욱 중요).

### 1.2 `useOrderStatus` Realtime 테이블명 오류
- **파일**: `src/hooks/useOrderStatus.ts` (추정 경로)
- **문제**: Supabase Realtime `postgres_changes` 구독 대상이 `orders` 테이블로 되어 있었으나, 실제 결제 상태 변경은 Prisma `pay_orders` 테이블에서 발생함 (`supabase_realtime` publication에도 `pay_orders`가 등록되어 있음). 따라서 결제 상태가 변경되어도 클라이언트가 실시간으로 갱신되지 않았음.
- **수정**: 구독 테이블을 `pay_orders`로 변경.

### 1.3 QPay 웹훅의 죽은 코드 제거
- **파일**: QPay webhook 라우트
- **문제**: 웹훅 핸들러 내부에 Supabase `orders` 테이블을 업데이트하는 코드가 남아있었으나, 이 경로는 실제로 Prisma `pay_orders`/`pay_payments`만 갱신하면 되는 구조로 변경된 후에도 정리되지 않아 도달 불가능하거나 잘못된 테이블을 갱신하는 죽은 코드였음.
- **수정**: 해당 코드 제거, Prisma 갱신 로직만 유지.

### 1.4 정산(Payout) PENDING/승인 흐름 재설계
- **파일**: `src/lib/payments/settlement.ts`, `src/app/api/admin/payouts/route.ts`, `src/app/api/admin/payouts/[id]/approve/route.ts`
- **문제**:
  1. `PAYOUT_MODE=MANUAL`(기본값)일 때도 `runPayout()`이 실제 이체 없이 `bankRef: "MANUAL-${Date.now()}"`라는 가짜 참조값으로 `COMPLETED` 처리를 해버려, "정산 완료"로 표시되지만 실제로는 창작자에게 돈이 나가지 않는 상태가 발생할 수 있었음.
  2. 관리자 승인 API(`/api/admin/payouts/[id]/approve`)가 URL의 `:id`를 사용하지 않고 `runPayout(payout.creatorId)`를 재호출 — 즉 "이 특정 정산 건"이 아니라 "이 창작자의 현재 잔액"으로 새 정산을 만드는 구조였음. 이미 큐잉되어 잔액이 0이 된 상태에서는 `null`을 반환해 버튼을 눌러도 아무 일도 일어나지 않았음.
- **수정**:
  - `runPayout()`: `PAYOUT_MODE=MANUAL`이면 `PayPayout`을 `status: "PENDING"`으로 생성하고 원장(`PayLedgerEntry`)에 `CREATOR_PAYABLE` 계정 `DEBIT`을 즉시 기록 (잔액 중복 큐잉 방지). 실제 이체는 하지 않음.
  - 신규 `approvePendingPayout(payoutId)`: `PENDING` → 관리자가 은행 앱에서 수동 이체를 마쳤음을 확인하는 용도. 해당 `payoutId`만 `COMPLETED`로 전환 (`bankRef: MANUAL-...`, `completedAt`).
  - 신규 `retryFailedPayout(payoutId)`: `FAILED`(Khan Bank API 이체 실패) 상태의 특정 건을 재시도. 원장 `DEBIT` 재기록 → `transferToBank()` 시도 → 성공 시 `COMPLETED`, 실패 시 다시 `FAILED` + 원장 `CREDIT` 롤백.
  - `/api/admin/payouts`: `PENDING`/`FAILED` 상태의 정산을 `requestedAt` 오름차순으로 목록 반환.
  - `/api/admin/payouts/[id]/approve`: `:id`의 현재 상태에 따라 `approvePendingPayout` 또는 `retryFailedPayout`을 호출하고, 그 외 상태는 400 에러.

### 1.5 관리자 API 인증 — `NEXT_PUBLIC_ADMIN_SECRET` 제거
- **파일 (신규)**: `src/lib/payments/adminAuth.ts`
- **문제**: 관리자 API가 `NEXT_PUBLIC_ADMIN_SECRET` 환경변수를 Bearer 토큰과 단순 비교했음. `NEXT_PUBLIC_` 접두어 환경변수는 Next.js가 **클라이언트 빌드 결과물에 그대로 인라인**하므로, 누구나 브라우저 devtools나 빌드된 JS 소스에서 이 "시크릿" 값을 읽어낼 수 있었음. 즉, 이 인증은 사실상 아무런 보호 기능이 없었음.
- **수정**: `isAdminRequest(req)` 헬퍼 신설.
  - 클라이언트는 로그인한 Supabase 세션의 `access_token`을 `Authorization: Bearer <token>`으로 전송.
  - 서버는 `SUPABASE_SERVICE_ROLE_KEY`(서버 전용, 클라이언트에 노출 안 됨)로 토큰의 사용자를 조회 → `profiles.role === 'admin'`인지 확인.
  - `CRON_SECRET`(서버 전용 env, `NEXT_PUBLIC_` 아님)은 Vercel Cron 같은 비-브라우저 호출을 위해 별도 경로로 유지.
  - `/api/admin/payouts*` 라우트에 적용 완료.
- **남은 작업**: 다른 `/api/admin/*` 라우트들도 동일한 패턴(`NEXT_PUBLIC_ADMIN_SECRET` 또는 인증 누락)을 쓰고 있는지 전체 점검 권장. (이번 감사에서는 payouts 관련 라우트만 확인/수정함.)

### 1.6 AdminPanel `PayoutsTab` 필드 매핑 및 UI
- **파일**: `src/screens/AdminPanel.jsx`
- **문제**: Prisma는 camelCase(`creatorId`, `bankCode`, `bankAccountNo`)를 반환하지만 UI는 snake_case(`creator_id`, `bank_code`, `bank_account_no`)를 참조해 항상 `undefined`가 표시되었음. 또한 `FAILED` 상태에 대한 처리/버튼이 없었고, 새 인증 방식(1.5)에 맞는 토큰 전송 로직도 없었음.
- **수정**:
  - 필드명을 camelCase로 수정.
  - `DB.getSession()`을 통해 Supabase access token을 매 요청마다 `Authorization` 헤더에 첨부.
  - `PENDING` 건에는 "지급 승인 (이체 완료)" 버튼, `FAILED` 건에는 "이체 재시도" 버튼을 분리 표시.
  - `STATUS_COLOR`/`StatusPill`에 `processing`/`completed`/`failed` 라벨·색상 추가 (Mono Clean 색상 체계 `T.yellow`/`T.green`/`T.red` 사용, 새 색상 추가 없음).

---

## 2. 구조적 문제 — "이중 주문/정산 시스템"

현재 코드베이스에는 **서로 동기화되지 않는 두 개의 주문·정산 체계**가 공존합니다.

| | Prisma `pay_*` (실제 자금/원장) | Supabase `orders` + `GS.orders` (UX/에스크로/분쟁) |
|---|---|---|
| 생성 시점 | QPay 결제 완료 시 (`PayOrder`, `PayPayment`) | 모든 결제수단 (`Checkout.jsx` → `DB.createOrder` / `GS.orders`) |
| 상태 추적 | `PayLedgerEntry` 이중부기 원장, `PayPayout` | `status`, `escrow_status`, `payout_status` 컬럼 |
| 정산 | `runPayout`/`approvePendingPayout`/`retryFailedPayout` | 없음 (UI 상의 `payout_status` 텍스트만 변경) |
| 화면 | AdminPanel `PayoutsTab` | `OrderDetail.jsx`, `DisputeCenter.jsx` |

**문제점**:
1. **QPay가 아닌 결제수단**(예: 계좌이체/현금 등 `payment_method` 다른 값)으로 결제된 주문은 Prisma `pay_*`에 전혀 기록되지 않습니다. → "TOONO 보호"(에스크로) 마케팅 문구가 있지만, 이 결제수단들은 실제 원장/정산 파이프라인과 무관하게 동작합니다.
2. `OrderDetail.jsx`의 "수취 확인" 버튼은 Supabase `orders.escrow_status = 'released'`, `payout_status = 'scheduled'`로만 바꾸고 `DB.updateOrder()`를 호출합니다. 이는 Prisma 원장에 **아무 영향이 없습니다** — 즉 구매자가 "수취 확인"을 눌러도 실제 정산 가능 잔액(`getPayableBalance`)은 증가하지 않습니다.
3. 반대로, Prisma 쪽에서 `runPayout()`이 잔액을 정산 대상으로 잡는 기준(`PayLedgerEntry`)은 QPay 웹훅이 결제 완료를 기록한 시점부터이며, 에스크로 보호 기간(`protection_until`, 7일)이나 분쟁 상태와 무관하게 동작합니다. → 분쟁 중인 주문의 대금이 먼저 정산되어 버릴 수 있는 경합 조건이 존재합니다.

**권장 통합 방향 (단계적)**:

1. **단기 (Quick win)**: QPay 웹훅에서 `PayOrder`/`PayPayment` 레코드 생성 시, 대응하는 Supabase `orders.id`를 함께 저장할 수 있는 컬럼(`pay_order_id` 등)을 추가하여 두 레코드를 연결합니다. 현재는 `creatorId`(=`profiles.id`)만 공유되고 주문 단위 연결이 없습니다.
2. **중기**: `runPayout()`이 잔액을 계산할 때, 연결된 Supabase `orders.escrow_status`가 `'released'`인 항목만 정산 대상 원장 엔트리로 포함하도록 필터링 — 즉 "수취 확인" 또는 "7일 자동 확인"이 끝나야 해당 금액이 `getPayableBalance()`에 포함되게 합니다.
3. **장기**: 비-QPay 결제수단을 단계적으로 제거하거나, 모든 결제수단이 동일하게 Prisma 원장에 기록되도록 통합 결제 어댑터를 도입합니다.

---

## 3. 7일 에스크로 자동 확인 — 집행 메커니즘 부재

- **현황**: `OrderDetail.jsx`에는 `order.escrowAutoConfirmAt`을 기준으로 한 카운트다운 UI가 존재하지만, 이 시각이 지났을 때 실제로 `escrow_status`를 `'released'`로 바꾸고 정산을 트리거하는 서버 측 로직(cron 등)이 없습니다.
- **위험**: 구매자가 "수취 확인"을 누르지 않고 방치하면, UI상으로는 "7일 후 자동 정산"이라고 안내하지만 실제로는 영구히 `escrow_status: 'held'`, `payout_status: 'pending'`에 머무릅니다.
- **제안**:
  - Vercel Cron(`CRON_SECRET` 인증, 이미 `adminAuth.ts`에 경로 마련됨) → `/api/cron/release-escrow` 신규 라우트.
  - `protection_until <= now()` AND `escrow_status = 'held'` AND `status NOT IN ('disputed','cancelled')`인 Supabase `orders`를 조회 → `escrow_status='released'`, `payout_status='scheduled'`로 갱신.
  - (2번 항목의 연결 컬럼이 추가되면) 동시에 해당 주문에 연결된 Prisma 원장 엔트리를 "정산 가능"으로 표시.

---

## 4. 분쟁(Dispute) 기능 — 엔드투엔드 단절 (★ 가장 시급)

이번 감사에서 발견한 가장 심각한 **기능 미완성** 항목입니다. 현재 분쟁 신고 기능은 **사용자에게는 "제출됨"으로 보이지만 관리자에게는 절대 도달하지 않습니다.**

### 4.1 현재 동작
- `DisputeCenter.jsx`의 `submitDispute()`는 분쟁 객체를 만들어 `GS.disputes`(로컬 상태, `localStorage`에 `saveGS()`로 저장)에만 추가합니다.
- `AdminPanel.jsx`의 `DisputesTab`은 `DB.adminGetDisputes()`를 호출하며, 이는 **Supabase `disputes` 테이블**을 조회합니다 (`*, profiles!reporter_id(name,photo), orders!order_id(total_price,status)` join).
- **그런데 `disputes` 테이블은 저장소의 어떤 SQL 마이그레이션 파일에도 정의되어 있지 않습니다** (`supabase-schema.sql`, `supabase-admin-migration.sql`, `supabase-rls.sql`, `supabase-payments-schema.sql` 전체 검색 결과 없음).

결과적으로:
- 사용자가 분쟁을 제출 → 자기 브라우저의 `localStorage`에만 저장됨 (다른 기기/브라우저에서는 보이지 않음, 관리자도 볼 수 없음).
- 관리자 패널은 존재하지 않을 가능성이 높은 테이블을 조회 → 빈 목록 또는 쿼리 에러.
- `DB.adminResolveDispute()`로 "해결" 처리를 해도 사용자 쪽 `GS.disputes`에는 반영되지 않음 (역방향 연결도 없음).

### 4.2 제안하는 수정 (적용 전 검토 필요)

아래는 `supabase-rls.sql`의 `reports` 테이블 패턴(`do $ ... if to_regclass(...) is not null ... end $;`)을 그대로 따르는 **idempotent 마이그레이션 초안**입니다. `orders.id`가 `bigint`이므로 `order_id`도 `bigint`로 맞췄습니다.

```sql
-- supabase-disputes-migration.sql (신규 파일 제안)

create table if not exists public.disputes (
  id bigint generated always as identity primary key,
  order_id bigint references public.orders(id) on delete set null,
  reporter_id uuid references public.profiles(id) not null,
  type text not null,                 -- 예: 'not_received', 'not_as_described', 'damaged', 'other'
  type_label text,                    -- DisputeCenter.jsx의 typeLabel (한글/몽골어 표시용)
  details text default '',
  amount int default 0,               -- 제출 시점의 order.price 스냅샷 (주문 금액 변경/삭제에 안전)
  status text default 'pending' check (status in ('pending','resolved','rejected')),
  admin_note text default '',
  created_at timestamptz default now(),
  resolved_at timestamptz
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

    -- 관리자 전체 조회/수정은 DB.adminGetDisputes()/adminResolveDispute()가
    -- service role 키를 사용하는 서버 라우트를 통해서만 호출된다는 가정하에
    -- 별도의 admin 정책은 생략 (service role은 RLS를 우회함).
  end if;
end $$;
```

`src/lib/supabase.js`에 추가할 메서드 (다른 메서드들과 동일하게 `isSupabaseReady()` 가드 포함):

```js
async createDispute({ orderId, type, typeLabel, details, amount }) {
  if (!isSupabaseReady()) return null;
  const user = await this.getCurrentUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("disputes")
    .insert({
      order_id: orderId ?? null,
      reporter_id: user.id,
      type,
      type_label: typeLabel,
      details,
      amount: amount ?? 0,
    })
    .select()
    .single();
  if (error) { console.error("createDispute error:", error); return null; }
  return data;
},
```

`DisputeCenter.jsx`의 `submitDispute()`에서 로컬 상태 갱신과 **병행하여** 서버에도 기록 (오프라인/Supabase 미구성 환경을 위해 로컬 저장은 유지):

```jsx
const dispute = { /* 기존과 동일 */ };
GS.disputes = [dispute, ...disputes];
GS.notifications.unshift({ /* 기존과 동일 */ });
saveGS();

// Supabase에도 기록 → 관리자 DisputesTab에서 조회 가능해짐
if (isSupabaseReady()) {
  DB.createDispute({
    orderId: order?.id,
    type,
    typeLabel: dispute.typeLabel,
    details,
    amount: dispute.amount,
  }).catch(() => {});
}
```

### 4.3 적용 전 확인이 필요한 사항
이 부분은 **제안 코드로만 작성**했고 직접 적용하지 않았습니다. 실제 적용 전에 다음을 확인해 주세요.

1. **실제 Supabase DB에 `disputes` 테이블이 이미 존재하는지** (대시보드에서 직접 확인). 만약 이미 존재한다면 위 `create table if not exists`는 무해하지만, 컬럼명/타입이 위 초안과 다를 경우 `DB.adminGetDisputes()`의 select 절(`profiles!reporter_id`, `orders!order_id`) 기준으로 실제 컬럼명을 맞춰야 합니다.
2. `order.id`가 항상 Supabase `orders.id`(bigint)와 일치하는 값인지 — `GS.orders`에 로컬 전용으로 생성된(Supabase에 동기화되지 않은) 주문이 있다면 `order_id` FK 제약이 insert를 막을 수 있습니다. 이 경우 FK를 두지 않거나 `on delete set null` + insert 시 try/catch로 방어해야 합니다 (위 `createDispute`는 이미 에러를 삼키도록 작성했습니다).
3. `auth.uid()` 기반 RLS를 쓰려면 `DisputeCenter.jsx` 호출 시점에 사용자가 로그인되어 있어야 합니다 (`DB.getCurrentUser()`가 `null`이면 `createDispute`가 조용히 `null`을 반환하도록 작성했습니다 — 이 경우 로컬에는 남지만 서버에는 기록되지 않으므로, 비로그인 분쟁 제출을 허용할지 정책 결정 필요).

---

## 5. 기능 완성도 피드백 (요청하신 부분)

### 5.1 QPay / Khan Bank 결제 모듈
- 클라이언트(`src/lib/payments/qpay/client.ts`), 웹훅, 이중부기 원장 구조는 골격이 잘 갖춰져 있습니다.
- **다음 단계 체크리스트**:
  - QPay 가맹점 계약상 환불(취소) API 연동 — 현재 `escrow_status='refunded'` 처리는 Supabase 컬럼만 바꾸고 실제 QPay 환불 API 호출이 없는 것으로 보임. 실제 환불 트랜잭션 연동 필요.
  - 전자세금계산서(ebarimt) 발급 연동 여부 확인 — 몽골 결제 서비스의 일반적 요구사항.
  - 웹훅 서명 검증(서명/HMAC 검증 로직이 있는지) — 외부에서 위조된 결제 완료 요청을 받아들이지 않도록 반드시 확인.

### 5.2 정산(Payout)
- `PENDING`/`FAILED` 큐와 관리자 승인/재시도 흐름은 이번 수정으로 동작 가능한 상태가 되었습니다.
- **다음 단계**:
  - `PAYOUT_MODE=KHAN_API`로 전환 시 `transferToBank()`의 실제 동작(타임아웃, 부분 실패, 중복 이체 방지를 위한 idempotency key)을 테스트 환경에서 검증 필요.
  - `MIN_PAYOUT = 10,000 MNT` 미만 잔액은 `runPayout()`이 `null`을 반환하고 아무것도 하지 않는데, 이 경우 창작자 UI에 "최소 정산 금액 미달"이라는 안내가 있는지 확인 필요 — 없다면 추가 권장.
  - 정산 내역(완료된 `PayPayout` 목록)을 창작자가 직접 조회할 수 있는 화면이 있는지 확인 — 없다면 신뢰도 측면에서 추가 권장.

### 5.3 보안
- `SUPABASE_SERVICE_ROLE_KEY`는 RLS를 완전히 우회하는 키입니다. `adminAuth.ts`처럼 서버 전용 코드(`route.ts`, API 라우트)에서만 사용되고 있는지 — 클라이언트 컴포넌트(`"use client"`)에서 `process.env.SUPABASE_SERVICE_ROLE_KEY`를 import하는 곳이 없는지 전체 검색 권장.
- `disputes` 테이블을 신설할 경우 RLS를 반드시 함께 적용 (4.2 초안 참고). RLS 없이 테이블만 만들면 `anon` 키로도 전체 분쟁 데이터를 읽을 수 있게 됩니다.
- 다른 `/api/admin/*` 라우트들의 인증 방식 전체 점검 (1.5에서 언급).

### 5.4 에스크로/분쟁 UX
- "TOONO 보호"라는 표현이 사용자에게 노출된다면, 현재 구조상 실제로 보호되는 결제수단/시나리오와 마케팅 문구가 일치하는지 점검 필요 (2번 항목 참고).
- 분쟁 제출 후 사용자가 "처리 중" 상태를 추적할 방법이 현재는 로컬 상태뿐입니다. 4번 항목 적용 후에는 관리자가 `admin_note`/`status`를 변경했을 때 사용자 쪽에도 알림(`GS.notifications`)이 가도록 — 예를 들어 분쟁 화면 진입 시 `DB.getMyDisputes()`로 서버 상태를 재조회해 로컬과 머지하는 로직을 추가하면 좋습니다.

---

## 6. 우선순위 제안

1. **(긴급)** §4 분쟁 기능 — 사용자 신뢰와 직결되는 기능이 완전히 끊겨 있음. Supabase `disputes` 테이블 실재 여부 확인 후 마이그레이션/연동 적용.
2. **(중요)** §5.1 QPay 환불 연동 + 웹훅 서명 검증 — 결제 보안/정확성 직결.
3. **(중요)** §2 이중 주문 시스템의 "수취 확인 → 정산 가능 잔액 연결" (단기안: 연결 컬럼 추가).
4. **(권장)** §3 에스크로 자동 확인 cron.
5. **(권장)** §5.2 정산 관련 창작자 대상 UX 보강, §5.3 보안 전체 점검.

---

## 7. 이번 세션에서 수정한 파일 목록

- `src/screens/Checkout.jsx` — 수수료율 10% 통일
- `src/screens/OrderDetail.jsx` — 수수료율 10% 통일 (표시값 일치)
- `src/hooks/useOrderStatus.ts` (또는 동등 파일) — Realtime 구독 테이블 `pay_orders`로 수정
- QPay webhook 라우트 — 죽은 Supabase `orders` 업데이트 코드 제거
- `src/lib/payments/settlement.ts` — `runPayout` MANUAL 큐잉, `approvePendingPayout`/`retryFailedPayout` 추가
- `src/lib/payments/adminAuth.ts` (신규) — Supabase 세션 + `profiles.role` 기반 관리자 인증
- `src/app/api/admin/payouts/route.ts` — 재작성
- `src/app/api/admin/payouts/[id]/approve/route.ts` — 재작성
- `src/screens/AdminPanel.jsx` — `PayoutsTab` 필드 매핑/인증/UI 수정, `StatusPill` 라벨 추가

§4(분쟁 기능)은 **설계/마이그레이션 초안만 제시**했으며, 실제 DB 스키마 확인 후 적용을 권장합니다.
