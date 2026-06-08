"use client";

import { useState, useEffect } from "react";

// 양장본 동화책을 펼쳐보는 듯한 웹북(Web Book) 컴포넌트
// spread.type: "spread"(전면 일러스트 합본형) | "split"(텍스트·일러스트 분할형) | "bordered"(장식 테두리 면지형)
// 데스크탑: 좌·우 두 페이지가 한 펼침면으로 표시 / 모바일: 한 번에 한 페이지씩 자연 전환

const C = {
  navyDeep: "#0F172A",
  navy:     "#1E293B",
  paper:    "#FBF6EC",
  gold:     "#D4AF37",
  ink:      "#15171C",
};

const SERIF = "Georgia, 'Iowan Old Style', 'Noto Serif', 'Times New Roman', serif";

const SPINE_GRADIENT = "linear-gradient(to right, rgba(0,0,0,.16), rgba(0,0,0,.42) 50%, rgba(0,0,0,.16))";

const STACK_SHADOW = [
  `7px 7px 0 -2px ${C.paper}`,
  "7px 7px 0 -1px rgba(0,0,0,.08)",
  `14px 14px 0 -4px ${C.paper}`,
  "14px 14px 0 -3px rgba(0,0,0,.06)",
  "0 26px 64px -12px rgba(0,0,0,.5)",
].join(", ");

function PageNumber({ n, dock = "bottom" }) {
  if (n == null) return null;
  return (
    <div style={{
      position: "absolute", left: "50%", transform: "translateX(-50%)", [dock]: 14,
      width: 28, height: 28, borderRadius: "50%",
      border: `1px solid ${C.gold}`, background: "rgba(255,255,255,.55)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2,
    }}>
      <span style={{ fontFamily: SERIF, fontSize: 11, color: C.ink, letterSpacing: ".02em" }}>{n}</span>
    </div>
  );
}

// 별자리 모티프 코너 장식 — 장식 테두리형(면지)에서 사용
function CornerMotif({ corner }) {
  const pos = {
    tl: { top: 12, left: 12 },
    tr: { top: 12, right: 12, transform: "scaleX(-1)" },
    bl: { bottom: 12, left: 12, transform: "scaleY(-1)" },
    br: { bottom: 12, right: 12, transform: "scale(-1,-1)" },
  }[corner];
  return (
    <svg width="36" height="36" viewBox="0 0 38 38" fill="none" style={{ position: "absolute", ...pos }} aria-hidden="true">
      <path d="M4 34C4 18 18 4 34 4" stroke={C.gold} strokeWidth="1.4" fill="none" opacity=".75" />
      <path d="M4 34C4 24 12 14 22 11" stroke={C.navy} strokeWidth="1" fill="none" opacity=".4" />
      <path d="M9 8.5l1.6 3.7 3.8 1.6-3.8 1.6L9 19.1l-1.6-3.7-3.8-1.6 3.8-1.6L9 8.5Z" fill={C.gold} />
    </svg>
  );
}

function FullBleedHalf({ page, side, pageNumber }) {
  return (
    <div style={{
      flex: 1, position: "relative", overflow: "hidden",
      background: page.image
        ? `url(${page.image})`
        : `radial-gradient(circle at ${side === "left" ? "72%" : "28%"} 32%, ${C.navy}, ${C.navyDeep})`,
      backgroundSize: page.image ? "200% 100%" : undefined,
      backgroundPosition: page.image ? (side === "left" ? "left center" : "right center") : undefined,
      backgroundRepeat: "no-repeat",
      minHeight: 320,
    }}>
      {page.caption && (
        <div style={{
          position: "absolute", bottom: 56, [side]: 26, maxWidth: "62%",
          textAlign: side,
        }}>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: C.paper, lineHeight: 1.7, textShadow: "0 2px 14px rgba(0,0,0,.65)" }}>{page.caption}</div>
        </div>
      )}
      <PageNumber n={pageNumber} />
    </div>
  );
}

function SplitHalf({ page, role, pageNumber }) {
  if (role === "text") {
    return (
      <div style={{ flex: 1, position: "relative", background: C.paper, padding: "44px 38px", display: "flex", flexDirection: "column", justifyContent: "center", boxSizing: "border-box" }}>
        {page.eyebrow && <div style={{ fontFamily: SERIF, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: C.gold, marginBottom: 14 }}>{page.eyebrow}</div>}
        {page.title && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 25, color: C.ink, lineHeight: 1.32, marginBottom: 16, whiteSpace: "pre-line" }}>{page.title}</div>}
        {page.text && <div style={{ fontFamily: SERIF, fontSize: 14.5, color: C.ink, lineHeight: 1.9, whiteSpace: "pre-line", opacity: .86 }}>{page.text}</div>}
        <PageNumber n={pageNumber} />
      </div>
    );
  }
  return (
    <div style={{ flex: 1, position: "relative", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{
        width: "70%", aspectRatio: "1 / 1", borderRadius: "50%", overflow: "hidden",
        border: `3px solid ${C.gold}`,
        boxShadow: `0 0 0 7px ${C.navyDeep}, 0 0 0 8px rgba(212,175,55,.32)`,
        background: page.image ? `url(${page.image}) center / cover no-repeat` : `radial-gradient(circle, ${C.navy}, ${C.navyDeep})`,
      }} />
      <PageNumber n={pageNumber} />
    </div>
  );
}

function BorderedHalf({ page, pageNumber }) {
  return (
    <div style={{ flex: 1, position: "relative", background: C.paper, padding: 20, boxSizing: "border-box" }}>
      <div style={{ position: "absolute", inset: 20, border: `1.5px solid ${C.gold}`, borderRadius: 4 }} />
      <div style={{ position: "absolute", inset: 26, border: `1px solid ${C.navy}`, opacity: .32, borderRadius: 2 }} />
      <CornerMotif corner="tl" /><CornerMotif corner="tr" /><CornerMotif corner="bl" /><CornerMotif corner="br" />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 28px" }}>
        {page.eyebrow && <div style={{ fontFamily: SERIF, fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: C.gold, marginBottom: 14 }}>{page.eyebrow}</div>}
        {page.title && <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 23, color: C.ink, lineHeight: 1.4, marginBottom: 12, whiteSpace: "pre-line" }}>{page.title}</div>}
        {page.text && <div style={{ fontFamily: SERIF, fontSize: 13.5, color: C.ink, lineHeight: 1.85, whiteSpace: "pre-line", opacity: .76 }}>{page.text}</div>}
      </div>
      <PageNumber n={pageNumber} />
    </div>
  );
}

function renderHalf(spread, side, pageNumber) {
  if (spread.type === "spread") return <FullBleedHalf page={spread} side={side} pageNumber={pageNumber} />;
  if (spread.type === "split") {
    const textOnLeft = !spread.flip;
    const role = (side === "left") === textOnLeft ? "text" : "illustration";
    return <SplitHalf page={spread} role={role} pageNumber={pageNumber} />;
  }
  return <BorderedHalf page={spread} pageNumber={pageNumber} />;
}

export default function WebBook({ pages = [] }) {
  const [idx, setIdx] = useState(0);
  const [mobilePage, setMobilePage] = useState(0); // 0: 좌(또는 단독) 면 / 1: 우 면 — 모바일에서만 사용
  const [isMobile, setIsMobile] = useState(false);
  const total = pages.length;
  const spread = pages[idx] || {};

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const goSpread = (d) => { setIdx(i => Math.min(total - 1, Math.max(0, i + d))); setMobilePage(0); };
  const goMobile = (d) => {
    const next = mobilePage + d;
    if (next < 0) { if (idx > 0) { setIdx(idx - 1); setMobilePage(1); } }
    else if (next > 1) { if (idx < total - 1) { setIdx(idx + 1); setMobilePage(0); } }
    else setMobilePage(next);
  };
  const next = () => isMobile ? goMobile(1) : goSpread(1);
  const prev = () => isMobile ? goMobile(-1) : goSpread(-1);
  const atStart = isMobile ? (idx === 0 && mobilePage === 0) : idx === 0;
  const atEnd = isMobile ? (idx === total - 1 && mobilePage === 1) : idx === total - 1;

  const leftNum = idx * 2 + 1;
  const rightNum = idx * 2 + 2;

  return (
    <div className="toono-webbook" style={{
      width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
      padding: "36px 18px", borderRadius: 26, boxSizing: "border-box",
      background: `radial-gradient(ellipse at 50% 0%, ${C.navy} 0%, ${C.navyDeep} 70%)`,
    }}>
      <div className="toono-webbook-spread" data-mobile-page={mobilePage} style={{
        position: "relative", display: "flex", flexDirection: "row", width: "100%", maxWidth: 940,
        aspectRatio: "16 / 10", borderRadius: 8, overflow: "hidden", background: C.paper, boxShadow: STACK_SHADOW,
      }}>
        <div className="toono-webbook-half toono-webbook-left" style={{ display: "flex", flex: 1 }}>
          {renderHalf(spread, "left", leftNum)}
        </div>
        <div className="toono-webbook-spine" aria-hidden="true" style={{
          position: "absolute", top: 0, bottom: 0, left: "50%", width: 60, transform: "translateX(-50%)",
          background: SPINE_GRADIENT, pointerEvents: "none", zIndex: 5,
        }} />
        <div className="toono-webbook-half toono-webbook-right" style={{ display: "flex", flex: 1 }}>
          {renderHalf(spread, "right", rightNum)}
        </div>
      </div>

      {/* 내비게이션 */}
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <button type="button" aria-label="이전 페이지" onClick={prev} disabled={atStart}
          style={{ width: 38, height: 38, borderRadius: "50%", border: `1px solid ${C.gold}`, background: "rgba(255,255,255,.06)", color: C.gold, cursor: atStart ? "default" : "pointer", opacity: atStart ? .35 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <span style={{ fontFamily: SERIF, fontSize: 13, color: C.paper, letterSpacing: ".07em" }}>
          {isMobile ? `${idx * 2 + mobilePage + 1} / ${total * 2}` : `${idx + 1} / ${total}`}
        </span>
        <button type="button" aria-label="다음 페이지" onClick={next} disabled={atEnd}
          style={{ width: 38, height: 38, borderRadius: "50%", border: `1px solid ${C.gold}`, background: "rgba(255,255,255,.06)", color: C.gold, cursor: atEnd ? "default" : "pointer", opacity: atEnd ? .35 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .toono-webbook-spread { aspect-ratio: 3 / 4 !important; max-width: 420px !important; }
          .toono-webbook-spine { display: none !important; }
          .toono-webbook-spread[data-mobile-page="0"] .toono-webbook-right { display: none !important; }
          .toono-webbook-spread[data-mobile-page="1"] .toono-webbook-left { display: none !important; }
        }
      `}</style>
    </div>
  );
}
