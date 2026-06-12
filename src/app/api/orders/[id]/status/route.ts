/**
 * GET /api/orders/[id]/status
 * 프론트 폴링용 — QR 화면에서 결제 완료 여부 확인.
 * PENDING이면 QPay에 직접 재확인 (콜백 누락 복구).
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/payments/prisma";
import { checkPayment } from "@/lib/payments/qpay/client";
import { recordSaleLedger } from "@/lib/payments/settlement";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.payOrder.findUnique({
    where: { id },
    include: { payment: true },
  });
  if (!order) {
    return NextResponse.json({ error: { code: "NOT_FOUND" } }, { status: 404 });
  }

  // 미결제 상태면 QPay에 직접 확인 (콜백 누락 복구)
  if (order.status === "PENDING" && order.payment?.qpayInvoiceId) {
    try {
      const check = await checkPayment(order.payment.qpayInvoiceId);
      const paidRow = check.rows?.find((r) => r.payment_status === "PAID");
      if (paidRow && Number(check.paid_amount) >= Number(order.amount)) {
        await prisma.$transaction(async (tx) => {
          await tx.payPayment.update({
            where: { id: order.payment!.id },
            data: {
              status: "PAID",
              qpayPaymentId: paidRow.payment_id,
              paidAt: new Date(paidRow.payment_date),
              rawCheckResponse: check as any,
            },
          });
          await tx.payOrder.update({ where: { id: order.id }, data: { status: "PAID" } });
          await recordSaleLedger(tx, order.id);
        });
        return NextResponse.json({ data: { status: "PAID" } });
      }
    } catch (e: any) {
      console.error(JSON.stringify({ event: "status_check_error", orderId: order.id, error: e.message }));
    }
  }

  return NextResponse.json({ data: { status: order.status } });
}
