"use client";

import { useState, useEffect } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { toast } from "@/components/layout/Toast";
import { IcBack, IcMoney } from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Crd from "@/components/atoms/Crd";
import Simple from "@/components/layout/Simple";

const F = "'Helvetica Neue', Arial, sans-serif";

const KHAN_BANKS = [
  { code: "050000", name: "Хаан Банк" },
  { code: "040000", name: "Голомт Банк" },
  { code: "150000", name: "Хас Банк" },
  { code: "320000", name: "Төрийн Банк" },
  { code: "010000", name: "Монголбанк" },
  { code: "380000", name: "Капитал Банк" },
];

const STATUS_LABEL = { PENDING: "Хүлээгдэж байна", PROCESSING: "Боловсруулж байна", COMPLETED: "Дууссан", FAILED: "Амжилтгүй" };
const STATUS_COLOR = { PENDING: T.yellow, PROCESSING: T.accent, COMPLETED: T.green, FAILED: T.red };

export default function CreatorPayout({ nav, goBack }) {
  const [tab, setTab] = useState("balance");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bank, setBank] = useState({
    code: GS.user.bankCode || "",
    accountNo: GS.user.bankAccountNo || "",
    accountName: GS.user.bankAccountName || GS.user.name || "",
  });

  useEffect(() => {
    if (!GS.user.id) { setLoading(false); return; }
    fetch(`/api/creator/balance?creatorId=${GS.user.id}`)
      .then(r => r.json())
      .then(j => { setData(j.data || {}); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const saveBank = async () => {
    if (!bank.code) { toast("Банкаа сонгоно уу", "error"); return; }
    if (bank.accountNo.length < 10) { toast("Дансны дугаараа оруулна уу (10 оронтой буюу түүнээс дээш)", "error"); return; }
    if (!bank.accountName.trim()) { toast("Дансны эзэмшигчийн нэрийг оруулна уу", "error"); return; }
    setSaving(true);
    try {
      await DB.updateBankAccount(GS.user.id, bank.code, bank.accountNo, bank.accountName);
      GS.user.bankCode = bank.code;
      GS.user.bankAccountNo = bank.accountNo;
      GS.user.bankAccountName = bank.accountName;
      saveGS();
      toast("Данс хадгалагдлаа", "success");
    } catch { toast("Хадгалахад алдаа гарлаа", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button type="button" onClick={() => goBack ? goBack() : nav("dashboard")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
        <div style={{ fontFamily: F, fontSize: 20, fontWeight: 800, color: T.textH }}>Тооцоо</div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginTop: 12, flexShrink: 0 }}>
        {[["balance", "Үлдэгдэл · Түүх"], ["bank", "Дансны тохиргоо"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "12px 0", background: "none", border: "none", fontFamily: F, fontSize: 13, fontWeight: tab === id ? 700 : 500, color: tab === id ? T.accent : T.textSub, borderBottom: `2px solid ${tab === id ? T.accent : "transparent"}`, cursor: "pointer" }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "16px 16px" }}>

        {/* ── Balance & history ── */}
        {tab === "balance" && (
          loading
            ? <div style={{ padding: 40, textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>Уншиж байна...</div>
            : <>
              {/* Balance card */}
              <Crd style={{ padding: "24px 20px", marginBottom: 16, background: T.accent, border: "none" }}>
                <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, letterSpacing: ".08em", color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>Төлөгдөөгүй үлдэгдэл</div>
                <div style={{ fontFamily: F, fontSize: 32, fontWeight: 800, color: "#fff", marginBottom: 4 }}>
                  ₮{Number(data?.balance || 0).toLocaleString()}
                </div>
                <div style={{ fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                  {GS.user.bankAccountNo ? `${KHAN_BANKS.find(b => b.code === GS.user.bankCode)?.name || "Банк"} · ${GS.user.bankAccountNo}` : "Данс бүртгэх шаардлагатай → 'Дансны тохиргоо' таб"}
                </div>
              </Crd>

              {/* Fee breakdown */}
              <Crd style={{ padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: T.textSub, marginBottom: 12, letterSpacing: ".04em" }}>Шимтгэлийн бүтэц</div>
                {[
                  ["Гүйлгээний дүн", "100%"],
                  ["Платформын шимтгэл", "10% (1,000 bps)"],
                  ["Бүтээлчид төлөх", "90%"],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                    <span style={{ fontFamily: F, fontSize: 12, color: T.textSub }}>{k}</span>
                    <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: T.textH }}>{v}</span>
                  </div>
                ))}
                <div style={{ fontFamily: F, fontSize: 11, color: T.textSub, marginTop: 8, lineHeight: 1.6 }}>
                  Худалдан авагч баталгаажуулсны дараа эскро суллагдана → Долоо хоног бүрийн Даваа гарагт 10:00 UTC цагт нэгтгэн төлбөр хийнэ
                </div>
              </Crd>

              {/* Recent paid orders */}
              {data?.recentOrders?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: T.textH, marginBottom: 10 }}>Сүүлийн борлуулалт</div>
                  {data.recentOrders.map((o, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                      <div>
                        <div style={{ fontFamily: F, fontSize: 13, color: T.textH }}>{o.itemTitle}</div>
                        <div style={{ fontFamily: F, fontSize: 11, color: T.textSub }}>{o.payment?.paidAt ? new Date(o.payment.paidAt).toLocaleDateString("mn-MN") : "—"}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: T.green }}>+₮{Math.round(Number(o.amount) * 0.9).toLocaleString()}</div>
                        <div style={{ fontFamily: F, fontSize: 10, color: T.textSub }}>Шимтгэлийн дараа</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Payout history */}
              {data?.payouts?.length > 0 && (
                <div>
                  <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: T.textH, marginBottom: 10 }}>Тооцооны түүх</div>
                  {data.payouts.map((p, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                      <div>
                        <div style={{ fontFamily: F, fontSize: 13, color: T.textH }}>₮{Number(p.amount).toLocaleString()}</div>
                        <div style={{ fontFamily: F, fontSize: 11, color: T.textSub }}>{new Date(p.requestedAt).toLocaleDateString("mn-MN")}</div>
                      </div>
                      <span style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: STATUS_COLOR[p.status] || T.textSub, background: (STATUS_COLOR[p.status] || T.textSub) + "18", padding: "3px 10px", borderRadius: 6 }}>
                        {STATUS_LABEL[p.status] || p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {!data?.recentOrders?.length && !data?.payouts?.length && (
                <div style={{ padding: "40px 0", textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>Одоогоор борлуулалтын түүх байхгүй байна</div>
              )}
            </>
        )}

        {/* ── Bank account settings ── */}
        {tab === "bank" && (
          <div>
            <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: T.textH, marginBottom: 16 }}>Банкны данс бүртгэх</div>

            {/* Bank selector */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontFamily: F, fontSize: 12, color: T.textSub, marginBottom: 5 }}>Банк</label>
              <select value={bank.code} onChange={e => setBank(b => ({ ...b, code: e.target.value }))} style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", fontFamily: F, fontSize: 14, color: T.textH, outline: "none", appearance: "none", cursor: "pointer", boxSizing: "border-box" }}>
                <option value="">Банк сонгох...</option>
                {KHAN_BANKS.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
              </select>
            </div>

            {/* Account number */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontFamily: F, fontSize: 12, color: T.textSub, marginBottom: 5 }}>Дансны дугаар</label>
              <input
                value={bank.accountNo}
                onChange={e => setBank(b => ({ ...b, accountNo: e.target.value.replace(/\D/g, "") }))}
                placeholder="5000123456789"
                inputMode="numeric"
                style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", fontFamily: F, fontSize: 14, color: T.textH, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Account holder name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontFamily: F, fontSize: 12, color: T.textSub, marginBottom: 5 }}>Дансны эзэмшигчийн нэр</label>
              <input
                value={bank.accountName}
                onChange={e => setBank(b => ({ ...b, accountName: e.target.value }))}
                placeholder="Нэрээ оруулна уу"
                style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px", fontFamily: F, fontSize: 14, color: T.textH, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <Crd style={{ padding: "12px 16px", marginBottom: 20, background: T.s2, border: "none" }}>
              <div style={{ fontFamily: F, fontSize: 12, color: T.textSub, lineHeight: 1.7 }}>
                Бүртгэгдсэн дансанд долоо хоног бүрийн Даваа гарагт төлөгдөөгүй үлдэгдэл автоматаар шилжинэ.<br />
                Дансны мэдээлэл буруу бол тооцоо хойшлогдох магадлалтай бөгөөд өөрчлөлт шууд хэрэгжинэ.
              </div>
            </Crd>

            <PBtn full loading={saving} onClick={saveBank}>Данс хадгалах</PBtn>
          </div>
        )}

        <div style={{ height: 30 }} />
      </div>
    </div>
  );
}
