"use client";

import { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { IcBack, IcDispute, IcCheck, IcWarning, IcOrder, IcEdit, IcMoney } from "@/components/icons";
import Crd from "@/components/atoms/Crd";
import PBtn from "@/components/atoms/PBtn";
import { toast } from "@/components/layout/Toast";

const F = "'Helvetica Neue', Arial, sans-serif";

export default function DisputeCenter({ nav, goBack, refresh }) {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const disputes = GS.disputes || [];
  const eligibleOrders = GS.orders.filter(o => o.status === "delivered" || o.status === "done");
  const types = [
    ["quality", <IcWarning key="q" />, "Чанарын асуудал", "Хүлээн авсан бүтээл захиалсантай таарахгүй"],
    ["nodelivery", <IcOrder key="n" />, "Хүргэгдээгүй", "Захиалга ирэлгүй"],
    ["mismatch", <IcEdit key="m" />, "Тайлбартай таарахгүй", "Бүтээл зарлагдсантай өөр"],
    ["refund", <IcMoney key="r" />, "Буцаан олголт", "Мөнгөө буцаан авахыг хүсч байна"],
  ];

  const submitDispute = () => {
    if (!type || !details.trim()) { toast("Бүх талбарыг бөглөнө үү", "error"); return; }
    if (!selectedOrderId && eligibleOrders.length === 0) { toast("Захиалга олдсонгүй", "error"); return; }
    const order = GS.orders.find(o => o.id === selectedOrderId) || eligibleOrders[0];
    const dispute = {
      id: Date.now(),
      orderId: order?.id,
      orderTitle: order?.title || "Захиалга",
      creator: order?.creator,
      amount: order?.price || 0,
      type,
      typeLabel: types.find(t => t[0] === type)?.[2] || type,
      details,
      status: "pending",
      date: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
    };
    GS.disputes = [dispute, ...disputes];
    GS.notifications.unshift({
      id: Date.now() + 1, icon: "warning",
      title: "Маргаан нээгдлээ",
      desc: dispute.typeLabel,
      time: "Сая", read: false, to: "dispute",
    });
    saveGS();
    setStep(0); setType(""); setDetails(""); setSelectedOrderId(null);
    refresh && refresh();
    toast("Маргаан илгээгдлээ", "success");
  };

  const statusLabels = { pending: "Хүлээгдэж байна", resolved: "Шийдэгдсэн", rejected: "Татгалзсан" };
  const statusColors = { pending: T.yellow, resolved: T.green, rejected: T.red };

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FFFFFF" }}>
    <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #F0F0F0" }}>
      <button type="button" onClick={() => goBack ? goBack() : nav("me")} style={{ background: "none", border: "none", color: "#111111", cursor: "pointer", display: "flex" }}><IcBack /></button>
      <div style={{ fontFamily: F, fontSize: 16, fontWeight: 600, color: "#111111" }}>Гомдол, буцаалт</div>
    </div>

    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "16px" }}>
      {/* Escrow info */}
      <div style={{ border: "1px solid #E5E5E5", borderRadius: 8, padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#F7F7F7", display: "flex", alignItems: "center", justifyContent: "center", color: "#111111" }}><IcDispute /></div>
          <div>
            <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: "#111111", marginBottom: 4 }}>Мөнгөн баталгаа</div>
            <div style={{ fontFamily: F, fontSize: 12, color: "#666666", lineHeight: 1.6 }}>Таны төлбөрийг бүтээлч хүлээлгэн өгөхөөс өмнө The TOONO хамгаалж байна.</div>
          </div>
        </div>
      </div>

      {/* Existing disputes */}
      {disputes.length > 0 && <>
        <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: "#111111", marginBottom: 12 }}>Миний маргаан ({disputes.length})</div>
        {disputes.map(d => <Crd key={d.id} style={{ padding: "14px 16px", marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#111111", marginBottom: 2 }}>{d.orderTitle}</div>
              <div style={{ fontFamily: F, fontSize: 11, color: "#999999" }}>{d.typeLabel} · {d.date}</div>
            </div>
            <span style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: statusColors[d.status] || "#666666", padding: "3px 8px", borderRadius: 20, background: "#F7F7F7" }}>
              {statusLabels[d.status] || d.status}
            </span>
          </div>
          {d.details && <div style={{ fontFamily: F, fontSize: 12, color: "#666666", lineHeight: 1.5, marginTop: 6 }}>{d.details}</div>}
        </Crd>)}
        <div style={{ height: 1, background: "#F0F0F0", margin: "20px 0" }} />
      </>}

      {/* New dispute */}
      <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: "#111111", marginBottom: 14 }}>Шинэ маргаан нээх</div>

      {eligibleOrders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 0", fontFamily: F, fontSize: 13, color: "#999999" }}>
          Маргаан нээх боломжтой захиалга байхгүй
        </div>
      ) : (
        <>
          {step === 0 && <>
            {/* Order selector */}
            <div style={{ fontFamily: F, fontSize: 12, fontWeight: 500, color: "#666666", marginBottom: 8 }}>Захиалга сонгох</div>
            {eligibleOrders.map(o => <button type="button" key={o.id} onClick={() => setSelectedOrderId(o.id)} style={{
              width: "100%", background: selectedOrderId === o.id ? "#F7F7F7" : "#FFFFFF",
              border: `1px solid ${selectedOrderId === o.id ? "#111111" : "#E5E5E5"}`,
              borderRadius: 8, padding: "12px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12, textAlign: "left", marginBottom: 8,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#111111" }}>{o.title}</div>
                <div style={{ fontFamily: F, fontSize: 11, color: "#999999" }}>{o.creator} · ₮{(o.price || 0).toLocaleString()}</div>
              </div>
              {selectedOrderId === o.id && <IcCheck />}
            </button>)}

            <div style={{ marginTop: 16, fontFamily: F, fontSize: 12, fontWeight: 500, color: "#666666", marginBottom: 8 }}>Маргааны төрөл</div>
            {types.map(t => <button type="button" key={t[0]} onClick={() => { setType(t[0]); setStep(1); }} style={{
              width: "100%", background: "#FFFFFF", border: "1px solid #E5E5E5",
              borderRadius: 8, padding: "12px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12, textAlign: "left", marginBottom: 8,
            }}>
              <div style={{ color: "#111111", flexShrink: 0 }}>{t[1]}</div>
              <div>
                <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#111111" }}>{t[2]}</div>
                <div style={{ fontFamily: F, fontSize: 11, color: "#999999", marginTop: 2 }}>{t[3]}</div>
              </div>
            </button>)}
          </>}

          {step === 1 && <>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: F, fontSize: 12, fontWeight: 500, color: "#666666", marginBottom: 6 }}>Асуудлаа тайлбарлана уу</div>
              <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Юу болсон талаар дэлгэрэнгүй бичнэ үү..." style={{
                width: "100%", minHeight: 120, background: "#FFFFFF", border: "1px solid #E5E5E5",
                borderRadius: 8, padding: "12px 14px",
                fontFamily: F, fontSize: 14, color: "#111111",
                outline: "none", resize: "none", lineHeight: 1.6, boxSizing: "border-box",
              }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <PBtn full secondary onClick={() => setStep(0)}>Буцах</PBtn>
              <PBtn full onClick={submitDispute}>Илгээх</PBtn>
            </div>
          </>}
        </>
      )}
      <div style={{ height: 30 }} />
    </div>
  </div>;
}
