/**
 * GET /api/cron/payouts
 * 정산 배치 — Vercel Cron 주 1회 호출 (매주 월 10:00 UTC)
 * vercel.json: { "crons": [{ "path": "/api/cron/payouts", "schedule": "0 10 * * 1" }] }
 */
import { NextRequest, NextResponse } from "next/server";
import { runAllPayouts } from "@/lib/payments/settlement";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const results = await runAllPayouts();
  return NextResponse.json({ data: { payouts: results, count: results.length } });
}
