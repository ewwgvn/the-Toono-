"use client";
import { useState } from "react";
import { GS } from "@/lib/store";
import { DB } from "@/lib/supabase";
import { getAllWorks, getCreators } from "@/lib/utils";
import Toono from "@/components/atoms/Toono";
import Avt from "@/components/atoms/Avt";
import PBtn from "@/components/atoms/PBtn";
import WorkCard from "@/components/shared/WorkCard";
import { IcCart, IcBell, IcSearch } from "@/components/icons";

const F = "'Helvetica Neue', Arial, sans-serif";

export default function Home({ nav, refresh }) {
  const [cat, setCat] = useState("all");
  const cats = ["all", "Fashion Design", "Interior Design", "Jewelry Design", "Industrial Design", "Graphic Design", "Textile Design", "Fine Art", "3D Design", "Photography"];
  const allW = getAllWorks();
  const filtered = cat === "all" ? allW : allW.filter(w => w.cat === cat);
  const tSave = id => { GS.saved.has(id) ? GS.saved.delete(id) : GS.saved.add(id); refresh(); if (GS.user.id) DB.toggleSave(GS.user.id, id); };

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FFFFFF" }}>

    {/* Header — mobile only */}
    <div className="toono-mobile-nav" style={{ padding: "12px 16px", justifyContent: "space-between", alignItems: "center", background: "#FFFFFF", flexShrink: 0, zIndex: 10, paddingTop: "max(12px, env(safe-area-inset-top, 12px))", borderBottom: "1px solid #F0F0F0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Toono size={22} color="#111111" />
        <div style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: "#111111", letterSpacing: "0.05em", textTransform: "uppercase" }}>The TOONO</div>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button onClick={() => nav("cart")} style={{ position: "relative", width: 32, height: 32, borderRadius: 8, background: "transparent", border: "1px solid #E5E5E5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111111" }}>
          <IcCart />
          {GS.cart.length > 0 && <div style={{ position: "absolute", top: -3, right: -3, minWidth: 14, height: 14, borderRadius: 7, background: "#D32F2F", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: F, fontSize: 8, fontWeight: 600, color: "#fff" }}>{GS.cart.length}</span></div>}
        </button>
        <button onClick={() => nav("notifications")} style={{ position: "relative", width: 32, height: 32, borderRadius: 8, background: "transparent", border: "1px solid #E5E5E5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111111" }}>
          <IcBell />
          {GS.unreadNotif > 0 && <div style={{ position: "absolute", top: -3, right: -3, width: 6, height: 6, borderRadius: 3, background: "#D32F2F" }} />}
        </button>
      </div>
    </div>

    {/* Search bar */}
    <div style={{ padding: "12px 16px" }}>
      <button onClick={() => nav("explore")} style={{ width: "100%", background: "#F7F7F7", border: "1px solid #E5E5E5", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", textAlign: "left" }}>
        <span style={{ color: "#999999", display: "flex" }}><IcSearch /></span>
        <span style={{ fontFamily: F, fontSize: 13, color: "#999999" }}>Хайлт...</span>
      </button>
    </div>

    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>

      {/* Category filter */}
      <div style={{ padding: "0 16px 16px", display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none" }}>
        {cats.map(c => <button key={c} onClick={() => setCat(c)} style={{
          flexShrink: 0, padding: "6px 14px", borderRadius: 20, cursor: "pointer",
          fontFamily: F, fontSize: 13, fontWeight: 500,
          background: cat === c ? "#111111" : "transparent",
          border: `1px solid ${cat === c ? "#111111" : "#E5E5E5"}`,
          color: cat === c ? "#FFFFFF" : "#666666",
          transition: "all 150ms ease",
        }}>{c === "all" ? "Бүгд" : c}</button>)}
      </div>

      {/* 2-col Grid */}
      {filtered.length > 0 ? <div className="toono-grid-2" style={{ padding: "0 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 14px", marginBottom: 24 }}>
        {filtered.map(w => <WorkCard key={w.id} work={w} onClick={() => nav("work", { workId: w.id })} onToggleSave={tSave} saved={GS.saved.has(w.id)} />)}
      </div>
      : <div style={{ padding: "60px 16px", textAlign: "center" }}>
          <div style={{ fontFamily: F, fontSize: 16, fontWeight: 600, color: "#111111", marginBottom: 8 }}>{GS.currentRole === "creator" ? "Бүтээлээ байршуулаарай" : "Бүтээлч нарыг олж нээрэй"}</div>
          <div style={{ fontFamily: F, fontSize: 14, color: "#666666", marginBottom: 20, lineHeight: 1.6 }}>{GS.currentRole === "creator" ? "Эхний бүтээлээ байршуулж, The TOONO-д таниулаарай" : "Монгол бүтээлчдийн бүтээлийг нээн илрүүлээрэй"}</div>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            {GS.currentRole === "creator" && <PBtn onClick={() => nav("upload")}>Бүтээл байршуулах</PBtn>}
            <PBtn secondary onClick={() => nav("explore")}>Бүтээлч хайх</PBtn>
          </div>
        </div>}

      {/* Creators row */}
      <div style={{ padding: "0 16px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: F, fontSize: 16, fontWeight: 600, color: "#111111" }}>Бүтээлчид</div>
          <button onClick={() => nav("explore")} style={{ background: "none", border: "none", fontFamily: F, fontSize: 13, color: "#666666", cursor: "pointer" }}>Бүгдийг харах</button>
        </div>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", scrollbarWidth: "none", paddingBottom: 4 }}>
          {getCreators().slice(0, 6).map(c => <div key={c.id} onClick={() => nav("profile", { creatorId: c.id })} style={{ flexShrink: 0, textAlign: "center", cursor: "pointer", width: 64 }}>
            <Avt size={48} photo={c.photo} onClick={() => nav("profile", { creatorId: c.id })} />
            <div style={{ fontFamily: F, fontSize: 11, fontWeight: 500, color: "#111111", marginTop: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name.split(" ")[0]}</div>
          </div>)}
        </div>
      </div>

      <div style={{ height: 90 }} />
    </div>
  </div>;
}
