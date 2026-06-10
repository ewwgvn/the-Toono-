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
import { SectionLabel, ScriptTitle, Kicker, Diamond, AccentTile, SCRIPT } from "@/components/shared/Editorial";

const HELV = "'Helvetica Neue', Arial, sans-serif";

function StarSellerBadge() {
  const met = GS.trustMetrics;
  const isStarSeller = met.responseRate >= 95 && met.onTimeRate >= 95 && met.avgRating >= 4.8;
  if (!isStarSeller) return null;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: T.accent, borderRadius: 20, padding: "4px 11px" }}>
    <svg width={10} height={10} viewBox="0 0 12 12" fill="#fff"><path d="M6 1L7.4 4.2H10.8L8 6.4L9.2 9.6L6 7.6L2.8 9.6L4 6.4L1.2 4.2H4.6Z" /></svg>
    <span style={{ fontFamily: HELV, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", color: "#fff" }}>STAR SELLER</span>
  </span>;
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
  const rest = works.slice(1);
  const tags = (c.tags || GS.user.tags || []).filter(Boolean);
  const bio = c.bio || (isOwn ? GS.user.bio : "");

  const photoEl = (size, grayscale) => (
    <div style={{ width: size, height: size, borderRadius: "50%", overflow: "hidden", background: T.s2, position: "relative", flexShrink: 0 }}>
      {c.photo
        ? (c.photo.startsWith("data:")
            ? <img src={c.photo} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover", filter: grayscale ? "grayscale(1)" : "none" }} />
            : <Image src={c.photo} fill alt={c.name} sizes={`${size}px`} style={{ objectFit: "cover", filter: grayscale ? "grayscale(1)" : "none" }} />)
        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Toono size={Math.round(size * 0.4)} color={T.textDim} /></div>}
    </div>
  );

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    {/* ── Top bar ── */}
    <div style={{ padding: "16px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
      <button type="button" onClick={() => goBack ? goBack() : nav("home")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><IcBack /></button>
      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" onClick={() => { const url = `${location.origin}?creator=${c.id}`; navigator.clipboard?.writeText(url).catch(() => {}); toast("Профайлын холбоос хуулагдлаа", "success"); }} style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, display: "flex" }}><IcShare /></button>
        <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, display: "flex" }}><IcDots /></button>
      </div>
    </div>

    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>

      {/* ════ HERO ════ */}
      <div style={{ padding: "28px 24px 8px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        {photoEl(150, true)}
        <ScriptTitle size={56} style={{ marginTop: 16, maxWidth: "100%", wordBreak: "break-word" }}>{c.name || "..."}</ScriptTitle>
        <div style={{ fontFamily: HELV, fontSize: 11, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: T.textDim, marginTop: 8 }}>{c.field || "БҮТЭЭЛЧ"}</div>
        {c.rating >= 4.8 && <div style={{ marginTop: 12 }}><StarSellerBadge /></div>}

        {/* action links row (editorial small links) */}
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 18 }}>
          {isOwn ? (
            <button type="button" onClick={() => nav("edit-profile")} style={linkBtn}>ПРОФАЙЛ ЗАСАХ</button>
          ) : (
            <>
              <button type="button" onClick={tFollow} style={{ ...linkBtn, color: isFollowing ? T.textDim : T.accent }}>{isFollowing ? "ДАГАЖ БАЙНА" : "ДАГАХ"}</button>
              <span style={{ color: T.border }}>·</span>
              <button type="button" onClick={startChat} style={linkBtn}>ЗУРВАС</button>
            </>
          )}
        </div>
      </div>

      {/* ════ STATS ════ */}
      <div style={{ display: "flex", justifyContent: "center", gap: 0, padding: "20px 24px", margin: "0 24px", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
        {[
          [String(works.length || c.works || 0), "БҮТЭЭЛ", null],
          [String(followerCount), "ДАГАГЧ", () => { GS.viewingFollowsUserId = creatorId; GS.viewingFollowsTab = "followers"; nav("follows"); }],
          [String(followingCount), "ДАГАЖ БУЙ", () => { GS.viewingFollowsUserId = creatorId; GS.viewingFollowsTab = "following"; nav("follows"); }],
        ].map((s, i) => (
          <div key={s[1]} onClick={s[2] || undefined} style={{ flex: 1, textAlign: "center", borderLeft: i > 0 ? `1px solid ${T.border}` : "none", cursor: s[2] ? "pointer" : "default" }}>
            <div style={{ fontFamily: SCRIPT, fontSize: 30, fontWeight: 700, color: T.accent, lineHeight: 1 }}>{s[0]}</div>
            <div style={{ fontFamily: HELV, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.14em", color: T.textDim, marginTop: 5 }}>{s[1]}</div>
          </div>
        ))}
      </div>

      {/* bio */}
      {bio && <div style={{ padding: "20px 28px 4px", fontFamily: HELV, fontSize: 13.5, color: T.textB, lineHeight: 1.85, textAlign: "center" }}>{bio}</div>}

      {/* ════ FEATURED WORK ════ */}
      {featured && (
        <div style={{ padding: "28px 24px 8px" }}>
          <Kicker>Онцлох бүтээл</Kicker>
          <div onClick={() => nav("work", { workId: featured.id })} className="toono-card-tap" style={{ cursor: "pointer", margin: "16px auto 0", maxWidth: 320 }}>
            <div style={{ width: "100%", aspectRatio: "4/5", borderRadius: 4, overflow: "hidden", background: T.s2 }}>
              {featured.images?.[0]
                ? <img src={featured.images[0]} alt={featured.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Toono size={48} color={T.borderMid} /></div>}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 16 }}>
            <div style={{ fontFamily: HELV, fontSize: 16, fontWeight: 700, color: T.textH, textAlign: "center", letterSpacing: "0.02em" }}>{featured.title}</div>
            <Diamond />
            <div style={{ fontFamily: SCRIPT, fontSize: 28, fontWeight: 700, color: T.accent }}>{featured.price > 0 ? `₮${Number(featured.price).toLocaleString()}` : "Захиалга"}</div>
            <button type="button" onClick={() => nav("work", { workId: featured.id })} style={{ marginTop: 4, background: "none", border: `1px solid ${T.accent}`, color: T.accent, borderRadius: 20, padding: "9px 28px", fontFamily: HELV, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", cursor: "pointer" }}>ХАРАХ</button>
          </div>
        </div>
      )}

      {/* ════ SELECTED WORKS ════ */}
      <div style={{ padding: "32px 16px 8px" }}>
        <div style={{ padding: "0 8px" }}><SectionLabel>Selected Works</SectionLabel></div>
        {creatorWorks === null
          ? <div style={{ padding: "40px 0", textAlign: "center", fontFamily: HELV, fontSize: 13, color: T.textDim }}>Уншиж байна...</div>
          : works.length === 0
            ? <div style={{ padding: "40px 0", textAlign: "center", fontFamily: HELV, fontSize: 13, color: T.textDim }}>Бүтээл байхгүй байна</div>
            : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {/* accent tile from creator field/tags (editorial blue block) */}
                {(c.field || tags[0]) && <AccentTile label={c.field || tags[0]} sub={tags[1] || "STUDIO"} />}
                {rest.map((w, i) => (
                  <div key={w.id || i} onClick={() => nav("work", { workId: w.id })} className="toono-card-tap" style={{ cursor: "pointer" }}>
                    <div style={{ aspectRatio: "1", borderRadius: 4, overflow: "hidden", background: T.s2 }}>
                      {w.images?.[0]
                        ? <img src={w.images[0]} alt={w.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Toono size={28} color={T.textDim} /></div>}
                    </div>
                    <div style={{ fontFamily: HELV, fontSize: 11.5, fontWeight: 600, color: T.textH, marginTop: 7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</div>
                    <div style={{ fontFamily: HELV, fontSize: 11, color: T.textDim, marginTop: 1 }}>{w.price > 0 ? `₮${Number(w.price).toLocaleString()}` : "Захиалга"}</div>
                  </div>
                ))}
              </div>}
        {isOwn && works.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <button type="button" onClick={() => nav("portfolio")} style={linkBtn}>ПОРТФОЛИО →</button>
          </div>
        )}
      </div>

      {/* ════ COMMISSION ════ */}
      {c.comm && !isOwn && (
        <div style={{ padding: "32px 16px 8px" }}>
          <div style={{ padding: "0 8px" }}><SectionLabel>Commission</SectionLabel></div>
          <div onClick={() => nav("commission", { creatorId: c.id })} style={{ background: T.accentSub, border: `1px solid ${T.border}`, borderRadius: 4, padding: "22px 20px", cursor: "pointer", textAlign: "center" }}>
            <ScriptTitle size={34}>Захиалга нээлттэй</ScriptTitle>
            <div style={{ fontFamily: HELV, fontSize: 12.5, color: T.textSub, lineHeight: 1.7, margin: "10px auto 16px", maxWidth: 280 }}>Бүтээлчтэй шууд холбогдож захиалгын нөхцлийг тохироорой.</div>
            <span style={{ fontFamily: HELV, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: T.accent }}>ЗАХИАЛГА ИЛГЭЭХ →</span>
          </div>
        </div>
      )}

      {/* ════ ABOUT ════ */}
      <div style={{ padding: "32px 16px 8px" }}>
        <div style={{ padding: "0 8px" }}><SectionLabel>About</SectionLabel></div>
        <div style={{ padding: "0 12px" }}>
          {[
            ["Мэргэшил", c.field || GS.user.field || "—"],
            ["Нийт бүтээл", String(works.length || c.works || 0) + "ш"],
            ["Үнэлгээ", c.rating > 0 ? (Number(c.rating).toFixed(1) + " ★") : "—"],
            ["Дагагч", String(followerCount) + "хн"],
          ].map((r, i) => (
            <div key={r[0]} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: `1px solid ${T.s2}` }}>
              <span style={{ fontFamily: HELV, fontSize: 12.5, color: T.textDim, letterSpacing: "0.02em" }}>{r[0]}</span>
              <span style={{ fontFamily: HELV, fontSize: 13, fontWeight: 600, color: T.textH }}>{r[1]}</span>
            </div>
          ))}
        </div>
        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, padding: "16px 12px 0", justifyContent: "center" }}>
            {tags.map(t => <span key={t} style={{ fontFamily: HELV, fontSize: 11.5, fontWeight: 500, color: T.textB, border: `1px solid ${T.border}`, padding: "6px 14px", borderRadius: 20 }}>{t}</span>)}
          </div>
        )}
      </div>

      {/* ════ DARK FOOTER ════ */}
      <div style={{ marginTop: 32, background: "#111111", padding: "40px 28px calc(40px + env(safe-area-inset-bottom,0px))", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Kicker color="rgba(255,255,255,0.5)">{isOwn ? "Таны дэлгүүр" : "Бүтээлчтэй холбогдох"}</Kicker>
        <ScriptTitle size={50} color="#FFFFFF" style={{ marginTop: 8 }}>{c.name || "Uliger"}</ScriptTitle>
        <div style={{ display: "flex", gap: 10, marginTop: 22, width: "100%", maxWidth: 300 }}>
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
