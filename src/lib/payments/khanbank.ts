/**
 * Khan Bank 송금 어댑터 — 정산(payout)용
 *
 * PAYOUT_MODE=MANUAL  → 정산 큐에 기록만 (관리자 수동 이체)
 * PAYOUT_MODE=KHAN_API → Khan Bank Corporate API 자동 이체 (계약 필요)
 */

export interface BankTransfer {
  bankCode: string;    // "050000" Khan, "150000" Golomt, "040000" TDB ...
  accountNo: string;
  accountName: string;
  amount: number;      // MNT
  description: string;
}

const MODE = process.env.PAYOUT_MODE ?? "MANUAL";

export async function transferToBank(t: BankTransfer): Promise<string> {
  if (MODE === "MANUAL") {
    console.info(JSON.stringify({ event: "manual_payout_queued", ...t }));
    return `MANUAL-${Date.now()}`;
  }

  const token = await getKhanToken();
  const res = await fetch(`${process.env.KHAN_API_URL}/v1/transfer/domestic`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      fromAccount: process.env.KHAN_SETTLEMENT_ACCOUNT,
      toBank: t.bankCode,
      toAccount: t.accountNo,
      toAccountName: t.accountName,
      amount: t.amount,
      currency: "MNT",
      description: t.description,
    }),
  });
  if (!res.ok) throw new Error(`Khan transfer failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.transactionId ?? data.reference;
}

async function getKhanToken(): Promise<string> {
  const res = await fetch(`${process.env.KHAN_API_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.KHAN_CLIENT_ID!,
      client_secret: process.env.KHAN_CLIENT_SECRET!,
    }),
  });
  if (!res.ok) throw new Error(`Khan auth failed: ${res.status}`);
  return (await res.json()).access_token;
}
