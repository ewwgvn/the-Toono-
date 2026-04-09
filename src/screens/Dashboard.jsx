"use client";
import { T } from "@/theme/colors";
import { GS } from "@/lib/store";
import Crd from "@/components/atoms/Crd";
import PBtn from "@/components/atoms/PBtn";
import Simple from "@/components/layout/Simple";

export default function Dashboard({ nav, goBack }) {
  const totalSales = GS.myWorks.reduce((s, w) => s + (w.sales || 0), 0);
  const totalViews = GS.myWorks.reduce((s, w) => s + (typeof w.views === "number" ? w.views : parseInt(w.views) || 0), 0);
  const totalRevenue = GS.orders.reduce((s, o) => s + (o.price || 0), 0);
  // No chart — real monthly data not available yet
  const kpis = [
    { label: "Нийт орлого", value: "₮" + (totalRevenue || 0).toLocaleString(), sub: GS.myWorks.length + " бүтээлээс", color: T.green, bg: T.greenSub },
    { label: "Борлуулалт", value: totalSales + " ш", sub: "Бүтээл " + GS.myWorks.length + "·Захиалга " + (GS.receivedCommissions?.length || 0), color: T.accent, bg: T.accentSub },
    { label: "Профайл үзэлт", value: totalViews.toLocaleString(), sub: "Нийлбэр", color: T.yellow, bg: "rgba(240,160,48,0.14)" },
    { label: "Захиалга", value: (GS.receivedCommissions?.length || 0) + " ш", sub: (GS.user.commOpen ? "Нээлттэй" : "Хаалттай"), color: T.accent, bg: T.accentSub },
  ];

  return (
    <Simple nav={nav} title="Хяналтын самбар" back="me">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: k.bg, border: `1px solid ${k.color}30`, borderRadius: 15, padding: "14px" }}>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: k.color, fontWeight: 600, marginBottom: 5 }}>{k.label}</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 19, fontWeight: 800, color: T.textH, marginBottom: 3 }}>{k.value}</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub }}>{k.sub}</div>
          </div>
        ))}
      </div>
      {/* Revenue summary */}
      <div style={{ border: `1px solid ${T.borderLight}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 600, color: "#111111", marginBottom: 8 }}>Revenue</div>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 24, fontWeight: 700, color: "#111111" }}>₮{(totalRevenue || 0).toLocaleString()}</div>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: "#999999", marginTop: 4 }}>{totalSales} sales · {GS.myWorks.length} works · {GS.receivedCommissions?.length || 0} commissions</div>
      </div>
      {GS.orders.length > 0 ? GS.orders.slice(0, 5).map((o, i) => (
        <Crd key={o.id || i} style={{ padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 16, fontWeight: 800, color: T.textH }}>₮{(o.price || 0).toLocaleString()}</div><div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>{o.date}</div></div>
          <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 600, color: T.green, background: T.greenSub, padding: "4px 12px", borderRadius: 8 }}>{o.status === "done" ? "Тооцоо дууссан" : "Явагдаж байна"}</span>
        </Crd>
      )) : (
        <div style={{ textAlign: "center", padding: "30px 0" }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 6 }}>Орлогын түүх байхгүй</div>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textSub }}>Эхний борлуулалтын дараа энд харагдана</div>
        </div>
      )}
    </Simple>
  );
}
