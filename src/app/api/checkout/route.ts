/**
 * POST /api/checkout
 * 주문 생성 + QPay 인보이스 발행 → QR / 딥링크 반환
 *
 * Body: { creatorId, workId?, buyerEmail, buyerName?, itemTitle, amount }
 * Response: { data: { orderId, qrImage, qrText, shortUrl, deeplinks } }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/payments/prisma";
import { createInvoice } from "@/lib/payments/qpay/client";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { creatorId, workId, buyerEmail, buyerName, itemTitle, amount, ebarimtRegisterNo } =
      await req.json();

    if (!creatorId || !buyerEmail || !itemTitle || !amount || amount <= 0) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "필수 필드 누락" } },
        { status: 400 }
      );
    }

    // Supabase profiles에서 창작자 정보 조회 후 PayCreator upsert
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, name, email:id") // email은 auth.users에 있지만 id로 대체
      .eq("id", creatorId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: { code: "CREATOR_NOT_FOUND", message: "창작자를 찾을 수 없음" } },
        { status: 404 }
      );
    }

    // auth.users에서 이메일 조회 (서비스 롤 키 필요)
    let creatorEmail = `${creatorId}@uliger.world`; // fallback
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(creatorId);
      if (authUser?.user?.email) creatorEmail = authUser.user.email;
    } catch {}

    // PayCreator 자동 upsert — id = Supabase profiles.id
    await prisma.payCreator.upsert({
      where: { id: creatorId },
      create: { id: creatorId, name: (profile as any).name || "창작자", email: creatorEmail },
      update: { name: (profile as any).name || "창작자" },
    });

    const order = await prisma.payOrder.create({
      data: {
        creatorId,
        workId: workId ?? null,
        buyerEmail,
        buyerName: buyerName ?? null,
        itemTitle,
        amount,
        currency: "MNT",
      },
    });

    const senderInvoiceNo = `ULG-${order.id.slice(0, 8)}-${Date.now()}`;
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/qpay?order_id=${order.id}&token=${process.env.QPAY_CALLBACK_SECRET}`;

    const invoice = await createInvoice({
      senderInvoiceNo,
      receiverCode: buyerEmail,
      description: `Uliger World: ${itemTitle}`.slice(0, 255),
      amount: Number(amount),
      callbackUrl,
      ...(ebarimtRegisterNo ? { ebarimt_register_no: ebarimtRegisterNo } : {}),
    });

    await prisma.payPayment.create({
      data: {
        orderId: order.id,
        senderInvoiceNo,
        qpayInvoiceId: invoice.invoice_id,
        qrText: invoice.qr_text,
        qrImage: invoice.qr_image,
        shortUrl: invoice.qPay_shortUrl,
        deeplinks: invoice.urls as any,
        amount,
      },
    });

    return NextResponse.json(
      {
        data: {
          orderId: order.id,
          qrImage: invoice.qr_image,
          qrText: invoice.qr_text,
          shortUrl: invoice.qPay_shortUrl,
          deeplinks: invoice.urls,
        },
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error(JSON.stringify({ event: "checkout_error", error: e.message }));
    return NextResponse.json(
      { error: { code: "CHECKOUT_FAILED", message: "결제 생성 실패" } },
      { status: 500 }
    );
  }
}
