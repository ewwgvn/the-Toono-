/**
 * QPay v2 클라이언트
 * Docs: https://developer.qpay.mn
 *
 * 인증: Basic Auth(username/password) → access_token
 * 핵심: QPay callback에는 서명이 없으므로 payment/check API로 반드시 재검증.
 */

const BASE_URL =
  process.env.QPAY_ENV === "production"
    ? "https://merchant.qpay.mn/v2"
    : "https://merchant-sandbox.qpay.mn/v2";

type TokenCache = { accessToken: string; expiresAt: number };
let tokenCache: TokenCache | null = null;

export interface QPayInvoiceRequest {
  senderInvoiceNo: string;
  receiverCode: string;
  description: string;
  amount: number;
  callbackUrl: string;
  ebarimt_register_no?: string;  // 몽골 전자영수증 등록번호 (7 or 9 digits)
}

export interface QPayInvoiceResponse {
  invoice_id: string;
  qr_text: string;
  qr_image: string;
  qPay_shortUrl: string;
  urls: { name: string; description: string; link: string }[];
}

export interface QPayPaymentCheckResult {
  count: number;
  paid_amount: number;
  rows: {
    payment_id: string;
    payment_status: "NEW" | "FAILED" | "PAID" | "REFUNDED";
    payment_amount: string;
    payment_currency: string;
    payment_date: string;
  }[];
}

async function getToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.accessToken;
  }
  const basic = Buffer.from(
    `${process.env.QPAY_USERNAME}:${process.env.QPAY_PASSWORD}`
  ).toString("base64");

  const res = await fetch(`${BASE_URL}/auth/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}` },
  });
  if (!res.ok) throw new Error(`QPay auth failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  tokenCache = {
    accessToken: data.access_token,
    // expires_in은 초 단위로 오는 경우와 epoch ms로 오는 경우 있음 — 큰 값이면 epoch으로 해석
    expiresAt: data.expires_in > 1e10 ? data.expires_in : Date.now() + data.expires_in * 1000,
  };
  return tokenCache.accessToken;
}

async function qpayFetch(path: string, init: RequestInit = {}): Promise<any> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers as Record<string, string> | undefined),
    },
  });
  if (res.status === 401) {
    tokenCache = null;
    return qpayFetch(path, init); // 토큰 만료 시 1회 재시도
  }
  if (!res.ok) throw new Error(`QPay ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

export async function createInvoice(req: QPayInvoiceRequest): Promise<QPayInvoiceResponse> {
  return qpayFetch("/invoice", {
    method: "POST",
    body: JSON.stringify({
      invoice_code: process.env.QPAY_INVOICE_CODE,
      sender_invoice_no: req.senderInvoiceNo,
      invoice_receiver_code: req.receiverCode,
      invoice_description: req.description,
      amount: req.amount,
      callback_url: req.callbackUrl,
      ...(req.ebarimt_register_no ? { ebarimt_register_no: req.ebarimt_register_no } : {}),
    }),
  });
}

export async function checkPayment(invoiceId: string): Promise<QPayPaymentCheckResult> {
  return qpayFetch("/payment/check", {
    method: "POST",
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: invoiceId,
      offset: { page_number: 1, page_limit: 100 },
    }),
  });
}

export async function cancelInvoice(invoiceId: string): Promise<void> {
  await qpayFetch(`/invoice/${invoiceId}`, { method: "DELETE" });
}

export async function refundPayment(paymentId: string, note?: string): Promise<void> {
  await qpayFetch(`/payment/refund/${paymentId}`, {
    method: "DELETE",
    body: JSON.stringify({ note: note ?? "Uliger World refund" }),
  });
}
