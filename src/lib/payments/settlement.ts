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

export async function runPayout(creatorId: string) {
  const creator = await prisma.payCreator.findUniqueOrThrow({ where: { id: creatorId } });
  if (!creator.bankCode || !creator.bankAccountNo) {
    throw new Error(`창작자 ${creator.name}: 정산 계좌 미등록`);
  }

  const balance = await getPayableBalance(creatorId);
  if (balance.lessThan(MIN_PAYOUT)) return null;

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
