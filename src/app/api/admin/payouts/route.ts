/**
 * GET /api/admin/payouts — MANUAL 모드 정산 대기 큐
 * PAYOUT_MODE=MANUAL 일 때 관리자가 수동으로 지급 승인
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/payments/prisma";

function isAdmin(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${process.env.CRON_SECRET}` ||
         auth === `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const payouts = await prisma.payPayout.findMany({
    where: { status: { in: ["PENDING", "FAILED"] } },
    orderBy: { requestedAt: "asc" },
  });
  return NextResponse.json({ data: payouts });
}
