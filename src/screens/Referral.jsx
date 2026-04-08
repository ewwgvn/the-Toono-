"use client";

import { useState } from "react";
import { T } from "@/theme/colors";
import { GS } from "@/lib/store";
import { IcGift, IcCheck, IcLink } from "@/components/icons";
import Simple from "@/components/layout/Simple";
import Crd from "@/components/atoms/Crd";
import PBtn from "@/components/atoms/PBtn";
import Toono from "@/components/atoms/Toono";

export default function Referral({ nav, goBack }) {
  const myCode = "THETOONO-" + (GS.user.name || "USER").toUpperCase().replace(/\s/g, "").slice(0, 6) + "-" + Date.now().toString(36).slice(-4).toUpperCase();
  const [copied, setCopied] = useState(false);
  const history = [];
  const earned = history.reduce((s, h) => s + h.reward, 0);

  const doCopy = () => {
    try { navigator.clipboard.writeText(myCode); } catch (e) { }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return <Simple nav={nav} title="Найзаа урих" back="me">
    {/* Banner */}
    <div style={{ background: `linear-gradient(135deg,${T.accent},#3A6FD8,#8850D4)`, borderRadius: 20, padding: "24px 20px", marginBottom: 20, textAlign: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: .07, display: "flex", alignItems: "center", justifyContent: "center" }}><Toono size={200} color="#fff" /></div>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 8, color: "rgba(255,255,255,0.9)" }}><IcGift /></div>
      <div style={{ fontFamily: "system-ui", fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Найз урих бүрд ₮10,000</div>
      <div style={{ fontFamily: "system-ui", fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>Найзаа урих бүрд та хоёулаа ₮10,000 тус бүр авна. Найзын эхний худалдан авалтын дараа шагнал ирнэ.</div>
    </div>

    {/* My code */}
    <div style={{ fontFamily: "system-ui", fontSize: 13, fontWeight: 600, color: T.textSub, marginBottom: 10 }}>Миний урилгын код</div>
    <Crd style={{ padding: "16px", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, background: T.s2, borderRadius: 10, padding: "12px 16px", fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: T.accent, letterSpacing: 2 }}>{myCode}</div>
        <button onClick={doCopy} style={{ background: copied ? T.green : T.accent, border: "none", borderRadius: 12, padding: "12px 18px", fontFamily: "system-ui", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", flexShrink: 0 }}>{copied ? <><span style={{ display: "flex", marginRight: 3 }}><IcCheck /></span>Хуулагдлаа</> : "Хуулах"}</button>
      </div>
      <div style={{ fontFamily: "system-ui", fontSize: 12, color: T.textSub, marginTop: 10, textAlign: "center" }}>Эсвэл холбоосыг хуваалцаарай</div>
      <PBtn full secondary onClick={() => { }} style={{ marginTop: 8 }}><span style={{ display: "flex", marginRight: 4 }}><IcLink /></span>Холбоос хуваалцах</PBtn>
    </Crd>

    {/* Stats */}
    <Crd style={{ display: "flex", marginBottom: 20 }}>
      {[["3", "Урьсан найз"], ["2", "Баталгаажсан"], ["₮" + earned.toLocaleString(), "Нийт шагнал"]].map((s, i) => <div key={i} style={{ flex: 1, textAlign: "center", padding: "16px 0", borderRight: i < 2 ? `1px solid ${T.border}` : "none" }}>
        <div style={{ fontFamily: "system-ui", fontSize: i === 2 ? 16 : 20, fontWeight: 800, color: i === 2 ? T.green : T.textH }}>{s[0]}</div>
        <div style={{ fontFamily: "system-ui", fontSize: 10, color: T.textSub, marginTop: 4 }}>{s[1]}</div>
      </div>)}
    </Crd>

    {/* How it works */}
    <div style={{ fontFamily: "system-ui", fontSize: 13, fontWeight: 700, color: T.textH, marginBottom: 12 }}>Хэрхэн ажилладаг вэ?</div>
    {[["1", "Кодоо хуваалц", "Найздаа код эсвэл холбоос илгээ"], ["2", "Найз бүртгүүлнэ", "Найзынхаа The TOONO бүртгэл нээхэд ашиглана"], ["3", "Хоёулаа шагнал авна", "Найзынхаа эхний худалдан авалтын дараа ₮10,000 тус бүр авна"]].map(s => <div key={s[0]} style={{ display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.accentSub, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui", fontSize: 13, fontWeight: 700, color: T.accent, flexShrink: 0 }}>{s[0]}</div>
      <div>
        <div style={{ fontFamily: "system-ui", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 2 }}>{s[1]}</div>
        <div style={{ fontFamily: "system-ui", fontSize: 12, color: T.textSub }}>{s[2]}</div>
      </div>
    </div>)}

    <div style={{ height: 1, background: T.border, margin: "16px 0" }} />
    <div style={{ fontFamily: "system-ui", fontSize: 13, fontWeight: 700, color: T.textH, marginBottom: 10 }}>Урьсан найзуудын жагсаалт</div>
    {history.map((h, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
      <div>
        <div style={{ fontFamily: "system-ui", fontSize: 13, fontWeight: 600, color: T.textH }}>{h.name}</div>
        <div style={{ fontFamily: "system-ui", fontSize: 11, color: T.textSub }}>{h.date}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontFamily: "system-ui", fontSize: 13, fontWeight: 700, color: h.reward > 0 ? T.green : T.textSub }}>{h.reward > 0 ? "+₮" + h.reward.toLocaleString() : "–"}</div>
        <div style={{ fontFamily: "system-ui", fontSize: 10, color: T.textSub }}>{h.status}</div>
      </div>
    </div>)}
  </Simple>;
}
