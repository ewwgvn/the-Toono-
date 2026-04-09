"use client";
import { T } from "@/theme/colors";
import { GS } from "@/lib/store";
import Crd from "@/components/atoms/Crd";
import PBtn from "@/components/atoms/PBtn";
import Simple from "@/components/layout/Simple";

export default function Dashboard({ nav, goBack }) {
  const totalSales = GS.myWorks.reduce((s, w) => s + (w.sales || 0), 0);
  const totalViews = GS.myWorks.reduce((s, w) => s + (typeof w.views === "number" ? w.views : parseInt(w.views) || 0), 0);
  const totalRevenue = GS.orders.reduce((s, o) => s + (o.price || 0), 0) + totalSales * 50000;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const revenues = [totalRevenue * 0.4, totalRevenue * 0.6, totalRevenue * 0.3, totalRevenue * 0.8, totalRevenue * 0.5, totalRevenue];
  const maxR = Math.max(...revenues, 1);
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
      <Crd style={{ padding: "18px", marginBottom: 18 }}>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 16 }}>Борлуулалтын график</div>
        {/* SVG line chart */}
        <div style={{ position: "relative", height: 110 }}>
          <svg width="100%" height="110" viewBox={"0 0 " + (revenues.length * 60) + " 100"} preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75].map(y => <line key={y} x1="0" y1={y} x2={revenues.length * 60} y2={y} stroke={T.border} strokeWidth="1" />)}
            {/* Gradient fill */}
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={T.accent} stopOpacity="0.3" />
                <stop offset="100%" stopColor={T.accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* fill */}
            <path
              d={revenues.map((r, i) => `${i === 0 ? "M" : "L"} ${i * 60 + 30} ${100 - r / maxR * 90}`).join(" ") + " L " + ((revenues.length - 1) * 60 + 30) + " 100 L 30 100 Z"}
              fill="url(#chartGrad)"
            />
            {/* Line */}
            <polyline
              points={revenues.map((r, i) => `${i * 60 + 30},${100 - r / maxR * 90}`).join(" ")}
              fill="none" stroke={T.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            />
            {/* Points */}
            {revenues.map((r, i) => <circle key={i} cx={i * 60 + 30} cy={100 - r / maxR * 90} r={i === revenues.length - 1 ? "5" : "3"} fill={i === revenues.length - 1 ? T.accent : T.s1} stroke={T.accent} strokeWidth="2" />)}
          </svg>
          {/* X-axis labels */}
          <div style={{ display: "flex", position: "absolute", bottom: -18, left: 0, right: 0 }}>
            {["1", "2", "3", "4", "5", "6"].map((m, i) => <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 9, color: T.textSub }}>{m}р</div>)}
          </div>
        </div>
        <div style={{ height: 20 }} />
        {/* Bar chart (legacy) */}
        <div style={{ display: "none", alignItems: "flex-end", gap: 8, height: 100 }}>
          {revenues.map((r, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 9, color: T.textSub }}>{Math.floor(r / 10)}K</div>
              <div style={{ width: "100%", height: (r / maxR * 80) + "px", background: i === revenues.length - 1 ? T.accent : T.accentSub, borderRadius: "4px 4px 0 0", border: `1px solid ${i === revenues.length - 1 ? T.accent : T.accentGlow}` }} />
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 9, color: T.textSub }}>{months[i]}</div>
            </div>
          ))}
        </div>
      </Crd>
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
      {false && [].map(r => (
        <Crd key={r[0]} style={{ padding: "14px 16px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 2 }}>{r[1]}</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>{r[0]} · {r[2]}</div>
          </div>
          <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, fontWeight: 700, color: T.green, background: T.greenSub, padding: "4px 10px", borderRadius: 8 }}>Тооцоо дууссан</span>
        </Crd>
      ))}
    </Simple>
  );
}
