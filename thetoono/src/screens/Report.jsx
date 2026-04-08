"use client";
import { useState } from "react";
import { T } from "@/theme/colors";
import { IcBack } from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import { toast } from "@/components/layout/Toast";

export default function Report({ nav, goBack }) {
  const [type, setType] = useState("");
  const [details, setDetails] = useState("");

  const types = ["Залилан", "Зүй бус контент", "Хуурамч профайл", "Зохиогчийн эрхийн зөрчил", "Бусад"];

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    <div style={{ padding: "20px 20px 14px", display: "flex", alignItems: "center", gap: 10 }}>
      <button onClick={() => goBack ? goBack() : nav("home")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
      <div style={{ fontFamily: "system-ui", fontSize: 20, fontWeight: 800, color: T.textH }}>Мэдэгдэл</div>
    </div>
    <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
      <div style={{ fontFamily: "system-ui", fontSize: 14, color: T.textSub, marginBottom: 16 }}>Мэдэгдлийн төрлийг сонгоно уу</div>
      {types.map(t => <button key={t} onClick={() => setType(t)} style={{ width: "100%", textAlign: "left", background: type === t ? T.accentSub : T.s1, border: `1.5px solid ${type === t ? T.accent : T.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8, fontFamily: "system-ui", fontSize: 14, color: type === t ? T.accent : T.textH, cursor: "pointer" }}>{t}</button>)}
      <div style={{ marginTop: 16 }}>
        <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Дэлгэрэнгүй бичнэ үү..." style={{ width: "100%", minHeight: 120, background: T.s1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, fontFamily: "system-ui", fontSize: 14, color: T.textH, outline: "none", resize: "none", lineHeight: 1.7, boxSizing: "border-box" }} />
      </div>
      <div style={{ marginTop: 20, paddingBottom: 40 }}>
        <PBtn full disabled={!type} onClick={() => { toast("Мэдэгдэл амжилттай илгээгдлээ", "success"); goBack ? goBack() : nav("home"); }}>Илгээх</PBtn>
      </div>
    </div>
  </div>;
}
