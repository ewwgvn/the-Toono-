/**
 * GET /api/works/[id]/download?orderId=xxx
 * 디지털 상품 다운로드 — 결제 확인 후 서명된 Supabase Storage URL 반환.
 * - 만료: 1시간 서명된 URL
 * - 최대 5회 다운로드
 * - 주문 PAID 상태 확인 후만 허용
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/payments/prisma";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workId } = await params;
    const orderId = req.nextUrl.searchParams.get("orderId");
    if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });

    // Verify order is PAID (check Prisma pay_orders)
    const order = await prisma.payOrder.findUnique({ where: { id: orderId } }).catch(() => null);
    if (!order || order.status !== "PAID") {
      // Fall back to Supabase orders table (for non-QPay orders)
      const { data: supaOrder } = await supabaseAdmin
        .from("orders")
        .select("id, status, payment_status")
        .eq("id", orderId)
        .maybeSingle();
      if (!supaOrder || (supaOrder.status !== "done" && supaOrder.payment_status !== "paid")) {
        return NextResponse.json({ error: "결제가 확인되지 않음" }, { status: 403 });
      }
    }

    // Get digital file record
    const { data: file } = await supabaseAdmin
      .from("digital_files")
      .select("*")
      .eq("work_id", workId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!file) return NextResponse.json({ error: "디지털 파일 없음" }, { status: 404 });

    // Check/create download record
    const { data: dl } = await supabaseAdmin
      .from("digital_downloads")
      .select("*")
      .eq("order_id", orderId)
      .maybeSingle();

    if (dl) {
      if (dl.download_count >= dl.max_downloads) {
        return NextResponse.json({ error: "최대 다운로드 횟수 초과" }, { status: 403 });
      }
      if (new Date(dl.expires_at) < new Date()) {
        return NextResponse.json({ error: "다운로드 링크 만료됨" }, { status: 403 });
      }
      // Increment count
      await supabaseAdmin.from("digital_downloads").update({ download_count: dl.download_count + 1 }).eq("id", dl.id);
    } else {
      // Create new download record
      await supabaseAdmin.from("digital_downloads").insert({
        order_id: orderId,
        work_id: workId,
        download_count: 1,
        max_downloads: 5,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Generate signed URL (1 hour)
    const bucket = "works";
    const { data: signed, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(file.storage_path, 3600);

    if (error || !signed?.signedUrl) {
      return NextResponse.json({ error: "URL 생성 실패" }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        url: signed.signedUrl,
        fileName: file.file_name,
        expiresIn: 3600,
        remainingDownloads: (dl ? dl.max_downloads - dl.download_count - 1 : 4),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
