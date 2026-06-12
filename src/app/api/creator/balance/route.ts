/**
 * GET /api/creator/balance?creatorId=xxx
 * 창작자 미지급 잔액(CREATOR_PAYABLE) + 정산 내역
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/payments/prisma";
import { getPayableBalance } from "@/lib/payments/settlement";

export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  if (!creatorId) return NextResponse.json({ error: "creatorId required" }, { status: 400 });

  const [balance, history] = await Promise.all([
    getPayableBalance(creatorId).catch(() => 0),
    prisma.payPayout.findMany({
      where: { creatorId },
      orderBy: { requestedAt: "desc" },
      take: 20,
    }).catch(() => []),
  ]);

  const orders = await prisma.payOrder.findMany({
    where: { creatorId, status: "PAID" },
    include: { payment: { select: { paidAt: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  }).catch(() => []);

  return NextResponse.json({ data: { balance, payouts: history, recentOrders: orders } });
}
