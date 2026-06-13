/**
 * GET/POST /api/webhooks/qpay
 * QPay 결제 완료 콜백.
 *
 * 보안: QPay 콜백에는 서명이 없으므로 콜백은 "신호"로만 쓰고,
 *       payment/check API로 서버 간 재검증 후에만 PAID 처리.
 * 멱등성: 이미 PAID면 200 반환.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/payments/prisma";
import { checkPayment } from "@/lib/payments/qpay/client";
import { recordSaleLedger } from "@/lib/payments/settlement";

async function handle(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order_id");
  const token = req.nextUrl.searchParams.get("token");

  if (token !== process.env.QPAY_CALLBACK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!orderId) {
    return NextResponse.json({ error: "missing order_id" }, { status: 400 });
  }

  const payment = await prisma.payPayment.findFirst({
    where: { orderId },
    include: { order: true },
  });
  if (!payment?.qpayInvoiceId) {
    return NextResponse.json({ error: "payment not found" }, { status: 404 });
  }
  if (payment.status === "PAID") {
    return NextResponse.json({ ok: true, idempotent: true });
  }

  const check = await checkPayment(payment.qpayInvoiceId);
  const paidRow = check.rows?.find((r) => r.payment_status === "PAID");
  const paidAmount = Number(check.paid_amount ?? 0);

  if (!paidRow || paidAmount < Number(payment.amount)) {
    console.warn(JSON.stringify({ event: "qpay_callback_not_paid", orderId, check }));
    return NextResponse.json({ ok: false, status: "not_paid" });
  }

  await prisma.$transaction(async (tx) => {
    await tx.payPayment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        qpayPaymentId: paidRow.payment_id,
        paidAt: new Date(paidRow.payment_date),
        rawCheckResponse: check as any,
      },
    });
    await tx.payOrder.update({ where: { id: orderId }, data: { status: "PAID" } });
    await recordSaleLedger(tx, orderId);
  });
  // pay_orders.status 업데이트는 Supabase Realtime publication에 포함되어 있으므로
  // (supabase-payments-schema.sql 참고) 프론트의 useOrderStatus가 자동으로 수신함.
  // 별도 Supabase `orders` 테이블 업데이트는 불필요 — 해당 row가 존재하지 않아 항상 0행 영향(no-op)이었음.

  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) { return handle(req); }
export async function POST(req: NextRequest) { return handle(req); }
