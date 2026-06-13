/**
 * 정산 로직 — Uliger World
 *
 * 판매 시 복식 원장:
 *   PLATFORM_CASH    DEBIT  전체 금액  (QPay 입금)
 *   CREATOR_PAYABLE  CREDIT 창작자 몫  (지급 의무)
 *   PLATFORM_REVENUE CREDIT 수수료    (플랫폼 수익)
 *
 * 정산 배치: CREATOR_PAYABLE 잔액 → Khan Bank 이체 → PayPayout 기록
 */
import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/payments/prisma";
import { transferToBank } from "@/lib/payments/khanbank";

type Tx = Prisma.TransactionClient | PrismaClient;

export async function recordSaleLedger(tx: Tx, orderId: string) {
  const order = await (tx as any).payOrder.findUniqueOrThrow({
    where: { id: orderId },
    include: { creator: true },
  });

  const gross = new Prisma.Decimal(order.amount);
  const fee = gross.mul(order.creator.commissionBps).div(10000).toDecimalPlaces(2);
  const creatorShare = gross.minus(fee);

  await (tx as any).payLedgerEntry.createMany({
    data: [
      { orderId, account: "PLATFORM_CASH", direction: "DEBIT", amount: gross, memo: "QPay 결제 수령" },
      { orderId, account: "CREATOR_PAYABLE", direction: "CREDIT", amount: creatorShare, memo: `창작자 몫 (${order.creator.name})` },
      { orderId, account: "PLATFORM_REVENUE", direction: "CREDIT", amount: fee, memo: `수수료 ${order.creator.commissionBps / 100}%` },
    ],
  });
}

export async function getPayableBalance(creatorId: string): Promise<Prisma.Decimal> {
  const credits = await prisma.payLedgerEntry.aggregate({
    _sum: { amount: true },
    where: { account: "CREATOR_PAYABLE", direction: "CREDIT", order: { creatorId } },
  });
  const debits = await prisma.payLedgerEntry.aggregate({
    _sum: { amount: true },
    where: { account: "CREATOR_PAYABLE", direction: "DEBIT", payout: { creatorId } },
  });
  return new Prisma.Decimal(credits._sum.amount ?? 0).minus(debits._sum.amount ?? 0);
}

const MIN_PAYOUT = new Prisma.Decimal(10_000);

// khanbank.ts의 MODE와 동일한 기준. MANUAL이면 이체를 시도하지 않고
// PayPayout을 PENDING으로 큐잉해 관리자 승인(/api/admin/payouts/[id]/approve)을 기다린다.
const PAYOUT_MODE = process.env.PAYOUT_MODE ?? "MANUAL";

export async function runPayout(creatorId: string) {
  const creator = await prisma.payCreator.findUniqueOrThrow({ where: { id: creatorId } });
  if (!creator.bankCode || !creator.bankAccountNo) {
    throw new Error(`창작자 ${creator.name}: 정산 계좌 미등록`);
  }

  const balance = await getPayableBalance(creatorId);
  if (balance.lessThan(MIN_PAYOUT)) return null;

  // MANUAL 모드: 이체 없이 PENDING으로 큐잉. 원장에는 DEBIT을 즉시 기록해
  // 동일 잔액이 중복으로 큐잉되는 것을 방지한다. 관리자가 승인하면
  // /api/admin/payouts/[id]/approve 가 이 payout을 COMPLETED로 전환한다.
  if (PAYOUT_MODE === "MANUAL") {
    return prisma.$transaction(async (tx) => {
      const p = await tx.payPayout.create({
        data: {
          creatorId,
          amount: balance,
          bankCode: creator.bankCode!,
          bankAccountNo: creator.bankAccountNo!,
          status: "PENDING",
        },
      });
      await tx.payLedgerEntry.create({
        data: {
          payoutId: p.id,
          account: "CREATOR_PAYABLE",
          direction: "DEBIT",
          amount: balance,
          memo: `정산 대기 (관리자 승인 필요) ${p.id}`,
        },
      });
      return p;
    });
  }

  const payout = await prisma.$transaction(async (tx) => {
    const p = await tx.payPayout.create({
      data: {
        creatorId,
        amount: balance,
        bankCode: creator.bankCode!,
        bankAccountNo: creator.bankAccountNo!,
        status: "PROCESSING",
      },
    });
    await tx.payLedgerEntry.create({
      data: {
        payoutId: p.id,
        account: "CREATOR_PAYABLE",
        direction: "DEBIT",
        amount: balance,
        memo: `정산 지급 ${p.id}`,
      },
    });
    return p;
  });

  try {
    const ref = await transferToBank({
      bankCode: creator.bankCode,
      accountNo: creator.bankAccountNo,
      accountName: creator.bankAccountName ?? creator.name,
      amount: Number(balance),
      description: `Uliger World payout ${payout.id.slice(0, 8)}`,
    });
    await prisma.payPayout.update({
      where: { id: payout.id },
      data: { status: "COMPLETED", bankRef: ref, completedAt: new Date() },
    });
  } catch (e) {
    await prisma.$transaction(async (tx) => {
      await tx.payPayout.update({ where: { id: payout.id }, data: { status: "FAILED" } });
      await tx.payLedgerEntry.create({
        data: {
          payoutId: payout.id,
          account: "CREATOR_PAYABLE",
          direction: "CREDIT",
          amount: balance,
          memo: `정산 실패 롤백 ${payout.id}`,
        },
      });
    });
    throw e;
  }
  return payout;
}

/**
 * 관리자가 PENDING(MANUAL 큐) 정산을 "지급 완료"로 확정.
 * 실제 이체는 관리자가 은행 앱/창구에서 수동으로 수행한 뒤 호출한다.
 * 원장 DEBIT은 runPayout()에서 큐잉 시점에 이미 기록되어 있으므로 여기서는
 * 상태와 bankRef/completedAt만 갱신한다.
 */
export async function approvePendingPayout(payoutId: string) {
  const payout = await prisma.payPayout.findUniqueOrThrow({ where: { id: payoutId } });
  if (payout.status !== "PENDING") {
    throw new Error(`이미 처리된 정산 (status=${payout.status})`);
  }
  return prisma.payPayout.update({
    where: { id: payoutId },
    data: { status: "COMPLETED", bankRef: `MANUAL-${Date.now()}`, completedAt: new Date() },
  });
}

/**
 * FAILED 상태의 정산을 재시도. 성공 시 COMPLETED, 실패 시 FAILED 유지(원장은 그대로 — 이미 롤백됨).
 * 잔액은 runPayout 시점의 amount/계좌 정보를 그대로 사용 (재계산하지 않음).
 */
export async function retryFailedPayout(payoutId: string) {
  const payout = await prisma.payPayout.findUniqueOrThrow({ where: { id: payoutId }, include: { creator: true } });
  if (payout.status !== "FAILED") {
    throw new Error(`재시도 불가 (status=${payout.status})`);
  }

  // 재시도는 새 원장 DEBIT을 다시 잡아야 함 (실패 시 CREDIT으로 롤백되어 있었음)
  await prisma.$transaction(async (tx) => {
    await tx.payPayout.update({ where: { id: payoutId }, data: { status: "PROCESSING" } });
    await tx.payLedgerEntry.create({
      data: {
        payoutId,
        account: "CREATOR_PAYABLE",
        direction: "DEBIT",
        amount: payout.amount,
        memo: `정산 재시도 ${payoutId}`,
      },
    });
  });

  try {
    const ref = await transferToBank({
      bankCode: payout.bankCode,
      accountNo: payout.bankAccountNo,
      accountName: payout.creator.bankAccountName ?? payout.creator.name,
      amount: Number(payout.amount),
      description: `Uliger World payout retry ${payoutId.slice(0, 8)}`,
    });
    return prisma.payPayout.update({
      where: { id: payoutId },
      data: { status: "COMPLETED", bankRef: ref, completedAt: new Date() },
    });
  } catch (e) {
    await prisma.$transaction(async (tx) => {
      await tx.payPayout.update({ where: { id: payoutId }, data: { status: "FAILED" } });
      await tx.payLedgerEntry.create({
        data: {
          payoutId,
          account: "CREATOR_PAYABLE",
          direction: "CREDIT",
          amount: payout.amount,
          memo: `정산 재시도 실패 롤백 ${payoutId}`,
        },
      });
    });
    throw e;
  }
}

export async function runAllPayouts() {
  const creators = await prisma.payCreator.findMany({
    where: { bankAccountNo: { not: null } },
  });
  const results = [];
  for (const c of creators) {
    try {
      const p = await runPayout(c.id);
      if (p) results.push({ creatorId: c.id, payoutId: p.id, amount: p.amount });
    } catch (e: any) {
      console.error(JSON.stringify({ event: "payout_failed", creatorId: c.id, error: e.message }));
    }
  }
  return results;
}
