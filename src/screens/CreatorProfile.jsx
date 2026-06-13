"use client";

import React, { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { getCreators, a11yClick } from "@/lib/utils";
import { toast } from "@/components/layout/Toast";
import { IcBack, IcShare, IcDots, IcMsg, IcBell } from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Toono from "@/components/atoms/Toono";
import { SCRIPT } from "@/components/shared/Editorial";

const HELV = "'Helvetica Neue', Arial, sans-serif";

const SOC_ICONS = {
  instagram: <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" /></svg>,
  facebook: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V7c0-1 .3-1.5 1.6-1.5H17V2.5h-2.6C11.6 2.5 10.5 4 10.5 6.4V9H8.5v3h2v9.5h3.5V12h2.5l.4-3H14z" /></svg>,
  twitter: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.2 2.5h3.3l-7.2 8.2 8.5 11.3h-6.7l-5.2-6.9-6 6.9H1.8l7.7-8.8L1.3 2.5h6.8l4.7 6.3 5.4-6.3zm-1.2 17.6h1.8L7.1 4.3H5.2L17 20.1z" /></svg>,
};
const SOC_URL = {
  instagram: (h) => `https://instagram.com/${h}`,
  facebook: (h) => h.startsWith("http") ? h : `https://facebook.com/${h}`,
  twitter: (h) => `https://x.com/${h}`,
};
function SocialRow({ creator, dark }) {
  const items = ["instagram", "facebook", "twitter"].filter(k => creator[k]);
  if (!items.length) return null;
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
      {items.map(k => (
        <a key={k} href={SOC_URL[k](creator[k])} target="_blank" rel="noopener noreferrer"
          style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: dark ? "rgba(255,255,255,0.08)" : T.accentSub, border: `1px solid ${dark ? "rgba(255,255,255,0.18)" : T.border}`,
            color: dark ? "#fff" : T.accent, textDecoration: "none" }}>
          {SOC_ICONS[k]}
        </a>
      ))}
    </div>
  );
}

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
  const [creator, setCreator] = useState(localCreator || { id: creatorId, name: "...", field: "", followers: "0", works: 0, comm: false, rating: 0, accent: T.accent, bio: "", tags: [], instagram: "", facebook: "", twitter: "" });
  const [creatorWorks, setCreatorWorks] = useState(null);

  React.useEffect(() => {
    if (!creatorId) return;
    if (creatorId === GS.user.id) {
      setCreator({ id: GS.user.id || 1, name: GS.user.name, field: GS.user.field || "Бүтээлч", followers: GS.user.followers || "0", works: GS.myWorks.length, comm: GS.user.commOpen, rating: GS.trustMetrics?.avgRating || 0, accent: T.accent, bio: GS.user.bio, tags: GS.user.tags || [], photo: GS.user.photo || null, instagram: GS.user.instagram || "", facebook: GS.user.facebook || "", twitter: GS.user.twitter || "" });
      setCreatorWorks(GS.myWorks);
      return;
    }
    if (isSupabaseReady()) {
      DB.getProfile(creatorId).then(async p => {
        if (p) {
          const fc = await DB.getFollowerCount(creatorId).catch(() => 0);
          setCreator({ id: p.id, name: p.name || "—", field: p.field || "Бүтээлч", photo: p.photo || null, followers: String(fc), works: 0, comm: p.comm_open || false, rating: p.rating || 0, accent: T.accent, bio: p.bio || "", tags: p.tags || [], instagram: p.instagram || "", facebook: p.facebook || "", twitter: p.twitter || "" });
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
  const tags = (c.tags || GS.user.tags || []).filter(Boolean);
  const bio = c.bio || (isOwn ? GS.user.bio : "");

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    {/* ── Top bar ── */}
    <div style={{ padding: "16px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
      {isOwn
        ? <div style={{ width: 24 }} />
        : <button type="button" onClick={() => goBack ? goBack() : nav("home")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {isOwn
          ? <>
              <button type="button" onClick={() => nav("notifications")} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: T.textSub, display: "flex" }} aria-label="Мэдэгдэл">
                <IcBell />
                {GS.unreadNotif > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: 4, background: T.red, border: "1.5px solid #fff" }} />}
              </button>
              <button type="button" onClick={() => nav("settings")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, display: "flex" }} aria-label="Тохиргоо"><svg width="22" height="22" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M10 2V4M10 16V18M2 10H4M16 10H18M4.6 4.6L6 6M14 14L15.4 15.4M4.6 15.4L6 14M14 6L15.4 4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg></button>
            </>
          : <>
              <button type="button" onClick={() => { const url = `${location.origin}?creator=${c.id}`; navigator.clipboard?.writeText(url).catch(() => {}); toast("Профайлын холбоос хуулагдлаа", "success"); }} style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, display: "flex" }}><IcShare /></button>
              <button type="button" style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, display: "flex" }}><IcDots /></button>
            </>}
      </div>
    </div>

    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
      <div className="profile-content">

      {/* ════ HERO — color circle, name below ════ */}
      <div style={{ padding: "30px 24px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 148, height: 148, borderRadius: "50%", overflow: "hidden", background: T.s2, position: "relative" }}>
          {(() => { const hp = isOwn ? GS.user.photo : c.photo; return hp
            ? <img src={hp} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Toono size={56} color={T.textDim} /></div>; })()}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18 }}>
          <div style={{ fontFamily: HELV, fontSize: 27, fontWeight: 800, color: T.textH, letterSpacing: "-0.02em", lineHeight: 1.1, textAlign: "center", wordBreak: "break-word" }}>{c.name || "..."}</div>
          {(isOwn ? GS.user.verified : c.verified) && (
            <span title="Улигер World баталгаажуулсан бүтээлч" style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: T.accent }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          )}
        </div>
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
          <div key={s[1]} {...a11yClick(s[2] || undefined)} style={{ flex: 1, textAlign: "center", borderLeft: i > 0 ? `1px solid ${T.border}` : "none", cursor: s[2] ? "pointer" : "default" }}>
            <div style={{ fontFamily: SCRIPT, fontSize: 32, fontWeight: 700, color: T.accent, lineHeight: 1 }}>{s[0]}</div>
            <div style={{ fontFamily: HELV, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.14em", color: T.textDim, marginTop: 5 }}>{s[1]}</div>
          </div>
        ))}
      </div>

      {/* bio */}
      {bio && <div style={{ padding: "22px 30px 0", fontFamily: HELV, fontSize: 13.5, color: T.textB, lineHeight: 1.85, textAlign: "center" }}>{bio}</div>}

      {/* social links (public) */}
      {!isOwn && <div style={{ display: "flex", justifyContent: "center" }}><SocialRow creator={c} /></div>}

      {/* ════ OWNER MANAGEMENT (own profile / me tab) ════ */}
      {isOwn && (
        <div style={{ padding: "24px 16px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {[
              ["Захиалга", "order-list"],
              [GS.currentRole === "creator" ? "Хянах самбар" : "Сагс", GS.currentRole === "creator" ? "dashboard" : "cart"],
              ["Хадгалсан", "saved"],
              ["Тохиргоо", "settings"],
            ].map(([label, route]) => (
              <button key={label} type="button" onClick={() => nav(route)} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 6px", cursor: "pointer", fontFamily: HELV, fontSize: 11, fontWeight: 600, color: T.textB, lineHeight: 1.3 }}>{label}</button>
            ))}
          </div>
          {GS.currentRole === "creator" && (
            <button type="button" onClick={() => { GS.user.commOpen = !GS.user.commOpen; setCreator(p => ({ ...p, comm: GS.user.commOpen })); saveGS(); refresh(); if (isSupabaseReady() && GS.user.id) DB.updateProfile(GS.user.id, { comm_open: GS.user.commOpen }); toast(GS.user.commOpen ? "Захиалга нээлттэй боллоо" : "Захиалга хаалттай боллоо", "success"); }}
              style={{ width: "100%", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", background: GS.user.commOpen ? T.accentSub : T.s2, border: `1px solid ${GS.user.commOpen ? T.accent : T.border}`, borderRadius: 10, padding: "12px 16px", cursor: "pointer" }}>
              <span style={{ fontFamily: HELV, fontSize: 13, fontWeight: 600, color: GS.user.commOpen ? T.accent : T.textSub }}>{GS.user.commOpen ? "Захиалга авч байна" : "Захиалга хаалттай"}</span>
              <div style={{ width: 40, height: 22, borderRadius: 11, background: GS.user.commOpen ? T.accent : T.borderMid, position: "relative", transition: "background .2s" }}>
                <div style={{ position: "absolute", top: 3, left: GS.user.commOpen ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
              </div>
            </button>
          )}
        </div>
      )}

      {/* ════ FEATURED — side-text editorial (title | image | buy) ════ */}
      {featured && (
        <div style={{ padding: "34px 20px 8px" }}>
          <CenterLabel>Онцлох бүтээл</CenterLabel>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 18, maxWidth: 760, margin: "0 auto" }}>
            {/* left text */}
            <div style={{ flex: 1, textAlign: "right", minWidth: 0 }}>
              <div style={{ fontFamily: HELV, fontSize: 14, fontWeight: 800, letterSpacing: "0.02em", color: T.textH, lineHeight: 1.35, textTransform: "uppercase" }}>{featured.title}</div>
              <div style={{ fontFamily: HELV, fontSize: 12.5, color: T.textDim, marginTop: 6 }}>{featured.cat || ""}</div>
            </div>
            {/* center image — enlarged */}
            <div {...a11yClick(() => nav("work", { workId: featured.id }))} className="toono-card-tap" style={{ width: "min(280px, 46vw)", flexShrink: 0, cursor: "pointer" }}>
              <div style={{ width: "100%", aspectRatio: "3/4" }}><WorkImg w={featured} /></div>
            </div>
            {/* right buy */}
            <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
              <div style={{ fontFamily: HELV, fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em", color: T.accent, lineHeight: 1.05 }}>{featured.price > 0 ? `₮${Number(featured.price).toLocaleString()}` : "Захиалга"}</div>
              <div style={{ fontFamily: HELV, fontSize: 9.5, fontWeight: 600, letterSpacing: "0.12em", color: T.textDim, marginTop: 4, textTransform: "uppercase" }}>Үнэгүй хүргэлт</div>
              <div style={{ width: 1, height: 24, background: T.border, margin: "12px 0" }} />
              <button type="button" onClick={() => nav("work", { workId: featured.id })} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Diamond size={6} />
                <span style={{ fontFamily: HELV, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", color: T.accent }}>ХАРАХ →</span>
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
            : <div className="toono-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {/* blue accent tile — creator field/tag */}
                <div style={{ aspectRatio: "1", background: T.accent, borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 12, textAlign: "center" }}>
                  <span style={{ fontFamily: HELV, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", lineHeight: 1.3 }}>{c.field || tags[0] || "Studio"}</span>
                  <span style={{ fontFamily: HELV, fontSize: 9.5, fontWeight: 500, letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)", marginTop: 6, textTransform: "uppercase" }}>{works.length} бүтээл</span>
                </div>
                {works.map((w, i) => (
                  <div key={w.id || i} {...a11yClick(() => nav("work", { workId: w.id }))} className="toono-card-tap" style={{ cursor: "pointer" }}>
                    <div style={{ aspectRatio: "1" }}><WorkImg w={w} /></div>
                    <div style={{ fontFamily: HELV, fontSize: 12, fontWeight: 600, color: T.textH, marginTop: 7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</div>
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
        <div style={{ padding: "36px 20px 8px" }}>
          <CenterLabel>Commission</CenterLabel>
          <div {...a11yClick(() => nav("commission", { creatorId: c.id }))} style={{ background: T.accentSub, border: `1px solid ${T.border}`, borderRadius: 4, padding: "24px 20px", cursor: "pointer", textAlign: "center" }}>
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
      <div className="profile-darkfooter" style={{ marginTop: 36, background: "#0B1E3A", padding: "44px 28px calc(44px + env(safe-area-inset-bottom,0px))", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: HELV, fontSize: 10, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>{isOwn ? "Таны дэлгүүр" : "Бүтээлчтэй холбогдох"}</div>
        <div style={{ fontFamily: SCRIPT, fontSize: 54, fontWeight: 700, color: "#fff", lineHeight: 1, marginTop: 8, textAlign: "center", wordBreak: "break-word" }}>{c.name || "Uliger"}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 24, width: "100%", maxWidth: 300 }}>
          {isOwn
            ? <PBtn full onClick={() => nav("edit-profile")}>Профайл засах</PBtn>
            : <>
                <button type="button" onClick={startChat} style={{ width: 46, height: 46, borderRadius: 23, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", flexShrink: 0 }}><IcMsg /></button>
                <button type="button" onClick={tFollow} style={{ flex: 1, height: 46, borderRadius: 23, background: isFollowing ? "transparent" : "#fff", border: isFollowing ? "1px solid rgba(255,255,255,0.3)" : "none", color: isFollowing ? "#fff" : T.accent, fontFamily: HELV, fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em" }}>{isFollowing ? "Дагаж байна" : "Дагах"}</button>
              </>}
        </div>
        <SocialRow creator={c} dark />
        <div style={{ marginTop: 28, fontFamily: HELV, fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>ULIGER WORLD · 2026</div>
      </div>
      </div>{/* /profile-content */}
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
