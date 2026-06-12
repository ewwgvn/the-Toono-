/**
 * POST /api/commissions/[id]/invoice
 * 커미션 마일스톤 결제 인보이스 생성
 * Body: { stage: "deposit" | "final", buyerEmail, buyerName }
 * - deposit: 총액의 50% → 창작자 작업 시작
 * - final:   나머지 50% → 창작자 최종 납품
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/payments/prisma";
import { createInvoice } from "@/lib/payments/qpay/client";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { stage, buyerEmail, buyerName } = await req.json();
    if (!["deposit", "final"].includes(stage)) {
      return NextResponse.json({ error: "stage must be deposit or final" }, { status: 400 });
    }

    // Get commission from Supabase
    const { data: comm } = await supabaseAdmin
      .from("commissions")
      .select("*, profiles!seller_id(id, name)")
      .eq("id", id)
      .single();
    if (!comm) return NextResponse.json({ error: "commission not found" }, { status: 404 });

    // Parse budget string (e.g. "₮100,000~300,000") → use midpoint or lower bound
    const budgetStr: string = comm.budget || "100000";
    const budgetNum = parseInt(budgetStr.replace(/[^\d]/g, "")) || 100000;
    const amount = Math.round(budgetNum * 0.5); // 50% each stage

    const sellerId = comm.seller_id;
    let creatorEmail = `${sellerId}@uliger.world`;
    try {
      const { data: au } = await supabaseAdmin.auth.admin.getUserById(sellerId);
      if (au?.user?.email) creatorEmail = au.user.email;
    } catch {}

    // Upsert PayCreator
    await prisma.payCreator.upsert({
      where: { id: sellerId },
      create: { id: sellerId, name: (comm.profiles as any)?.name || "창작자", email: creatorEmail },
      update: { name: (comm.profiles as any)?.name || "창작자" },
    });

    const order = await prisma.payOrder.create({
      data: {
        creatorId: sellerId,
        buyerEmail: buyerEmail || "guest@uliger.world",
        buyerName: buyerName || null,
        itemTitle: `커미션 ${stage === "deposit" ? "계약금 50%" : "잔금 50%"} — ${comm.type || ""}`,
        amount,
        currency: "MNT",
      },
    });

    const senderInvoiceNo = `ULG-COMM-${stage.toUpperCase()}-${order.id.slice(0, 6)}-${Date.now()}`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/qpay?order_id=${order.id}&token=${process.env.QPAY_CALLBACK_SECRET}`;

    const invoice = await createInvoice({ senderInvoiceNo, receiverCode: buyerEmail, description: `Uliger World 커미션 ${stage}`.slice(0, 255), amount, callbackUrl });

    await prisma.payPayment.create({
      data: { orderId: order.id, senderInvoiceNo, qpayInvoiceId: invoice.invoice_id, qrText: invoice.qr_text, qrImage: invoice.qr_image, shortUrl: invoice.qPay_shortUrl, deeplinks: invoice.urls as any, amount },
    });

    // Update commission record
    const colOrderId = stage === "deposit" ? "deposit_order_id" : "final_order_id";
    await supabaseAdmin.from("commissions").update({ [colOrderId]: order.id }).eq("id", id);

    return NextResponse.json({
      data: { orderId: order.id, qrImage: invoice.qr_image, qrText: invoice.qr_text, shortUrl: invoice.qPay_shortUrl, deeplinks: invoice.urls },
    }, { status: 201 });
  } catch (e: any) {
    console.error(JSON.stringify({ event: "comm_invoice_error", error: e.message }));
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
