"use client";

import { getTheme } from "@/theme/colors";

// 하이브리드 마켓플레이스 UI 부품 모음
// 기능·구조는 현대적 이커머스 그리드/스크롤(Mono UX)을 그대로 따르고,
// 동화책 감성(Uliger)은 컴포넌트 위에 입히는 "스킨"으로만 적용한다 — 책장 넘김 같은 내비게이션은 사용하지 않음
// - ArchFrame   : 아치형 게이트 + 필리그리 코너 골드 프레임 (상품 이미지)
// - ProductCard : 표준 그리드 카드 — 아치 프레임 + 세리프 타이포 + 왁스 실 CTA
// - ProductGrid : 종이 질감 컨테이너 위 반응형 2~3단 그리드 (표준 스크롤)
// - FilterBar   : 가로 스크롤 카테고리 필터 바 (리본 탭 스킨, 일반 토글로 동작)
// - RibbonTab   : 실크 책갈피 리본 형태의 필터/카테고리 버튼
// - WaxSeal     : 골드 실링 왁스 인장 모양의 CTA 버튼
// - DropCap     : 문단 첫 글자 장식(Drop Cap)
// - SectionTitle: 섹션 헤딩용 Drop Cap 타이틀

const C = {
  navyDeep: "#0F172A",
  navy:     "#1E293B",
  paper:    "#FBF8F3",   // 바랜 종이/파피루스 톤
  paperEdge:"#EFE6D6",
  gold:     "#D4AF37",
  goldDeep: "#A9831F",
  ink:      "#15171C",
};

export const SERIF      = "Georgia, 'Iowan Old Style', 'Noto Serif', 'Times New Roman', serif";
export const SERIF_DISP = "'Playfair Display', Georgia, 'Noto Serif', serif";

// 미세한 종이 스크래치/번짐 노이즈 — feTurbulence 오버레이를 data URI SVG로 인라인
const PAPER_NOISE_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")";

export const STORY_SHOP_TOKENS = C;

// 책 페이지에 까는 바랜 종이 질감 — 컨테이너 스타일에 spread 해서 사용
export const paperTextureStyle = {
  backgroundColor: C.paper,
  backgroundImage: `${PAPER_NOISE_URL}, radial-gradient(ellipse at 18% 12%, rgba(212,175,55,.05), transparent 55%)`,
  backgroundBlendMode: "overlay, normal",
};

// ── ArchFrame — 아치형 게이트 모양 골드 프레임 (상품 이미지 전용) ────────────
export function ArchFrame({ src, alt = "", size = 220, ribbon, children }) {
  if (getTheme() !== "uliger") return null;
  const r = size / 2;
  return (
    <div style={{ width: size, position: "relative" }}>
      <div style={{
        width: size, height: size * 1.18,
        borderRadius: `${r}px ${r}px 10px 10px`,
        overflow: "hidden", position: "relative",
        border: `2px solid ${C.gold}`,
        boxShadow: `0 0 0 4px ${C.paper}, 0 0 0 5px ${C.gold}, 0 14px 30px -10px rgba(0,0,0,.4)`,
        background: C.navy,
      }}>
        {src && (
          <div aria-hidden={!alt} role={alt ? "img" : undefined} aria-label={alt} style={{
            position: "absolute", inset: 0,
            backgroundImage: `linear-gradient(rgba(15,23,42,.06),rgba(15,23,42,.06)), url(${src})`,
            backgroundSize: "cover", backgroundPosition: "center",
          }} />
        )}
        {children}
        {/* 필리그리 코너 — 아치 상단 좌우 */}
        <FiligreeCorner corner="tl" /><FiligreeCorner corner="tr" />
        {/* 내부 골드 라인 — 명화 액자 느낌 */}
        <div style={{ position: "absolute", inset: 7, border: `1px solid rgba(212,175,55,.55)`, borderRadius: `${r - 5}px ${r - 5}px 6px 6px`, pointerEvents: "none" }} />
      </div>
      {ribbon && (
        <div style={{
          position: "absolute", top: -6, right: 14, padding: "5px 12px 9px",
          background: ribbon.color || C.gold, color: C.ink,
          fontFamily: SERIF, fontSize: 11, letterSpacing: ".06em",
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%)",
          boxShadow: "0 4px 10px rgba(0,0,0,.25)",
        }}>{ribbon.label}</div>
      )}
    </div>
  );
}

function FiligreeCorner({ corner }) {
  const flip = corner === "tr";
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" fill="none" aria-hidden="true" style={{
      position: "absolute", top: 6, [flip ? "right" : "left"]: 6,
      transform: flip ? "scaleX(-1)" : undefined, opacity: .85, zIndex: 2,
    }}>
      <path d="M2 18C2 9 9 2 18 2" stroke={C.gold} strokeWidth="1.3" fill="none" />
      <path d="M2 18c5-1 8-4 9-9" stroke={C.gold} strokeWidth="1" fill="none" opacity=".7" />
      <circle cx="2" cy="18" r="2" fill={C.gold} />
      <circle cx="18" cy="2" r="2" fill={C.gold} />
    </svg>
  );
}

// ── RibbonTab — 실크 책갈피 리본 필터/카테고리 탭 ───────────────────────────
const RIBBON_COLORS = { navy: C.navy, sky: "#8FB7DC", gold: C.gold };

export function RibbonTab({ label, color = "navy", active, onClick }) {
  if (getTheme() !== "uliger") return null;
  const bg = RIBBON_COLORS[color] || color;
  const fg = color === "gold" ? C.ink : C.paper;
  return (
    <button type="button" onClick={onClick} aria-pressed={active} style={{
      position: "relative", border: "none", cursor: "pointer", fontFamily: SERIF,
      padding: active ? "12px 18px 18px" : "9px 16px 15px",
      marginTop: active ? -3 : 0,
      background: bg, color: fg, fontSize: 13, letterSpacing: ".04em",
      clipPath: "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)",
      boxShadow: active ? "0 8px 18px -6px rgba(0,0,0,.45)" : "0 4px 10px -4px rgba(0,0,0,.3)",
      opacity: active ? 1 : .82,
      transition: "all .22s cubic-bezier(.2,.8,.2,1)",
    }}>{label}</button>
  );
}

// ── WaxSeal — 골드 실링 왁스 인장 CTA 버튼 ──────────────────────────────────
export function WaxSeal({ children = "구매하기", onClick, size = 84 }) {
  if (getTheme() !== "uliger") return null;
  return (
    <button type="button" onClick={onClick} aria-label={typeof children === "string" ? children : "구매"} style={{
      width: size, height: size, borderRadius: "50%", border: "none", cursor: "pointer",
      position: "relative", fontFamily: SERIF, fontSize: size * 0.15, letterSpacing: ".03em",
      color: "#3B2A06",
      background: `radial-gradient(circle at 32% 28%, #F4DA8A, ${C.gold} 46%, ${C.goldDeep} 100%)`,
      boxShadow: "inset 0 -4px 8px rgba(0,0,0,.28), inset 0 3px 6px rgba(255,255,255,.5), 0 10px 22px -8px rgba(0,0,0,.5)",
      display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
      lineHeight: 1.15, padding: "0 6px", boxSizing: "border-box",
      transition: "transform .18s ease",
    }}
      onMouseDown={e => { e.currentTarget.style.transform = "scale(.93)"; }}
      onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
    >
      {/* 인장 눌린 자국 — 가장자리 불규칙 라인 */}
      <svg width={size} height={size} viewBox="0 0 84 84" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} aria-hidden="true">
        <circle cx="42" cy="42" r="36" stroke="rgba(59,42,6,.35)" strokeWidth="1.2" fill="none" strokeDasharray="2.4 2" />
      </svg>
      <span style={{ position: "relative", fontWeight: 700 }}>{children}</span>
    </button>
  );
}

// ── DropCap — 문단 첫 글자 장식 ─────────────────────────────────────────────
export function DropCap({ children }) {
  if (getTheme() !== "uliger") return null;
  const text = String(children ?? "");
  if (!text) return null;
  const first = text.slice(0, 1);
  const rest = text.slice(1);
  return (
    <p style={{ margin: 0, fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.9, color: C.ink, opacity: .82 }}>
      <span style={{
        float: "left", fontFamily: SERIF_DISP, fontSize: 50, lineHeight: .82,
        padding: "4px 10px 0 0", color: C.gold, fontWeight: 700,
        textShadow: `1px 1px 0 ${C.navy}`,
      }}>{first}</span>
      {rest}
    </p>
  );
}

// ── SectionTitle — 섹션 헤딩용 Drop Cap 타이틀 ─────────────────────────────
export function SectionTitle({ children, subtitle }) {
  if (getTheme() !== "uliger") return null;
  const text = String(children ?? "");
  if (!text) return null;
  const first = text.slice(0, 1);
  const rest = text.slice(1);
  return (
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ margin: 0, fontFamily: SERIF_DISP, fontWeight: 700, fontSize: 25, color: C.ink, lineHeight: 1.15 }}>
        <span style={{
          display: "inline-block", fontSize: 44, lineHeight: .8, verticalAlign: "-0.1em",
          color: C.gold, textShadow: `1px 1px 0 ${C.navy}`, marginRight: 4,
        }}>{first}</span>
        {rest}
      </h2>
      {subtitle && <div style={{ fontFamily: SERIF, fontSize: 12.5, color: C.ink, opacity: .55, marginTop: 6 }}>{subtitle}</div>}
    </div>
  );
}

// ── FilterBar — 가로 스크롤 카테고리 필터 바 (리본 탭 스킨, 일반 토글) ───────
// 책장을 넘기지 않고 표준 필터처럼 그 자리에서 목록만 갈아끼우는 용도
export function FilterBar({ items = [], active, onChange }) {
  if (getTheme() !== "uliger") return null;
  return (
    <div style={{ display: "flex", gap: 10, overflowX: "auto", padding: "2px 2px 16px", WebkitOverflowScrolling: "touch" }}>
      {items.map(it => (
        <RibbonTab key={it.value} label={it.label} color={it.color || "navy"}
          active={active === it.value} onClick={() => onChange?.(it.value)} />
      ))}
    </div>
  );
}

// ── ProductCard — 표준 그리드 카드 (아치 프레임 + 세리프 타이포 + 왁스 실 CTA)
export function ProductCard({ image, title, price, badge, onAdd, ctaLabel = "담기" }) {
  if (getTheme() !== "uliger") return null;
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
      padding: "22px 18px", borderRadius: 14,
      border: `1px solid rgba(212,175,55,.32)`,
      boxShadow: "0 12px 30px -18px rgba(15,23,42,.4)",
      ...paperTextureStyle, boxSizing: "border-box",
    }}>
      <ArchFrame src={image} alt={title} size={148} ribbon={badge ? { label: badge } : undefined} />
      <div style={{ textAlign: "center", width: "100%" }}>
        <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 14.5, color: C.ink, lineHeight: 1.35 }}>{title}</div>
        {price && <div style={{ fontFamily: SERIF, fontSize: 13, color: C.goldDeep, marginTop: 5, letterSpacing: ".02em" }}>{price}</div>}
      </div>
      <WaxSeal size={48} onClick={onAdd}>{ctaLabel}</WaxSeal>
    </div>
  );
}

// ── ProductGrid — 종이 질감 컨테이너 위 반응형 2~3단 그리드 (표준 스크롤형) ──
// 책장을 넘기는 대신 일반 이커머스처럼 그리드를 그대로 스크롤해서 탐색
export function ProductGrid({ children, columns = 3 }) {
  if (getTheme() !== "uliger") return null;
  return (
    <div className="toono-story-grid" style={{
      "--toono-cols": columns,
      display: "grid", gridTemplateColumns: "repeat(var(--toono-cols), 1fr)", gap: 18,
      padding: 22, borderRadius: 18, boxSizing: "border-box",
      border: `1px solid ${C.paperEdge}`,
      ...paperTextureStyle,
    }}>
      {children}
      <style>{`
        @media (max-width: 760px)  { .toono-story-grid { --toono-cols: 2 !important; } }
        @media (max-width: 480px)  { .toono-story-grid { --toono-cols: 1 !important; } }
      `}</style>
    </div>
  );
}
