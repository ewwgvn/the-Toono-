"use client";

import { useState } from "react";
import { T } from "@/theme/colors";
import { GS } from "@/lib/store";
import { IcBack, IcDispute, IcCheck, IcWarning, IcOrder, IcEdit, IcMoney } from "@/components/icons";
import Crd from "@/components/atoms/Crd";
import PBtn from "@/components/atoms/PBtn";

export default function DisputeCenter({ nav, goBack }) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const cases = GS.orders.filter(o => o.status === "delivered" || o.status === "done").map(o => ({ id: o.id, title: o.title, creator: o.creator, status: "Шийдэгдсэн", amount: o.price, date: o.date, icon: <IcCheck />, col: T.green }));
  const types = [
    ["quality", <IcWarning key="q" />, "Чанарын асуудал", "Хүлээн авсан бүтээл захиалсантай таарахгүй"],
    ["nodelivery", <IcOrder key="n" />, "Хүргэгдээгүй", "Захиалга ирэлгүй"],
    ["mismatch", <IcEdit key="m" />, "Тайлбартай таарахгүй", "Бүтээл зарлагдсантай өөр"],
    ["refund", <IcMoney key="r" />, "Буцаан олголт", "Мөнгөө буцаан авахыг хүсч байна"],
  ];

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    <div style={{ padding: "20px 20px 14px", display: "flex", alignItems: "center", gap: 10 }}>
      <button onClick={() => goBack ? goBack() : nav("me")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 20, fontWeight: 800, color: T.textH }}>Гомдол, буцаалт</div>
    </div>

    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "0 20px" }}>
      {/* Escrow */}
      <div style={{ background: "linear-gradient(135deg,rgba(91,143,232,0.12),rgba(58,170,106,0.08))", border: `1px solid ${T.accentGlow}`, borderRadius: 16, padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, width: 40, height: 40, borderRadius: 12, background: T.accentSub }}><IcDispute /></div>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 4 }}>Мөнгөн баталгаа</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textB, lineHeight: 1.6 }}>Таны төлбөрийг бүтээлч хүлээлгэн өгөхөөс өмнө The TOONO хамгаалж байна.</div>
          </div>
        </div>
      </div>

      {/* Cases */}
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 12 }}>Маргааны түүх</div>
      {cases.map(c => <Crd key={c.id} style={{ padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 3 }}>{c.title}</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub, marginBottom: 6 }}>{c.creator} · {c.date}</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.accent }}>₮{c.amount.toLocaleString()}</div>
          </div>
          <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, fontWeight: 700, color: c.col, background: c.col + "18", padding: "4px 10px", borderRadius: 8 }}>{c.icon} {c.status}</span>
        </div>
      </Crd>)}

      <div style={{ height: 1, background: T.border, margin: "20px 0" }} />

      {/* New dispute */}
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 14 }}>Шинэ маргаан нээх</div>

      {step === 0 && <>
        {types.map(t => <button key={t[0]} onClick={() => { setType(t[0]); setStep(1); }} style={{ width: "100%", background: type === t[0] ? T.accentSub : T.s1, border: `1.5px solid ${type === t[0] ? T.accent : T.border}`, borderRadius: 16, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left", marginBottom: 10 }}>
          <div style={{ fontSize: 26, flexShrink: 0 }}>{t[1]}</div>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 600, color: T.textH }}>{t[2]}</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub, marginTop: 3 }}>{t[3]}</div>
          </div>
        </button>)}
      </>}

      {step === 1 && <>
        <Crd style={{ padding: "13px 16px", marginBottom: 14, display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: T.accentSub, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent }}><IcOrder /></div>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 700, color: T.textH }}>{GS.orders[0]?.title || "Захиалга"}</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>{GS.orders[0]?.creator || GS.user.name} · {GS.orders[0] ? "₮" + GS.orders[0].price.toLocaleString() : "—"}</div>
          </div>
        </Crd>
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textSub, marginBottom: 7 }}>Асуудлаа тайлбарлана уу</div>
          <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Юу болсон талаар дэлгэрэнгүй бичнэ үү. Зураг, бичлэг хавсаргаж болно..." style={{ width: "100%", minHeight: 120, background: T.s1, border: `1px solid ${T.border}`, borderRadius: 13, padding: "13px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textH, outline: "none", resize: "none", lineHeight: 1.7, boxSizing: "border-box" }} />
        </div>
        <div style={{ background: "rgba(240,160,48,0.1)", border: "1px solid rgba(240,160,48,0.3)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.yellow, lineHeight: 1.6 }}><span style={{ display: "flex", marginRight: 4 }}><IcWarning /></span>Маргааныг аль болох хурдан шийдэхийг хичээнэ. Бодитой мэдээлэл оруулна уу.</div>
        <div style={{ display: "flex", gap: 10 }}>
          <PBtn full secondary onClick={() => setStep(0)}>Буцах</PBtn>
          <PBtn full danger onClick={() => { setStep(0); }}>Нээх</PBtn>
        </div>
      </>}
      <div style={{ height: 30 }} />
    </div>
  </div>;
}
