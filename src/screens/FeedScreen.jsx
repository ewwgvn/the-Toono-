"use client";

import { useState } from "react";
import { T } from "@/theme/colors";
import { GS } from "@/lib/store";
import { DB } from "@/lib/supabase";
import { getAllWorks, getCreators, fmtP } from "@/lib/utils";
import { IcSearch, IcBell, IcHeart, IcBookmark, IcDots, IcFeedEmpty } from "@/components/icons";
import Toono from "@/components/atoms/Toono";
import PBtn from "@/components/atoms/PBtn";

export default function FeedScreen({ nav, refresh, goBack }) {
  const [tick, setTick] = useState(0);
  const tLike = (id) => {
    const v = !GS.liked.has(id);
    v ? GS.liked.add(id) : GS.liked.delete(id);
    setTick(t => t + 1); refresh();
    if (GS.user.id) DB.toggleLike(GS.user.id, id);
  };
  const tSave = (id) => {
    const v = !GS.saved.has(id);
    v ? GS.saved.add(id) : GS.saved.delete(id);
    setTick(t => t + 1); refresh();
    if (GS.user.id) DB.toggleSave(GS.user.id, id);
  };

  const allCreators = getCreators();
  const followedCreators = allCreators.filter(c => GS.following.has(c.id));
  const allW = getAllWorks();

  const feedWorks = [
    ...GS.myWorks.map(w => ({ ...w, _self: true })),
    ...allW.filter(w => GS.following.has(w.creator_id) && w.creator_id !== GS.user.id),
  ];

  const stories = [
    { id: GS.user.id, name: "Миний", photo: GS.user.photo, accent: "#111111", _self: true },
    ...followedCreators.slice(0, 12),
  ];

  const FeedPost = ({ w, creator }) => {
    const liked = GS.liked.has(w.id);
    const saved = GS.saved.has(w.id);
    const img = w.images?.[0] || null;
    const [imgLoaded, setImgLoaded] = useState(false);
    return <div style={{ marginBottom: 0, borderBottom: `1px solid ${T.borderLight}` }}>
      {/* Header */}
      <div style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8 }}>
        <div onClick={() => creator?.id && nav("profile", { creatorId: creator.id })} style={{ width: 28, height: 28, borderRadius: "50%", background: "#F7F7F7", border: "1px solid #E5E5E5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", flexShrink: 0 }}>
          {creator?.photo ? <img src={creator.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Toono size={16} color="#111111" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{creator?.name || w.creator || "—"}</div>
        </div>
        <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 600, color: "#111111" }}>{fmtP(w)}</span>
      </div>

      {/* Image — compact */}
      <div onClick={() => nav("work", { workId: w.id })} style={{ width: "100%", aspectRatio: "16/10", background: img ? "#F7F7F7" : "#F7F7F7", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", position: "relative" }}>
        {img
          ? <img src={img} alt="" loading="lazy" onLoad={() => setImgLoaded(true)} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: imgLoaded ? 1 : 0, transition: "opacity .3s" }} />
          : <Toono size={48} color="#999999" />}
        {!imgLoaded && img && <div style={{ position: "absolute", inset: 0, background: "#F7F7F7", display: "flex", alignItems: "center", justifyContent: "center" }}><Toono size={32} color="#999999" /></div>}
      </div>

      {/* Actions */}
      <div style={{ padding: "6px 14px 2px", display: "flex", alignItems: "center", gap: 4 }}>
        <button onClick={() => tLike(w.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px 6px 4px 0", color: liked ? "#D32F2F" : "#111111" }}>
          <IcHeart filled={liked} />
        </button>
        <div style={{ flex: 1 }} />
        <button onClick={() => tSave(w.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px 0 4px 6px", color: saved ? "#111111" : "#999999" }}>
          <IcBookmark filled={saved} />
        </button>
      </div>

      {/* Caption */}
      <div style={{ padding: "0 14px 10px" }}>
        {w.likes_count > 0 && <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 600, color: "#111111", marginBottom: 2 }}>{(w.likes_count || 0).toLocaleString()} таалагдсан</div>}
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: "#333333", lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600, color: "#111111" }}>{creator?.name?.split(" ")[0] || w.creator || "—"} </span>
          <span>{w.title}</span>
        </div>
        {w.tags?.length > 0 && <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {w.tags.slice(0, 4).map(t => <span key={t} style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.accent }}>#{t}</span>)}
        </div>}
        <button onClick={() => nav("work", { workId: w.id })} style={{ marginTop: 8, width: "100%", background: T.accent, border: "none", borderRadius: 10, padding: "9px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>Авах</button>
      </div>
    </div>;
  };

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    {/* Header */}
    <div style={{ padding: "16px 16px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 24, fontWeight: 700, color: T.textH, letterSpacing: "-.5px" }}>toono</div>
      <div style={{ display: "flex", gap: 4 }}>
        <button onClick={() => nav("explore")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex", padding: 6 }}><IcSearch /></button>
        <button onClick={() => nav("notifications")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex", padding: 6, position: "relative" }}>
          <IcBell />
          {GS.unreadNotif > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: T.red }} />}
        </button>
      </div>
    </div>

    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
      {/* Stories */}
      <div style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", gap: 14, overflowX: "auto", scrollbarWidth: "none", padding: "0 14px" }}>
          {stories.map((s, i) => <div key={s.id || i} onClick={() => s._self ? null : nav("profile", { creatorId: s.id })} style={{ flexShrink: 0, textAlign: "center", cursor: s._self ? "default" : "pointer", width: 62 }}>
            <div style={{ position: "relative", width: 58, height: 58, margin: "0 auto 5px" }}>
              {/* Gradient ring */}
              <div style={{ position: "absolute", inset: -2, borderRadius: 20, background: s._self ? "none" : `linear-gradient(135deg,${s.accent || "#111111"},#999999)`, padding: 2 }}>
                <div style={{ width: "100%", height: "100%", borderRadius: 18, background: T.bg }} />
              </div>
              <div style={{ position: "absolute", inset: 2, borderRadius: 16, background: (s.accent || "#111111") + "22", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.photo ? <img src={s.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Toono size={28} color={s.accent || "#111111"} />}
              </div>
              {/* Add button for self */}
              {s._self && <div style={{ position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: T.accent, border: `2px solid ${T.bg}`, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => nav("upload")}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2v6M2 5h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </div>}
            </div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: T.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 58 }}>{s._self ? "Таны" : (s.name || "—").split(" ")[0]}</div>
          </div>)}
          {/* Discover more */}
          <div onClick={() => nav("explore")} style={{ flexShrink: 0, textAlign: "center", cursor: "pointer", width: 62 }}>
            <div style={{ width: 58, height: 58, margin: "0 auto 5px", borderRadius: 18, background: T.s1, border: `2px dashed ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSub }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 4v14M4 11h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: T.textSub }}>Дагах</div>
          </div>
        </div>
      </div>

      {/* Posts */}
      {feedWorks.length === 0
        ? <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: T.accentSub, border: `1px solid ${T.accentGlow}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><IcFeedEmpty /></div>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 17, fontWeight: 700, color: T.textH, marginBottom: 8 }}>Фийд хоосон байна</div>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textSub, lineHeight: 1.6, marginBottom: 20 }}>Бүтээлчийг дагаад тэдний шинэ<br />бүтээлийг энд харна уу</div>
          <PBtn onClick={() => nav("explore")}>Бүтээлч хайх</PBtn>
        </div>
        : feedWorks.map(w => {
          const creator = allCreators.find(c => c.id === w.creator_id) || { name: w.creator, photo: w.profiles?.photo || null, accent: w.accent || "#111111" };
          return <FeedPost key={w.id} w={w} creator={creator} />;
        })
      }
      <div style={{ height: 20 }} />
    </div>
  </div>;
}
