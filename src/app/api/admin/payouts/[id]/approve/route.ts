/**
 * POST /api/admin/payouts/[id]/approve — 수동 정산 승인
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/payments/prisma";
import { runPayout } from "@/lib/payments/settlement";

function isAdmin(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  return auth === `Bearer ${process.env.CRON_SECRET}` ||
         auth === `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET}`;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const payout = await prisma.payPayout.findUnique({ where: { id } });
  if (!payout) return NextResponse.json({ error: "not found" }, { status: 404 });

  try {
    await runPayout(payout.creatorId);
    return NextResponse.json({ data: { success: true } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
