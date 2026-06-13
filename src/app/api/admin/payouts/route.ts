/**
 * GET /api/admin/payouts — 정산 대기/실패 큐
 * PAYOUT_MODE=MANUAL 일 때 PENDING 정산을 관리자가 수동으로 승인,
 * FAILED 정산(Khan Bank API 실패)을 재시도할 수 있도록 목록 제공.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/payments/prisma";
import { isAdminRequest } from "@/lib/payments/adminAuth";

export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const payouts = await prisma.payPayout.findMany({
    where: { status: { in: ["PENDING", "FAILED"] } },
    orderBy: { requestedAt: "asc" },
  });
  return NextResponse.json({ data: payouts });
}
