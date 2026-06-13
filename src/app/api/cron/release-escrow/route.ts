/**
 * GET /api/cron/release-escrow
 * 7일 에스크로 자동 확인 — Vercel Cron 매일 01:00 UTC
 * vercel.json: { "path": "/api/cron/release-escrow", "schedule": "0 1 * * *" }
 *
 * protection_until <= now() 이면서 escrow_status = 'held' 이고
 * status가 'disputed'/'cancelled'가 아닌 주문을
 * escrow_status='released', payout_status='scheduled'로 일괄 갱신.
 *
 * 인증: CRON_SECRET Bearer (adminAuth.ts와 동일 패턴, 서버 전용 env).
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date().toISOString();

  // Fetch eligible orders
  const { data: orders, error: fetchError } = await supabaseAdmin
    .from("orders")
    .select("id, protection_until, escrow_status, status")
    .lte("protection_until", now)
    .eq("escrow_status", "held")
    .not("status", "in", '("disputed","cancelled")')
    .limit(500);

  if (fetchError) {
    console.error(JSON.stringify({ event: "release_escrow_fetch_error", error: fetchError.message }));
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!orders || orders.length === 0) {
    return NextResponse.json({ data: { released: 0 } });
  }

  const ids = orders.map((o: { id: number }) => o.id);

  const { error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      escrow_status: "released",
      payout_status: "scheduled",
    })
    .in("id", ids);

  if (updateError) {
    console.error(JSON.stringify({ event: "release_escrow_update_error", error: updateError.message, ids }));
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  console.log(JSON.stringify({ event: "escrow_auto_released", count: ids.length, ids }));
  return NextResponse.json({ data: { released: ids.length, ids } });
}
