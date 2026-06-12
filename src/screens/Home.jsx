"use client";
import { useState, useEffect, useRef, memo } from "react";
import { GS, saveGS } from "@/lib/store";
import { T } from "@/theme/colors";
import { DB, isSupabaseReady, fetchPublicData } from "@/lib/supabase";
import { getAllWorks, getCreators, fmtP } from "@/lib/utils";
import Toono from "@/components/atoms/Toono";
import { IcCart, IcBell, IcSearch, IcHeart } from "@/components/icons";

const F = "'Helvetica Neue', Arial, sans-serif";
const CATS = ["Fashion Design","Interior Design","Jewelry Design","Industrial Design","Graphic Design","Textile Design","Fine Art","3D Design","Photography"];

// ── 히어로 배너 (슬라이더) ────────────────────────────────────────────────────
const HERO_LABELS = [
  { label: "ШИНЭ ЦУГЛУУЛГА",  sub: "Шинэ бүтээлүүдийг нээж олоорой" },
  { label: "ОНЦЛОХ БҮТЭЭЛ",   sub: "Бүтээлчийн шилдэг ажлууд" },
  { label: "ТУСГАЙ ЗАХИАЛГА", sub: "Хувийн захиалга авдаг бүтээлчид" },
];
function HeroBanner({ works, nav }) {
  const [idx, setIdx] = useState(0);
  const w = works[idx] || works[0];
  if (!w) return null;
  const lbl = HERO_LABELS[idx % HERO_LABELS.length];

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden", cursor: "pointer" }} onClick={() => nav("work", { workId: w.id })}>
      <div style={{ width: "100%", aspectRatio: "16/9", maxHeight: 480, background: "#111", position: "relative", overflow: "hidden" }}>
        <img src={w.images[0]} alt={w.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0.75 }} />
        {/* 그라데이션 오버레이 */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%)" }} />
        {/* 텍스트 */}
        <div style={{ position: "absolute", left: 20, bottom: 20, right: 60 }}>
          <div style={{ fontFamily: F, fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", color: "rgba(255,255,255,0.7)", marginBottom: 6, textTransform: "uppercase" }}>{lbl.label}</div>
          <div style={{ fontFamily: F, fontSize: 24, fontWeight: 800, color: "#FFFFFF", lineHeight: 1.15, marginBottom: 6, letterSpacing: "-.01em" }}>{w.title}</div>
          <div style={{ fontFamily: F, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{lbl.sub}</div>
        </div>
        {/* 슬라이더 도트 */}
        {works.length > 1 && (
          <div style={{ position: "absolute", bottom: 16, right: 16, display: "flex", gap: 5 }} onClick={e => e.stopPropagation()}>
            {works.map((_, i) => (
              <button key={i} type="button" onClick={() => setIdx(i)} style={{ width: i === idx ? 20 : 6, height: 6, borderRadius: 3, background: i === idx ? "#fff" : "rgba(255,255,255,0.4)", border: "none", cursor: "pointer", padding: 0, transition: "all .2s" }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 상품 카드 ──────────────────────────────────────────────────────────────────
const WorkCard = memo(function WorkCard({ w, liked, onLike, nav }) {
  const thumb = w.images?.[0] || null;
  const likeCount = (w.likes_count || w.likes || 0);
  return (
    <div onClick={() => nav("work", { workId: w.id })} className="toono-card-tap" style={{ cursor: "pointer" }}>
      {/* 이미지 — 자연 비율 */}
      <div style={{ background: T.s2, borderRadius: 10, overflow: "hidden", marginBottom: 10, position: "relative" }}>
        {thumb
          ? <img src={thumb} alt={w.title} loading="lazy" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
          : <div style={{ width: "100%", aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center" }}><Toono size={36} color={T.borderMid} /></div>}
        {/* 좋아요 버튼 */}
        <button
          type="button"
          aria-label={liked ? "Таалагдсаныг болиулах" : "Таалагдлаа"}
          className="toono-pressable"
          onClick={e => { e.stopPropagation(); onLike(w.id); }}
          style={{ position: "absolute", bottom: 10, right: 10, display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.92)", borderRadius: 20, border: "none", padding: "5px 9px", cursor: "pointer", color: liked ? T.red : T.textSub }}
        >
          <IcHeart filled={liked} />
          {likeCount > 0 && <span style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: liked ? T.red : T.textSub }}>{likeCount}</span>}
        </button>
      </div>
      {/* 텍스트 정보 */}
      <div style={{ fontFamily: F, fontSize: 11, color: T.textDim, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.creator}</div>
      <div style={{ fontFamily: F, fontSize: 13, fontWeight: 500, color: T.textH, marginBottom: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</div>
      <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: T.textH }}>{fmtP(w)}</div>
    </div>
  );
});

// ── 크리에이터 칩 ──────────────────────────────────────────────────────────────
const CreatorChip = memo(function CreatorChip({ c, nav }) {
  const thumb = c.photo;
  return (
    <div onClick={() => nav("profile", { creatorId: c.id })} className="toono-pressable" style={{ flexShrink: 0, cursor: "pointer", width: 68, textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", overflow: "hidden", background: T.s2, margin: "0 auto 6px", border: `1.5px solid ${T.border}` }}>
        {thumb
          ? <img src={thumb} alt={c.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Toono size={26} color={T.textDim} /></div>}
      </div>
      <div style={{ fontFamily: F, fontSize: 11, fontWeight: 500, color: T.textH, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(c.name || "").split(" ")[0]}</div>
    </div>
  );
});

// ── 섹션 헤더 ─────────────────────────────────────────────────────────────────
function SectionLabel({ label, title, action, onAction }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
      <div>
        {label && <div style={{ fontFamily: F, fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: T.accent, marginBottom: 4, textTransform: "uppercase" }}>{label}</div>}
        <div style={{ fontFamily: F, fontSize: 22, fontWeight: 800, color: T.textH, lineHeight: 1.1, letterSpacing: "-0.02em" }}>{title}</div>
      </div>
      {action && <button type="button" onClick={onAction} style={{ background: "none", border: "none", fontFamily: F, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: T.accent, cursor: "pointer", flexShrink: 0, marginBottom: 4 }}>{action}</button>}
    </div>
  );
}

// ── 스켈레톤 ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ padding: "20px 16px" }}>
      <div className="toono-skeleton" style={{ width: 120, height: 22, borderRadius: 4, marginBottom: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[0,1,2,3].map(i => (
          <div key={i}>
            <div className="toono-skeleton" style={{ width: "100%", aspectRatio: "3/4", borderRadius: 10, marginBottom: 10 }} />
            <div className="toono-skeleton" style={{ width: "50%", height: 11, borderRadius: 4, marginBottom: 6 }} />
            <div className="toono-skeleton" style={{ width: "80%", height: 13, borderRadius: 4, marginBottom: 6 }} />
            <div className="toono-skeleton" style={{ width: "40%", height: 14, borderRadius: 4 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────────
export default function Home({ nav, refresh }) {
  const [loading, setLoading] = useState(GS.publicWorks.length === 0);
  const [selCat, setSelCat] = useState("all");
  const [tick, setTick] = useState(0);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current || GS.publicWorks.length > 0) { setLoading(false); return; }
    if (!isSupabaseReady()) { setLoading(false); return; }
    fetched.current = true;
    fetchPublicData().then(() => { setLoading(false); refresh(); setTick(t => t + 1); }).catch(() => setLoading(false));
  }, []);

  const allW = getAllWorks();
  const creators = getCreators();

  const tLike = (id) => {
    GS.liked.has(id) ? GS.liked.delete(id) : GS.liked.add(id);
    saveGS(); setTick(t => t + 1); refresh();
    if (GS.user.id) DB.toggleLike(GS.user.id, id);
  };

  const sorted = [...allW].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const filtered = selCat === "all" ? sorted : allW.filter(w => w.cat === selCat);
  const popular = [...allW].sort((a, b) => (b.likes_count || b.likes || 0) - (a.likes_count || a.likes || 0)).slice(0, 6);
  const topCreators = creators.filter(c => c.id !== GS.user.id).slice(0, 12);
  const recentlyViewed = (GS.recentlyViewed || []).map(id => allW.find(w => w.id === id)).filter(Boolean).slice(0, 6);
  // 히어로 배너용 — 최신 작품 중 이미지 있는 것 3개
  const heroWorks = sorted.filter(w => w.images?.[0]).slice(0, 3);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>

      {/* ── 헤더 ── */}
      <div className="toono-mobile-nav" style={{ padding: "12px 16px", paddingTop: "max(12px, env(safe-area-inset-top, 12px))", justifyContent: "space-between", alignItems: "center", background: T.s1, flexShrink: 0, borderBottom: `1px solid ${T.borderLight}`, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <img src="/uliger-world-logo.png?v=2" alt="Uliger World" style={{ height: 44, width: "auto", display: "block" }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" aria-label="Хайх" className="toono-pressable" onClick={() => nav("explore")} style={{ width: 34, height: 34, borderRadius: 10, background: T.s2, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textH }}><IcSearch /></button>
          <button type="button" aria-label="Сагс" className="toono-pressable" onClick={() => nav("cart")} style={{ position: "relative", width: 34, height: 34, borderRadius: 10, background: T.s2, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textH }}>
            <IcCart />
            {GS.cart.length > 0 && <div style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: 7, background: T.red, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #fff" }}><span style={{ fontFamily: F, fontSize: 8, fontWeight: 700, color: "#fff" }}>{GS.cart.length}</span></div>}
          </button>
          <button type="button" aria-label="Мэдэгдэл" className="toono-pressable" onClick={() => nav("notifications")} style={{ position: "relative", width: 34, height: 34, borderRadius: 10, background: T.s2, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textH }}>
            <IcBell />
            {GS.unreadNotif > 0 && <div style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, borderRadius: 4, background: T.red, border: "1.5px solid #fff" }} />}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        {loading ? <Skeleton /> : <>

          {/* ── 카테고리 필터 ── */}
          <div style={{ padding: "10px 0 0", borderBottom: `1px solid ${T.s2}` }}>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", padding: "0 16px 10px" }}>
              {[["all", "Бүгд"], ...CATS.map(c => [c, c.split(" ")[0]])].map(([k, l]) => (
                <button key={k} type="button" onClick={() => setSelCat(k)} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 20, fontFamily: F, fontSize: 12, fontWeight: selCat === k ? 700 : 400, background: selCat === k ? T.accent : "transparent", border: selCat === k ? "none" : `1px solid ${T.border}`, color: selCat === k ? "#FFFFFF" : T.textSub, cursor: "pointer", transition: "all .15s", whiteSpace: "nowrap" }}>
                  {k === "all" ? "Бүгд" : l}
                </button>
              ))}
            </div>
          </div>

          {/* ── 히어로 배너 ── */}
          {heroWorks.length > 0 && selCat === "all" && (
            <HeroBanner works={heroWorks} nav={nav} />
          )}

          {/* ── 크리에이터 ── */}
          {topCreators.length > 0 && selCat === "all" && (
            <div style={{ padding: "24px 0 20px", borderBottom: `1px solid ${T.s2}` }}>
              <div style={{ padding: "0 16px", marginBottom: 14 }}>
                <div style={{ fontFamily: F, fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: T.accent, marginBottom: 4, textTransform: "uppercase" }}>CREATORS</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: F, fontSize: 22, fontWeight: 800, color: T.textH, letterSpacing: "-.02em" }}>Бүтээлчид</div>
                  <button type="button" onClick={() => nav("explore")} style={{ background: "none", border: "none", fontFamily: F, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: T.accent, cursor: "pointer" }}>Бүгд →</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: 14, overflowX: "auto", scrollbarWidth: "none", padding: "0 16px" }}>
                {topCreators.map(c => <CreatorChip key={c.id} c={c} nav={nav} />)}
              </div>
            </div>
          )}

          {/* ── 인기 상품 ── */}
          {popular.length > 0 && selCat === "all" && (
            <div style={{ padding: "28px 16px 0", borderBottom: `1px solid ${T.s2}`, paddingBottom: 24 }}>
              <SectionLabel label="POPULAR LISTINGS" title="Алдартай бүтээл" action="Бүгд →" onAction={() => nav("explore")} />
              <div style={{ display: "flex", gap: 12, overflowX: "auto", scrollbarWidth: "none", marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16 }}>
                {popular.map(w => (
                  <div key={w.id} onClick={() => nav("work", { workId: w.id })} className="toono-card-tap" style={{ flexShrink: 0, width: 148, cursor: "pointer" }}>
                    <div style={{ width: 148, background: T.s2, borderRadius: 10, overflow: "hidden", marginBottom: 9 }}>
                      {w.images?.[0]
                        ? <img src={w.images[0]} alt={w.title} loading="lazy" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }} />
                        : <div style={{ width: "100%", aspectRatio: "3/4", display: "flex", alignItems: "center", justifyContent: "center" }}><Toono size={32} color={T.borderMid} /></div>}
                    </div>
                    <div style={{ fontFamily: F, fontSize: 10, color: T.textDim, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.creator}</div>
                    <div style={{ fontFamily: F, fontSize: 12, fontWeight: 500, color: T.textH, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: T.textH }}>{fmtP(w)}</div>
                      {(w.likes_count || w.likes || 0) > 0 && <div style={{ display: "flex", alignItems: "center", gap: 2 }}><IcHeart /><span style={{ fontFamily: F, fontSize: 10, color: T.textDim }}>{w.likes_count || w.likes}</span></div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 최근 본 ── */}
          {recentlyViewed.length > 0 && selCat === "all" && (
            <div style={{ padding: "24px 16px 0", borderBottom: `1px solid ${T.s2}`, paddingBottom: 20 }}>
              <SectionLabel label="RECENTLY VIEWED" title="Сүүлд үзсэн" />
              <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none", marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16 }}>
                {recentlyViewed.map(w => (
                  <div key={w.id} onClick={() => nav("work", { workId: w.id })} className="toono-card-tap" style={{ flexShrink: 0, width: 100, cursor: "pointer" }}>
                    <div style={{ width: 100, height: 100, borderRadius: 10, overflow: "hidden", background: T.s2, marginBottom: 6 }}>
                      {w.images?.[0]
                        ? <img src={w.images[0]} alt={w.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Toono size={24} color={T.borderMid} /></div>}
                    </div>
                    <div style={{ fontFamily: F, fontSize: 11, color: T.textH, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</div>
                    <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: T.textH }}>{fmtP(w)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 메인 작품 그리드 ── */}
          <div style={{ padding: "28px 16px 0" }}>
            <SectionLabel
              label={selCat === "all" ? "ALL WORKS" : selCat.toUpperCase()}
              title={selCat === "all" ? "Бүх бүтээл" : selCat}
              action={`${filtered.length}ш`}
            />
            {filtered.length === 0 ? (
              <div style={{ padding: "60px 0", textAlign: "center" }}>
                <div style={{ fontFamily: F, fontSize: 13, color: T.textDim }}>Энэ ангилалд бүтээл байхгүй байна</div>
              </div>
            ) : (
              <div className="toono-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {filtered.map(w => (
                  <WorkCard key={w.id} w={w} liked={GS.liked.has(w.id)} onLike={tLike} nav={nav} />
                ))}
              </div>
            )}
          </div>

          <div style={{ height: 100 }} />
        </>}
      </div>
    </div>
  );
}
