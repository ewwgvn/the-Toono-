/**
 * POST /api/admin/payouts/[id]/approve — 정산 승인 / 재시도
 *
 * - status === "PENDING" (MANUAL 모드 큐잉): 관리자가 은행 앱에서 수동 이체를
 *   완료했다는 의미로, 해당 payout을 COMPLETED로 확정한다.
 * - status === "FAILED" (Khan Bank API 이체 실패): 동일 payout으로 이체를 재시도한다.
 * - 그 외 상태: 이미 처리됨 — 400.
 *
 * 이전 구현은 runPayout(payout.creatorId)를 다시 호출해 "이 creator의 현재
 * 잔액"으로 새 payout을 만들었음 — URL의 :id로 지정한 payout과 무관하게
 * 동작했고, 이미 큐잉으로 차감된 잔액이 0이면 null을 반환해 아무 일도
 * 일어나지 않았음.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/payments/prisma";
import { approvePendingPayout, retryFailedPayout } from "@/lib/payments/settlement";
import { isAdminRequest } from "@/lib/payments/adminAuth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const payout = await prisma.payPayout.findUnique({ where: { id } });
  if (!payout) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    if (payout.status === "PENDING") {
      const updated = await approvePendingPayout(id);
      return NextResponse.json({ data: updated });
    }
    if (payout.status === "FAILED") {
      const updated = await retryFailedPayout(id);
      return NextResponse.json({ data: updated });
    }
    return NextResponse.json({ error: `이미 처리됨 (status=${payout.status})` }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
