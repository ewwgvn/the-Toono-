"use client";

import { useState, useEffect, memo } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady, fetchPublicData } from "@/lib/supabase";
import { getAllWorks, getCreators, fmtP } from "@/lib/utils";
import { IcSearch, IcBell, IcHeart, IcBookmark, IcDots, IcFeedEmpty, IcMsg } from "@/components/icons";
import Toono from "@/components/atoms/Toono";
import PBtn from "@/components/atoms/PBtn";

const F = "'Helvetica Neue', Arial, sans-serif";

// Extracted outside parent to prevent remounts on every parent re-render
const FeedPost = memo(function FeedPost({ w, creator, nav, tLike, tSave }) {
  const liked = GS.liked.has(w.id);
  const saved = GS.saved.has(w.id);
  const img = w.images?.[0] || null;
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgRatio, setImgRatio] = useState(null);
  return <div className="feed-post">
    {/* Header */}
    <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
      <div onClick={() => creator?.id && nav("profile", { creatorId: creator.id })} style={{ width: 32, height: 32, borderRadius: "50%", background: T.s2, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", flexShrink: 0 }}>
        {creator?.photo ? <img src={creator.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Toono size={18} color={T.textH} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: T.textH }}>{creator?.name || w.creator || "—"}</div>
        {creator?.field && <div style={{ fontFamily: F, fontSize: 11, color: T.textSub }}>{creator.field}</div>}
      </div>
      <button type="button" aria-label="Цэс" style={{ background: "none", border: "none", color: T.textSub, cursor: "pointer", display: "flex", padding: 4, fontSize: 18 }}>···</button>
    </div>

    {/* Image — keeps the photo's natural aspect ratio, no cropping */}
    <div onClick={() => nav("work", { workId: w.id })} style={{ width: "100%", background: T.s2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", position: "relative", minHeight: img ? 0 : 200 }}>
      {img
        ? <img src={img} alt={w.title} loading="lazy" onLoad={(e) => { setImgLoaded(true); const { naturalWidth: nw, naturalHeight: nh } = e.currentTarget; if (nw && nh) setImgRatio(`${nw}/${nh}`); }} style={{ width: "100%", height: "auto", maxHeight: "75vh", objectFit: "contain", display: "block", opacity: imgLoaded ? 1 : 0, transition: "opacity .3s" }} />
        : <Toono size={60} color={T.textSub} />}
      {!imgLoaded && img && <div style={{ position: "absolute", inset: 0, background: T.s2, display: "flex", alignItems: "center", justifyContent: "center" }}><Toono size={40} color={T.textSub} /></div>}
    </div>

    {/* Actions */}
    <div style={{ padding: "10px 16px 4px", display: "flex", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flex: 1 }}>
        <button type="button" aria-label={liked ? "Таалагдсаныг болиулах" : "Таалагдлаа"} aria-pressed={liked} onClick={() => tLike(w.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, color: liked ? T.red : T.textH }}>
          <IcHeart filled={liked} />
        </button>
        <button type="button" aria-label="Сэтгэгдэл" onClick={() => nav("work", { workId: w.id })} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, color: T.textH }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2.5 3H17.5V13.5H11L8 16.5V13.5H2.5V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
        </button>
        <button type="button" aria-label="Хуваалцах" onClick={() => { const url = `${window.location.origin}?work=${w.id}`; if (navigator.share) navigator.share({ title: w.title, url }); else if (navigator.clipboard) navigator.clipboard.writeText(url); }} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, color: T.textH }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M15 7L10 2L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 2V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M3 11V16H17V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <button type="button" aria-label={saved ? "Хадгалсныг болиулах" : "Хадгалах"} aria-pressed={saved} onClick={() => tSave(w.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0, color: saved ? T.textH : T.textSub }}>
        <IcBookmark filled={saved} />
      </button>
    </div>

    {/* Caption */}
    <div style={{ padding: "0 16px 12px" }}>
      {((w.likes_count || w.likes || 0) > 0) && <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: T.textH, marginBottom: 4 }}>{(w.likes_count || w.likes || 0).toLocaleString()} таалагдсан</div>}
      <div style={{ fontFamily: F, fontSize: 13, color: T.textB, lineHeight: 1.5 }}>
        <span style={{ fontWeight: 600, color: T.textH }}>{creator?.name || w.creator || "—"} </span>
        {w.title}{(w.description || w.desc) ? ` — ${(w.description || w.desc).slice(0, 60)}` : ""}
      </div>
      {w.tags?.length > 0 && <div style={{ marginTop: 3 }}>
        {w.tags.slice(0, 4).map(t => <span key={t} style={{ fontFamily: F, fontSize: 12, color: T.textSub, marginRight: 4 }}>#{t}</span>)}
      </div>}
      <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: T.textH, marginTop: 6 }}>{fmtP(w)}</div>
    </div>
  </div>;
});

export default function FeedScreen({ nav, refresh, goBack }) {
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(GS.publicWorks.length === 0);

  // Fetch public works if empty (after store.js optimization)
  useEffect(() => {
    if (GS.publicWorks.length > 0) { setLoading(false); return; }
    if (!isSupabaseReady()) { setLoading(false); return; }
    fetchPublicData().finally(() => setLoading(false));
  }, []);

  const tLike = (id) => {
    const v = !GS.liked.has(id);
    v ? GS.liked.add(id) : GS.liked.delete(id);
    saveGS(); setTick(t => t + 1); refresh();
    if (GS.user.id) DB.toggleLike(GS.user.id, id);
  };
  const tSave = (id) => {
    const v = !GS.saved.has(id);
    v ? GS.saved.add(id) : GS.saved.delete(id);
    saveGS(); setTick(t => t + 1); refresh();
    if (GS.user.id) DB.toggleSave(GS.user.id, id);
  };

  const allCreators = getCreators();
  const followedCreators = allCreators.filter(c => GS.following.has(c.id));
  const allW = getAllWorks();
  const isFollowingNobody = GS.following.size === 0;

  const feedWorks = isFollowingNobody
    // No following yet → show all public works as "recommended"
    ? allW.filter(w => w.creator_id !== GS.user.id).slice(0, 30)
    : [
        ...GS.myWorks.map(w => ({ ...w, _self: true })),
        ...allW.filter(w => w.creator_id && GS.following.has(w.creator_id) && w.creator_id !== GS.user.id),
      ];

  const stories = [
    { id: GS.user.id, name: "Миний", photo: GS.user.photo, accent: T.textH, _self: true },
    ...followedCreators.slice(0, 12),
  ];

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    {/* Header */}
    <div style={{ padding: "16px 16px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 24, fontWeight: 800, color: T.textH, letterSpacing: "-0.02em" }}>Фийд</div>
      <div style={{ display: "flex", gap: 2 }}>
        <button type="button" aria-label="Зурвас" className="toono-pressable" onClick={() => nav("chat")} style={{ position: "relative", width: 36, height: 36, borderRadius: 10, background: "transparent", border: "none", color: T.textH, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IcMsg />
          {GS.unreadChat > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: T.red, border: "1.5px solid #fff" }} />}
        </button>
        <button type="button" aria-label="Мэдэгдэл" className="toono-pressable" onClick={() => nav("notifications")} style={{ position: "relative", width: 36, height: 36, borderRadius: 10, background: "transparent", border: "none", color: T.textH, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IcBell />
          {GS.unreadNotif > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: T.red, border: "1.5px solid #fff" }} />}
        </button>
      </div>
    </div>

    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
      {/* Stories */}
      <div style={{ padding: "12px 0", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", gap: 14, overflowX: "auto", scrollbarWidth: "none", padding: "0 14px" }}>
          {stories.map((s, i) => <div key={s.id || i} onClick={() => s._self ? nav("upload") : nav("profile", { creatorId: s.id })} style={{ flexShrink: 0, textAlign: "center", cursor: "pointer", width: 62 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: T.s2, border: `2px solid ${s._self ? T.border : T.textH}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 5px", overflow: "hidden" }}>
              {s.photo ? <img src={s.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : s._self ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 4v10M4 9h10" stroke={T.textDim} strokeWidth="1.5" strokeLinecap="round"/></svg> : <Toono size={24} color={T.textH} />}
            </div>
            <div style={{ fontFamily: F, fontSize: 10, color: T.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 58 }}>{s._self ? "Таны" : (s.name || "—").split(" ")[0]}</div>
          </div>)}
          <div onClick={() => nav("explore")} style={{ flexShrink: 0, textAlign: "center", cursor: "pointer", width: 62 }}>
            <div style={{ width: 48, height: 48, margin: "0 auto 5px", borderRadius: "50%", background: T.s1, border: `2px dashed ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: T.textSub }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </div>
            <div style={{ fontFamily: F, fontSize: 10, color: T.textSub }}>Дагах</div>
          </div>
        </div>
      </div>

      {/* Recommended banner when not following anyone */}
      {isFollowingNobody && !loading && feedWorks.length > 0 && (
        <div style={{ padding: "10px 16px", background: T.accentSub, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: F, fontSize: 12, color: T.accent, fontWeight: 600 }}>Санал болгох бүтээлүүд — Бүтээлч дагаж өөрийн фийд үүсгэнэ үү</div>
        </div>
      )}

      {/* Posts */}
      {loading
        ? <div style={{ padding: "60px 20px", textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>Ачааллаж байна...</div>
        : feedWorks.length === 0
          ? <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ width: 72, height: 72, borderRadius: 22, background: T.accentSub, border: `1px solid ${T.accentGlow}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}><IcFeedEmpty /></div>
              <div style={{ fontFamily: F, fontSize: 17, fontWeight: 700, color: T.textH, marginBottom: 8 }}>Фийд хоосон байна</div>
              <div style={{ fontFamily: F, fontSize: 13, color: T.textSub, lineHeight: 1.6, marginBottom: 20 }}>Бүтээлчийг дагаад тэдний шинэ<br />бүтээлийг энд харна уу</div>
              <PBtn onClick={() => nav("explore")}>Бүтээлч хайх</PBtn>
            </div>
          : <div className="feed-grid">
              {feedWorks.map(w => {
                const creator = allCreators.find(c => c.id === w.creator_id) || { name: w.creator, photo: w.profiles?.photo || null, field: "" };
                return <FeedPost key={w.id} w={w} creator={creator} nav={nav} tLike={tLike} tSave={tSave} />;
              })}
            </div>
      }
      <div style={{ height: 20 }} />
    </div>
  </div>;
}
