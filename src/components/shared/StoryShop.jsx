"use client";

import { useState } from "react";
import { getTheme } from "@/theme/colors";

// 동화책 감성의 마켓플레이스 UI 부품 모음
// - ArchFrame   : 아치형 게이트 + 필리그리 코너 골드 프레임 (상품 이미지)
// - RibbonTab   : 실크 책갈피 리본 형태의 필터/카테고리 탭
// - WaxSeal     : 골드 실링 왁스 인장 모양의 CTA 버튼
// - DropCap     : 문단 첫 글자 장식(Drop Cap)
// - PageFlip    : 종이가 펄럭이며 넘어가는 CSS 3D 페이지 전환 래퍼

const C = {
  navyDeep: "#0F172A",
  navy:     "#1E293B",
  paper:    "#FBF8F3",   // 바랜 종이/파피루스 톤
  paperEdge:"#EFE6D6",
  gold:     "#D4AF37",
  goldDeep: "#A9831F",
  ink:      "#15171C",
};

const SERIF      = "Georgia, 'Iowan Old Style', 'Noto Serif', 'Times New Roman', serif";
const SERIF_DISP = "'Playfair Display', Georgia, 'Noto Serif', serif";

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

// ── PageFlip — 종이가 펄럭이며 넘어가는 3D 전환 래퍼 ────────────────────────
// activeKey가 바뀔 때마다 직전 내용이 책장처럼 앞으로 접히고 새 내용이 펼쳐짐 (CSS 3D perspective)
export function PageFlip({ activeKey, children }) {
  const isUliger = getTheme() === "uliger";
  const [display, setDisplay] = useState({ key: activeKey, node: children, phase: "idle" });

  // 모노 테마에서는 책장 넘김 연출 없이 그대로 통과 — 공존 원칙 유지
  if (!isUliger) return <>{children}</>;

  if (activeKey !== display.key && display.phase === "idle") {
    setDisplay({ key: display.key, node: display.node, phase: "out", nextKey: activeKey, nextNode: children });
  }

  return (
    <div style={{ perspective: 1400 }}>
      <div
        key={display.phase === "out" ? `out-${display.key}` : `in-${display.key}`}
        onAnimationEnd={() => {
          if (display.phase === "out") {
            setDisplay({ key: display.nextKey, node: display.nextNode, phase: "in" });
          } else if (display.phase === "in") {
            setDisplay(d => ({ ...d, phase: "idle" }));
          }
        }}
        style={{
          transformOrigin: "left center", transformStyle: "preserve-3d",
          animation: display.phase === "out" ? "toono-pf-out .38s cubic-bezier(.4,0,.2,1) forwards"
                   : display.phase === "in"  ? "toono-pf-in .42s cubic-bezier(.2,.8,.2,1) forwards"
                   : "none",
        }}
      >
        {display.phase === "out" ? display.node : (display.phase === "in" ? display.nextNode ?? display.node : display.node)}
      </div>
      <style>{`
        @keyframes toono-pf-out {
          0%   { transform: rotateY(0deg);   filter: brightness(1);    box-shadow: none; }
          100% { transform: rotateY(-100deg);filter: brightness(.55); box-shadow: 30px 0 40px -20px rgba(0,0,0,.5); }
        }
        @keyframes toono-pf-in {
          0%   { transform: rotateY(100deg);  filter: brightness(.55); }
          100% { transform: rotateY(0deg);    filter: brightness(1); }
        }
      `}</style>
    </div>
  );
}
