"use client";
import { useState, useEffect } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import Crd from "@/components/atoms/Crd";
import PBtn from "@/components/atoms/PBtn";
import Simple from "@/components/layout/Simple";

const statusLabel = { pending: "Хүлээгдэж байна", making: "Хийж байна", shipped: "Хүргэгдэж байна", delivered: "Хүргэгдсэн", done: "Дууссан", cancelled: "Цуцлагдсан" };
const statusColor = { pending: T.yellow, making: T.accent, shipped: T.accent, delivered: T.green, done: T.textSub, cancelled: T.red };

export default function Dashboard({ nav, goBack, refresh }) {
  const totalSales = GS.myWorks.reduce((s, w) => s + (w.sales || 0), 0);
  const totalViews = GS.myWorks.reduce((s, w) => s + (typeof w.views === "number" ? w.views : parseInt(w.views) || 0), 0);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const totalRevenue = receivedOrders.filter(o => o.status === "done").reduce((s, o) => s + (o.total_price || o.price || 0), 0);
  const pendingRevenue = receivedOrders.filter(o => o.status !== "done" && o.status !== "cancelled").reduce((s, o) => s + (o.total_price || o.price || 0), 0);

  useEffect(() => {
    if (!isSupabaseReady() || !GS.user.id) return;
    setLoadingOrders(true);
    DB.getReceivedOrders(GS.user.id).then(orders => {
      setReceivedOrders(orders || []);
    }).catch(() => {}).finally(() => setLoadingOrders(false));
  }, []);
  // No chart — real monthly data not available yet
  const kpis = [
    { label: "Нийт орлого", value: "₮" + (totalRevenue || 0).toLocaleString(), sub: "Дууссан захиалгаас", color: T.green, bg: T.greenSub },
    { label: "Хүлээгдэж буй", value: "₮" + (pendingRevenue || 0).toLocaleString(), sub: receivedOrders.filter(o => o.status !== "done" && o.status !== "cancelled").length + " захиалга", color: T.accent, bg: T.accentSub },
    { label: "Профайл үзэлт", value: totalViews.toLocaleString(), sub: "Нийлбэр", color: T.yellow, bg: "rgba(240,160,48,0.14)" },
    { label: "Захиалга авах", value: (GS.receivedCommissions?.length || 0) + " ш", sub: GS.user.commOpen ? "Нээлттэй" : "Хаалттай", color: T.accent, bg: T.accentSub },
  ];

  return (
    <Simple nav={nav} title="Хяналтын самбар" back="me">
      <div style={{ height: 16 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: k.bg, border: `1px solid ${k.color}28`, borderRadius: 16, padding: "16px 16px 14px" }}>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: k.color, fontWeight: 700, marginBottom: 8, letterSpacing: "0.02em" }}>{k.label}</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 22, fontWeight: 800, color: T.textH, marginBottom: 4, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub }}>{k.sub}</div>
          </div>
        ))}
      </div>
      {/* Revenue summary */}
      <div style={{ border: `1px solid ${T.borderLight}`, borderRadius: 16, padding: "18px 16px", marginBottom: 20, background: "#FAFAFA" }}>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textSub, marginBottom: 6 }}>Нийт орлого</div>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 28, fontWeight: 800, color: T.textH, lineHeight: 1 }}>₮{(totalRevenue || 0).toLocaleString()}</div>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub, marginTop: 8 }}>{totalSales} борлуулалт · {GS.myWorks.length} бүтээл · {GS.receivedCommissions?.length || 0} захиалга</div>
      </div>
      {/* Received orders section */}
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 10 }}>Орж ирсэн захиалга</div>
      {loadingOrders
        ? <div style={{ padding: "20px 0", textAlign: "center", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textSub }}>Уншиж байна...</div>
        : receivedOrders.length === 0
          ? <div style={{ padding: "20px 0", textAlign: "center", border: `1px dashed ${T.border}`, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 600, color: T.textH, marginBottom: 4 }}>Захиалга байхгүй</div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>Бүтээлч худалдан авалт хийгдэх үед энд харагдана</div>
            </div>
          : receivedOrders.slice(0, 8).map((o, i) => (
            <Crd key={o.id || i} style={{ padding: "14px 16px", marginBottom: 8, cursor: "pointer" }} onClick={() => { GS.selectedOrderId = o.id; nav("order-detail"); }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 700, color: T.textH, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {o.items?.[0]?.title || o.title || "Захиалга"}
                  </div>
                  <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub }}>
                    {o.created_at ? new Date(o.created_at).toLocaleDateString("mn-MN") : o.date}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 800, color: T.accent }}>₮{(o.total_price || o.price || 0).toLocaleString()}</div>
                  <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, fontWeight: 600, color: statusColor[o.status] || T.textSub, background: (statusColor[o.status] || T.textSub) + "18", padding: "2px 8px", borderRadius: 6 }}>
                    {statusLabel[o.status] || o.status}
                  </span>
                </div>
              </div>
            </Crd>
          ))}
      {receivedOrders.length > 8 && (
        <button type="button" onClick={() => nav("order-list")} style={{ width: "100%", padding: "10px 0", background: "none", border: `1px solid ${T.border}`, borderRadius: 10, fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.accent, cursor: "pointer", marginBottom: 16 }}>
          Бүгдийг харах ({receivedOrders.length})
        </button>
      )}
    </Simple>
  );
}
