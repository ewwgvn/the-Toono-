"use client";
import { useState, useEffect, useRef, memo } from "react";
import { GS, saveGS } from "@/lib/store";
import { T } from "@/theme/colors";
import { DB, isSupabaseReady, fetchPublicData } from "@/lib/supabase";
import { getAllWorks, getCreators, fmtP } from "@/lib/utils";
import Toono from "@/components/atoms/Toono";
import {
  IcCart, IcBell, IcSearch, IcHeart,
  IcFieldFashion, IcFieldHome, IcFieldJewelry, IcFieldDirection,
  IcFieldGraphic, IcFieldTextile, IcFieldArt, IcField3D, IcFieldPhoto,
} from "@/components/icons";
import WorkCard from "@/components/shared/WorkCard";

const F = "'Helvetica Neue', Arial, sans-serif";
const CATS = ["Fashion Design","Interior Design","Jewelry Design","Industrial Design","Graphic Design","Textile Design","Fine Art","3D Design","Photography"];

// 카테고리 ↔ 아이콘 매핑 (Field 아이콘 9종 = CATS 9종, 1:1)
const CAT_ICONS = {
  "Fashion Design": IcFieldFashion,
  "Interior Design": IcFieldHome,
  "Jewelry Design": IcFieldJewelry,
  "Industrial Design": IcFieldDirection,
  "Graphic Design": IcFieldGraphic,
  "Textile Design": IcFieldTextile,
  "Fine Art": IcFieldArt,
  "3D Design": IcField3D,
  "Photography": IcFieldPhoto,
};

// ── 마스트헤드 — 굵은 컴프레스드 워드마크 ──────────────────────────────────────
const HERO_LABELS = [
  { label: "ШИНЭ ЦУГЛУУЛГА",  sub: "Шинэ бүтээлүүдийг нээж олоорой" },
  { label: "ОНЦЛОХ БҮТЭЭЛ",   sub: "Бүтээлчийн шилдэг ажлууд" },
  { label: "ТУСГАЙ ЗАХИАЛГА", sub: "Хувийн захиалга авдаг бүтээлчид" },
];

function Masthead({ nav }) {
  return (
    <div style={{ padding: "18px 12px 16px", borderBottom: `1px solid ${T.s2}` }}>
      <div style={{ fontFamily: F, fontSize: "clamp(42px,13vw,80px)", fontWeight: 800, color: T.textH, lineHeight: 0.98, letterSpacing: "-0.03em" }}>
        Монгол бүтээлчдийн<br />дижитал зах
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 12, gap: 12 }}>
        <div style={{ fontFamily: F, fontSize: 13, color: T.textSub, lineHeight: 1.5, maxWidth: 230 }}>
          Урлаг, дизайн, гар урлалын шинэ бүтээлүүдийг нэг дороос үзээрэй.
        </div>
        <button type="button" onClick={() => nav("explore")} className="toono-pressable"
          style={{ flexShrink: 0, fontFamily: F, fontSize: 13, fontWeight: 700, color: "#FFFFFF", background: T.accent, border: "none", borderRadius: 22, padding: "10px 20px", cursor: "pointer" }}>
          Үзэх →
        </button>
      </div>
    </div>
  );
}

// ── 모자이크 월 — 작품 콜라주 그리드 ───────────────────────────────────────────
const MOSAIC_PATTERN = [
  { col: "span 2", row: "span 2" },
  { col: "span 1", row: "span 1" },
  { col: "span 1", row: "span 1" },
  { col: "span 2", row: "span 1" },
  { col: "span 1", row: "span 1" },
  { col: "span 1", row: "span 1" },
  { col: "span 1", row: "span 2" },
  { col: "span 1", row: "span 1" },
  { col: "span 2", row: "span 1" },
  { col: "span 1", row: "span 1" },
  { col: "span 1", row: "span 1" },
  { col: "span 2", row: "span 2" },
  { col: "span 1", row: "span 1" },
  { col: "span 2", row: "span 1" },
];

function MosaicWall({ works, nav }) {
  if (!works.length) return null;
  return (
    <div style={{ padding: "16px 12px 28px" }}>
      <div className="toono-mosaic">
        {works.slice(0, 14).map((w, i) => {
          const p = MOSAIC_PATTERN[i % MOSAIC_PATTERN.length];
          return (
            <div key={w.id} onClick={() => nav("work", { workId: w.id })} className="toono-mosaic-item toono-card-tap"
              style={{ gridColumn: p.col, gridRow: p.row, cursor: "pointer", overflow: "hidden", position: "relative", background: T.s2, borderRadius: 12 }}>
              {w.images?.[0]
                ? <img src={w.images[0]} alt={w.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Toono size={28} color={T.borderMid} /></div>}
              {i === 0 && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 12px 10px", background: "linear-gradient(to top, rgba(38,129,218,0.55), transparent)" }}>
                  <div style={{ fontFamily: F, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#fff", textTransform: "uppercase", marginBottom: 3, opacity: 0.9 }}>{HERO_LABELS[0].label}</div>
                  <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div onClick={() => nav("explore")} className="toono-pressable"
        style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, cursor: "pointer" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: T.s2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M13 8L9 4M13 8L9 12" stroke={T.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: T.textSub }}>Бүх бүтээлийг үзэх</span>
      </div>
    </div>
  );
}

// ── 카테고리 아이콘 스크롤러 ────────────────────────────────────────────────────
function CategoryRow({ selCat, setSelCat }) {
  const items = [{ key: "all", label: "Бүгд", Icon: null }, ...CATS.map(c => ({ key: c, label: c.split(" ")[0], Icon: CAT_ICONS[c] }))];
  return (
    <div style={{ padding: "18px 0", borderBottom: `1px solid ${T.s2}` }}>
      <div style={{ display: "flex", gap: 14, overflowX: "auto", scrollbarWidth: "none", padding: "0 16px" }}>
        {items.map(({ key, label, Icon }) => {
          const active = selCat === key;
          return (
            <button key={key} type="button" onClick={() => setSelCat(key)} className="cat-chip toono-pressable"
              style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 7, width: 60, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <div className="cat-chip-circle" style={{ width: 50, height: 50, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: active ? T.accent : T.s2, color: active ? "#FFFFFF" : T.textH, border: active ? "none" : `1px solid ${T.borderLight}` }}>
                {Icon ? <Icon /> : <Toono size={20} color={active ? "#FFFFFF" : T.textH} />}
              </div>
              <span style={{ fontFamily: F, fontSize: 11, fontWeight: active ? 700 : 500, color: active ? T.textH : T.textSub, whiteSpace: "nowrap" }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${T.s2}` }}>
      <div>
        {label && <div style={{ fontFamily: F, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", color: T.accent, marginBottom: 4, textTransform: "uppercase" }}>{label}</div>}
        <div style={{ fontFamily: F, fontSize: "clamp(20px,5.5vw,26px)", fontWeight: 800, color: T.textH, lineHeight: 1.2, letterSpacing: "-0.02em" }}>{title}</div>
      </div>
      {action && <button type="button" onClick={onAction} style={{ background: "none", border: "none", fontFamily: F, fontSize: 12, fontWeight: 600, letterSpacing: "0.02em", color: T.accent, cursor: "pointer", flexShrink: 0, marginBottom: 4 }}>{action}</button>}
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
  const tSave = (id) => {
    GS.saved.has(id) ? GS.saved.delete(id) : GS.saved.add(id);
    saveGS(); setTick(t => t + 1); refresh();
    if (GS.user.id) DB.toggleSave(GS.user.id, id);
  };

  const sorted = [...allW].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  const filtered = selCat === "all" ? sorted : sorted.filter(w => w.cat === selCat);
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
            {GS.cart.length > 0 && <div style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: 7, background: T.red, display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #fff" }}><span style={{ fontFamily: F, fontSize: 9, fontWeight: 700, color: "#fff" }}>{GS.cart.length}</span></div>}
          </button>
          <button type="button" aria-label="Мэдэгдэл" className="toono-pressable" onClick={() => nav("notifications")} style={{ position: "relative", width: 34, height: 34, borderRadius: 10, background: T.s2, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textH }}>
            <IcBell />
            {GS.unreadNotif > 0 && <div style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, borderRadius: 4, background: T.red, border: "1.5px solid #fff" }} />}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        {loading ? <Skeleton /> : <>

          {/* ── 마스트헤드 + 모자이크 월 ── */}
          {selCat === "all" && <Masthead nav={nav} />}
          {heroWorks.length > 0 && selCat === "all" && (
            <MosaicWall works={heroWorks.length >= 3 ? sorted.filter(w => w.images?.[0]) : heroWorks} nav={nav} />
          )}

          {/* ── 카테고리 아이콘 ── */}
          <CategoryRow selCat={selCat} setSelCat={setSelCat} />

          {/* ── 인기 상품 ── */}
          {popular.length > 0 && selCat === "all" && (
            <div style={{ padding: "24px 16px 0", borderBottom: `1px solid ${T.s2}`, paddingBottom: 24 }}>
              <SectionLabel label="TRENDING NOW" title="Алдартай бүтээл" action="Бүгд →" onAction={() => nav("explore")} />
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

          {/* ── 전체 작품 (벤토 그리드) ── */}
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
              <div className="bento-grid" style={{ paddingTop: 4, paddingBottom: 8 }}>
                {filtered.map((w, i) => (
                  <WorkCard key={w.id} work={w} onClick={() => nav("work", { workId: w.id })} onToggleLike={tLike} onToggleSave={tSave} liked={GS.liked.has(w.id)} saved={GS.saved.has(w.id)} featured={i % 7 === 3} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* ── 크리에이터 ── */}
          {topCreators.length > 0 && selCat === "all" && (
            <div style={{ padding: "28px 0 20px", marginTop: 12, borderTop: `1px solid ${T.s2}` }}>
              <div style={{ padding: "0 16px" }}>
                <SectionLabel label="CREATORS" title="Бүтээлчид" action="Бүгд →" onAction={() => nav("explore")} />
              </div>
              <div style={{ display: "flex", gap: 14, overflowX: "auto", scrollbarWidth: "none", padding: "0 16px" }}>
                {topCreators.map(c => <CreatorChip key={c.id} c={c} nav={nav} />)}
              </div>
            </div>
          )}

          {/* ── 최근 본 (하단) ── */}
          {recentlyViewed.length > 0 && selCat === "all" && (
            <div style={{ padding: "28px 16px 0" }}>
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

          {/* ── 매니페스토 바 ── */}
          <div onClick={() => nav("upload")} className="toono-pressable"
            style={{ margin: "32px 16px 0", padding: "28px 22px", background: `linear-gradient(135deg, ${T.accent}, ${T.accentHover})`, borderRadius: 20, cursor: "pointer", textAlign: "center" }}>
            <div style={{ fontFamily: F, fontSize: "clamp(20px,5.5vw,28px)", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1.35 }}>
              Чи ч бүтээлчээ —<br />бүтээлээ нийтлээрэй
            </div>
            <div style={{ fontFamily: F, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.04em", marginTop: 10 }}>Эхлэх →</div>
          </div>

          <div style={{ height: 100 }} />
        </>}
      </div>
    </div>
  );
}
