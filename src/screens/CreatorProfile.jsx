"use client";

import React, { useState } from "react";
import Image from "next/image";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { getCreators } from "@/lib/utils";
import { toast } from "@/components/layout/Toast";
import { IcBack, IcShare, IcDots, IcMsg } from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Toono from "@/components/atoms/Toono";
import { SCRIPT } from "@/components/shared/Editorial";

const HELV = "'Helvetica Neue', Arial, sans-serif";

// Centered editorial label (blue uppercase, like "SELECTED CONTENT")
function CenterLabel({ children, mt = 0 }) {
  return <div style={{ fontFamily: HELV, fontSize: 11, fontWeight: 700, letterSpacing: "0.26em", textTransform: "uppercase", color: T.accent, textAlign: "center", marginTop: mt, marginBottom: 20 }}>{children}</div>;
}

function Diamond({ size = 7 }) {
  return <span style={{ display: "inline-block", width: size, height: size, background: T.accent, transform: "rotate(45deg)" }} />;
}

function StarSellerBadge() {
  const met = GS.trustMetrics;
  if (!(met.responseRate >= 95 && met.onTimeRate >= 95 && met.avgRating >= 4.8)) return null;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.accent, borderRadius: 20, padding: "4px 11px" }}>
    <svg width={10} height={10} viewBox="0 0 12 12" fill="#fff"><path d="M6 1L7.4 4.2H10.8L8 6.4L9.2 9.6L6 7.6L2.8 9.6L4 6.4L1.2 4.2H4.6Z" /></svg>
    <span style={{ fontFamily: HELV, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", color: "#fff" }}>STAR SELLER</span>
  </span>;
}

// Work image (color, never grayscale)
function WorkImg({ w, radius = 4 }) {
  return <div style={{ width: "100%", height: "100%", background: T.s2, borderRadius: radius, overflow: "hidden" }}>
    {w?.images?.[0]
      ? <img src={w.images[0]} alt={w.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Toono size={28} color={T.borderMid} /></div>}
  </div>;
}

export default function CreatorProfile({ nav, refresh, goBack, creatorId }) {
  const localCreator = getCreators().find(x => x.id === creatorId) || null;
  const [creator, setCreator] = useState(localCreator || { id: creatorId, name: "...", field: "", followers: "0", works: 0, comm: false, rating: 0, accent: T.accent, bio: "", tags: [] });
  const [creatorWorks, setCreatorWorks] = useState(null);

  React.useEffect(() => {
    if (!creatorId) return;
    if (creatorId === GS.user.id) {
      setCreator({ id: GS.user.id || 1, name: GS.user.name, field: GS.user.field || "Бүтээлч", followers: GS.user.followers || "0", works: GS.myWorks.length, comm: GS.user.commOpen, rating: GS.trustMetrics?.avgRating || 0, accent: T.accent, bio: GS.user.bio, tags: GS.user.tags || [], photo: GS.user.photo || null });
      setCreatorWorks(GS.myWorks);
      return;
    }
    if (isSupabaseReady()) {
      DB.getProfile(creatorId).then(async p => {
        if (p) {
          const fc = await DB.getFollowerCount(creatorId).catch(() => 0);
          setCreator({ id: p.id, name: p.name || "—", field: p.field || "Бүтээлч", photo: p.photo || null, followers: String(fc), works: 0, comm: p.comm_open || false, rating: p.rating || 0, accent: T.accent, bio: p.bio || "", tags: p.tags || [] });
        }
      }).catch(() => {});
      DB.getWorks({ creator_id: creatorId }).then(ws => {
        setCreatorWorks(ws.map(w => ({ ...w, creator: w.profiles?.name || w.creator || "—" })));
        setCreator(prev => ({ ...prev, works: ws.length }));
      }).catch(() => setCreatorWorks([]));
    }
  }, [creatorId]);

  const c = creator;
  const isOwn = creatorId === GS.user.id;
  const [followerCount, setFollowerCount] = useState(parseInt(c.followers) || 0);
  const [followingCount, setFollowingCount] = useState(0);
  const isFollowing = GS.following.has(c.id);

  const tFollow = () => {
    if (isFollowing) { GS.following.delete(c.id); setFollowerCount(p => Math.max(0, p - 1)); }
    else { GS.following.add(c.id); setFollowerCount(p => p + 1); }
    saveGS(); refresh(); if (GS.user.id && c.id) DB.toggleFollow(GS.user.id, c.id);
  };

  const startChat = async () => {
    let convo = GS.conversations.find(cv => (c.id && cv.creatorId === c.id) || cv.name === c.name);
    if (!convo) { convo = { id: Date.now(), creatorId: c.id || null, name: c.name, accent: c.accent || T.accent, online: false, unread: 0, msgs: [] }; GS.conversations.unshift(convo); saveGS(); }
    if (isSupabaseReady() && GS.user.id && c.id && GS.user.id !== c.id) {
      const dbConvo = await DB.getOrCreateConversation(GS.user.id, c.id);
      if (dbConvo) convo.dbId = dbConvo.id;
    }
    GS.activeChatId = convo.id; refresh(); nav("chatroom");
  };

  React.useEffect(() => {
    if (creatorId && isSupabaseReady()) {
      DB.getFollowerCount(creatorId).then(n => setFollowerCount(n));
      DB.getFollowingCount(creatorId).then(n => setFollowingCount(n));
    }
  }, [creatorId]);

  const works = creatorWorks || [];
  const featured = works[0] || null;
  const gallery = works.slice(1);
  const tags = (c.tags || GS.user.tags || []).filter(Boolean);
  const bio = c.bio || (isOwn ? GS.user.bio : "");

  // Bento uses first 2 gallery works + 1 blue accent tile; rest in grid
  const bento = gallery.slice(0, 2);
  const gridRest = gallery.slice(2);

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    {/* ── Top bar ── */}
    <div style={{ padding: "16px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
      <button type="button" onClick={() => goBack ? goBack() : nav("home")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" onClick={() => { const url = `${location.origin}?creator=${c.id}`; navigator.clipboard?.writeText(url).catch(() => {}); toast("Профайлын холбоос хуулагдлаа", "success"); }} style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, display: "flex" }}><IcShare /></button>
        <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, display: "flex" }}><IcDots /></button>
      </div>
    </div>

    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>

      {/* ════ HERO — color circle, name below ════ */}
      <div style={{ padding: "30px 24px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 148, height: 148, borderRadius: "50%", overflow: "hidden", background: T.s2, position: "relative" }}>
          {c.photo
            ? (c.photo.startsWith("data:")
                ? <img src={c.photo} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <Image src={c.photo} fill alt={c.name} sizes="148px" style={{ objectFit: "cover" }} />)
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Toono size={56} color={T.textDim} /></div>}
        </div>
        <div style={{ fontFamily: HELV, fontSize: 27, fontWeight: 800, color: T.textH, letterSpacing: "-0.02em", lineHeight: 1.1, marginTop: 18, textAlign: "center", wordBreak: "break-word" }}>{c.name || "..."}</div>
        <div style={{ fontFamily: HELV, fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: T.textDim, marginTop: 8 }}>{c.field || "БҮТЭЭЛЧ"}</div>
        {c.rating >= 4.8 && <div style={{ marginTop: 12 }}><StarSellerBadge /></div>}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
          {isOwn ? (
            <button type="button" onClick={() => nav("edit-profile")} style={linkBtn}>ПРОФАЙЛ ЗАСАХ</button>
          ) : (
            <>
              <button type="button" onClick={tFollow} style={{ ...linkBtn, color: isFollowing ? T.textDim : T.accent }}>{isFollowing ? "ДАГАЖ БАЙНА" : "ДАГАХ"}</button>
              <Diamond size={5} />
              <button type="button" onClick={startChat} style={linkBtn}>ЗУРВАС</button>
            </>
          )}
        </div>
      </div>

      {/* ════ STATS — hairline row ════ */}
      <div style={{ display: "flex", padding: "20px 0", margin: "22px 24px 0", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        {[
          [String(works.length || c.works || 0), "БҮТЭЭЛ", null],
          [String(followerCount), "ДАГАГЧ", () => { GS.viewingFollowsUserId = creatorId; GS.viewingFollowsTab = "followers"; nav("follows"); }],
          [String(followingCount), "ДАГАЖ БУЙ", () => { GS.viewingFollowsUserId = creatorId; GS.viewingFollowsTab = "following"; nav("follows"); }],
        ].map((s, i) => (
          <div key={s[1]} onClick={s[2] || undefined} style={{ flex: 1, textAlign: "center", borderLeft: i > 0 ? `1px solid ${T.border}` : "none", cursor: s[2] ? "pointer" : "default" }}>
            <div style={{ fontFamily: SCRIPT, fontSize: 32, fontWeight: 700, color: T.accent, lineHeight: 1 }}>{s[0]}</div>
            <div style={{ fontFamily: HELV, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.14em", color: T.textDim, marginTop: 5 }}>{s[1]}</div>
          </div>
        ))}
      </div>

      {/* bio */}
      {bio && <div style={{ padding: "22px 30px 0", fontFamily: HELV, fontSize: 13.5, color: T.textB, lineHeight: 1.85, textAlign: "center" }}>{bio}</div>}

      {/* ════ FEATURED — side-text editorial (title | image | buy) ════ */}
      {featured && (
        <div style={{ padding: "34px 20px 8px" }}>
          <CenterLabel>Онцлох бүтээл</CenterLabel>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            {/* left text */}
            <div style={{ flex: 1, textAlign: "right", minWidth: 0 }}>
              <div style={{ fontFamily: HELV, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.04em", color: T.textH, lineHeight: 1.4, textTransform: "uppercase" }}>{featured.title}</div>
              <div style={{ fontFamily: HELV, fontSize: 12, color: T.textDim, marginTop: 6 }}>{featured.price > 0 ? `₮${Number(featured.price).toLocaleString()}` : "Захиалга"}</div>
            </div>
            {/* center image */}
            <div onClick={() => nav("work", { workId: featured.id })} className="toono-card-tap" style={{ width: 132, flexShrink: 0, cursor: "pointer" }}>
              <div style={{ width: "100%", aspectRatio: "3/4" }}><WorkImg w={featured} /></div>
            </div>
            {/* right buy */}
            <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
              <div style={{ fontFamily: SCRIPT, fontSize: 22, fontWeight: 700, color: T.accent, lineHeight: 1 }}>{featured.price > 0 ? `₮${Number(featured.price).toLocaleString()}` : "Захиалга"}</div>
              <div style={{ fontFamily: HELV, fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: T.textDim, marginTop: 3, textTransform: "uppercase" }}>Үнэгүй хүргэлт</div>
              <div style={{ width: 1, height: 22, background: T.border, margin: "10px 0" }} />
              <button type="button" onClick={() => nav("work", { workId: featured.id })} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Diamond size={6} />
                <span style={{ fontFamily: HELV, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: T.accent }}>ХАРАХ →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ SELECTED WORKS — asymmetric bento + grid ════ */}
      <div style={{ padding: "36px 16px 8px" }}>
        <CenterLabel>Selected Works</CenterLabel>
        {creatorWorks === null
          ? <div style={{ padding: "40px 0", textAlign: "center", fontFamily: HELV, fontSize: 13, color: T.textDim }}>Уншиж байна...</div>
          : works.length === 0
            ? <div style={{ padding: "40px 0", textAlign: "center", fontFamily: HELV, fontSize: 13, color: T.textDim }}>Бүтээл байхгүй байна</div>
            : <>
                {/* bento: tall left + (small right top, blue tile right bottom) */}
                {bento.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gridTemplateRows: "auto auto", gap: 8, marginBottom: 8 }}>
                    <div onClick={() => nav("work", { workId: bento[0].id })} className="toono-card-tap" style={{ gridRow: "1 / 3", cursor: "pointer" }}><WorkImg w={bento[0]} /></div>
                    {bento[1]
                      ? <div onClick={() => nav("work", { workId: bento[1].id })} className="toono-card-tap" style={{ aspectRatio: "1", cursor: "pointer" }}><WorkImg w={bento[1]} /></div>
                      : <div style={{ aspectRatio: "1" }} />}
                    {/* blue accent tile — creator field/tag */}
                    <div style={{ aspectRatio: "1", background: T.accent, borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12, textAlign: "center" }}>
                      <span style={{ fontFamily: HELV, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", lineHeight: 1.3 }}>{c.field || tags[0] || "Studio"}</span>
                      <span style={{ fontFamily: HELV, fontSize: 9, fontWeight: 500, letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)", marginTop: 6, textTransform: "uppercase" }}>{works.length} бүтээл</span>
                    </div>
                  </div>
                )}
                {/* rest — uniform 2-col */}
                {gridRest.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {gridRest.map((w, i) => (
                      <div key={w.id || i} onClick={() => nav("work", { workId: w.id })} className="toono-card-tap" style={{ cursor: "pointer" }}>
                        <div style={{ aspectRatio: "1" }}><WorkImg w={w} /></div>
                        <div style={{ fontFamily: HELV, fontSize: 11.5, fontWeight: 600, color: T.textH, marginTop: 7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</div>
                        <div style={{ fontFamily: HELV, fontSize: 11, color: T.textDim, marginTop: 1 }}>{w.price > 0 ? `₮${Number(w.price).toLocaleString()}` : "Захиалга"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>}
        {isOwn && works.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <button type="button" onClick={() => nav("portfolio")} style={linkBtn}>ПОРТФОЛИО →</button>
          </div>
        )}
      </div>

      {/* ════ COMMISSION ════ */}
      {c.comm && !isOwn && (
        <div style={{ padding: "36px 20px 8px" }}>
          <CenterLabel>Commission</CenterLabel>
          <div onClick={() => nav("commission", { creatorId: c.id })} style={{ background: T.accentSub, border: `1px solid ${T.border}`, borderRadius: 4, padding: "24px 20px", cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontFamily: SCRIPT, fontSize: 34, fontWeight: 700, color: T.accent, lineHeight: 1 }}>Захиалга нээлттэй</div>
            <div style={{ fontFamily: HELV, fontSize: 12.5, color: T.textSub, lineHeight: 1.7, margin: "12px auto 16px", maxWidth: 280 }}>Бүтээлчтэй шууд холбогдож захиалгын нөхцлийг тохироорой.</div>
            <span style={{ fontFamily: HELV, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: T.accent }}>ЗАХИАЛГА ИЛГЭЭХ →</span>
          </div>
        </div>
      )}

      {/* ════ ABOUT ════ */}
      <div style={{ padding: "36px 20px 8px" }}>
        <CenterLabel>About</CenterLabel>
        {[
          ["Мэргэшил", c.field || GS.user.field || "—"],
          ["Нийт бүтээл", String(works.length || c.works || 0) + "ш"],
          ["Үнэлгээ", c.rating > 0 ? (Number(c.rating).toFixed(1) + " ★") : "—"],
          ["Дагагч", String(followerCount) + "хн"],
        ].map(r => (
          <div key={r[0]} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${T.s2}` }}>
            <span style={{ fontFamily: HELV, fontSize: 12.5, color: T.textDim, letterSpacing: "0.02em" }}>{r[0]}</span>
            <span style={{ fontFamily: HELV, fontSize: 13, fontWeight: 600, color: T.textH }}>{r[1]}</span>
          </div>
        ))}
        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: "16px 0 0", justifyContent: "center" }}>
            {tags.map(t => <span key={t} style={{ fontFamily: HELV, fontSize: 11.5, fontWeight: 500, color: T.textB, border: `1px solid ${T.border}`, padding: "6px 14px", borderRadius: 20 }}>{t}</span>)}
          </div>
        )}
      </div>

      {/* ════ DARK FOOTER ════ */}
      <div style={{ marginTop: 36, background: "#111111", padding: "44px 28px calc(44px + env(safe-area-inset-bottom,0px))", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: HELV, fontSize: 10, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>{isOwn ? "Таны дэлгүүр" : "Бүтээлчтэй холбогдох"}</div>
        <div style={{ fontFamily: SCRIPT, fontSize: 54, fontWeight: 700, color: "#fff", lineHeight: 1, marginTop: 8, textAlign: "center", wordBreak: "break-word" }}>{c.name || "Uliger"}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 24, width: "100%", maxWidth: 300 }}>
          {isOwn
            ? <PBtn full onClick={() => nav("edit-profile")}>Профайл засах</PBtn>
            : <>
                <button type="button" onClick={startChat} style={{ width: 46, height: 46, borderRadius: 23, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", flexShrink: 0 }}><IcMsg /></button>
                <button type="button" onClick={tFollow} style={{ flex: 1, height: 46, borderRadius: 23, background: isFollowing ? "transparent" : "#fff", border: isFollowing ? "1px solid rgba(255,255,255,0.3)" : "none", color: isFollowing ? "#fff" : "#111", fontFamily: HELV, fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em" }}>{isFollowing ? "Дагаж байна" : "Дагах"}</button>
              </>}
        </div>
        <div style={{ marginTop: 28, fontFamily: HELV, fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>ULIGER WORLD · 2026</div>
      </div>
    </div>

    {/* sticky commission CTA */}
    {c.comm && !isOwn && (
      <div style={{ padding: "12px 20px calc(16px + env(safe-area-inset-bottom,0px))", background: "#FFFFFF", borderTop: `1px solid ${T.border}` }}>
        <PBtn full onClick={() => nav("commission", { creatorId: c.id })}>Захиалга өгөх</PBtn>
      </div>
    )}
  </div>;
}

const linkBtn = { background: "none", border: "none", cursor: "pointer", fontFamily: HELV, fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: T.accent, padding: 0 };
