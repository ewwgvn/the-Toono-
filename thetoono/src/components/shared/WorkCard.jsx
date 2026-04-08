"use client";

import { T } from "@/theme/colors";
import { fmtP } from "@/lib/utils";
import { IcHeart, IcBookmark } from "@/components/icons";
import Crd from "@/components/atoms/Crd";
import Toono from "@/components/atoms/Toono";

export default function WorkCard({ work: w, onClick, onToggleLike, onToggleSave, horizontal, liked, saved }) {
  const thumb = w.images?.[0] || null;

  if (horizontal) {
    return (
      <Crd onClick={onClick} style={{ display: "flex", marginBottom: 10 }}>
        <div
          style={{
            width: 90,
            height: 90,
            background: (w.accent || T.accent) + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {thumb ? (
            <img src={thumb} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Toono size={50} color={w.accent || T.accent} />
          )}
        </div>
        <div style={{ flex: 1, padding: "12px 14px", borderLeft: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: "system-ui", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 3 }}>{w.title}</div>
          <div style={{ fontFamily: "system-ui", fontSize: 12, color: T.textSub, marginBottom: 8 }}>{w.creator}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "system-ui", fontSize: 14, fontWeight: 700, color: T.accent }}>{fmtP(w)}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(w.id); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: saved ? T.accent : T.textSub }}
              >
                <IcBookmark filled={saved} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleLike && onToggleLike(w.id); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: liked ? T.red : T.textSub }}
              >
                <IcHeart filled={liked} />
              </button>
            </div>
          </div>
        </div>
      </Crd>
    );
  }

  return (
    <Crd onClick={onClick}>
      <div
        style={{
          height: 120,
          background: thumb ? T.s2 : `linear-gradient(145deg,${w.accent || T.accent}20,${w.accent || T.accent}06)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Toono size={64} color={w.accent || T.accent} />
        )}
        {w.badge && (
          <span
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              fontFamily: "system-ui",
              fontSize: 9,
              fontWeight: 700,
              color: "#fff",
              background: w.accent || T.accent,
              padding: "3px 8px",
              borderRadius: 6,
            }}
          >
            {w.badge}
          </span>
        )}
        {w.digital && (
          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              fontFamily: "system-ui",
              fontSize: 8,
              fontWeight: 700,
              color: "#8850D4",
              background: "rgba(136,80,212,0.2)",
              padding: "2px 6px",
              borderRadius: 5,
            }}
          >
            &darr;
          </span>
        )}
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div
          style={{
            fontFamily: "system-ui",
            fontSize: 12,
            fontWeight: 700,
            color: T.textH,
            lineHeight: 1.4,
            marginBottom: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {w.title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "system-ui", fontSize: 13, fontWeight: 700, color: T.accent }}>{fmtP(w)}</div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(w.id); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: saved ? T.accent : T.textDim, display: "flex" }}
          >
            <IcBookmark filled={saved} />
          </button>
        </div>
      </div>
    </Crd>
  );
}
