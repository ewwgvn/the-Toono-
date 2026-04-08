"use client";

import { useState } from "react";
import { T } from "@/theme/colors";
import { fmtP } from "@/lib/utils";
import { IcHeart, IcBookmark, IcShare } from "@/components/icons";
import Crd from "@/components/atoms/Crd";
import Toono from "@/components/atoms/Toono";
import Avt from "@/components/atoms/Avt";

export default function WorkCard({ work: w, onClick, onCreatorClick, onToggleLike, onToggleSave, horizontal, feed, liked, saved }) {
  const thumb = w.images?.[0] || null;
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = w.images?.length ? w.images : [];

  // ── Feed mode (Instagram-style) ──
  if (feed) {
    return (
      <div style={{ marginBottom: 2, background: T.bg }}>
        {/* Creator header */}
        <div
          onClick={onCreatorClick}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px", cursor: onCreatorClick ? "pointer" : "default",
          }}
        >
          <Avt size={32} color={w.accent || T.accent} photo={w.creatorPhoto} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "system-ui", fontSize: 13, fontWeight: 700, color: T.textH }}>{w.creator}</div>
            {w.cat && <div style={{ fontFamily: "system-ui", fontSize: 11, color: T.textSub }}>{w.cat}</div>}
          </div>
          <div style={{ fontFamily: "system-ui", fontSize: 14, fontWeight: 700, color: T.accent }}>{fmtP(w)}</div>
        </div>

        {/* Image */}
        <div
          onClick={onClick}
          style={{
            width: "100%",
            aspectRatio: "1",
            background: T.s2,
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {imgs.length > 0 ? (
            <img src={imgs[imgIdx]} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(145deg,${w.accent || T.accent}20,${w.accent || T.accent}06)` }}>
              <Toono size={80} color={w.accent || T.accent} />
            </div>
          )}
          {w.badge && (
            <span style={{ position: "absolute", top: 12, left: 12, fontFamily: "system-ui", fontSize: 10, fontWeight: 700, color: "#fff", background: w.accent || T.accent, padding: "4px 10px", borderRadius: 8 }}>
              {w.badge}
            </span>
          )}
          {/* Image dots */}
          {imgs.length > 1 && (
            <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
              {imgs.map((_, i) => (
                <div
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                  style={{ width: 6, height: 6, borderRadius: 3, background: i === imgIdx ? "#fff" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "all .2s" }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ padding: "10px 14px 4px", display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flex: 1 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLike && onToggleLike(w.id); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: liked ? T.red : T.textSub, display: "flex", padding: 4 }}
            >
              <IcHeart filled={liked} />
            </button>
            <button
              onClick={onClick}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, display: "flex", padding: 4 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2.5 3H17.5V13.5H11L8 16.5V13.5H2.5V3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (navigator.share) navigator.share({ title: w.title, url: window.location.href }); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, display: "flex", padding: 4 }}
            >
              <IcShare />
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(w.id); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: saved ? T.accent : T.textSub, display: "flex", padding: 4 }}
          >
            <IcBookmark filled={saved} />
          </button>
        </div>

        {/* Title */}
        <div style={{ padding: "2px 16px 14px" }}>
          <span style={{ fontFamily: "system-ui", fontSize: 13, fontWeight: 700, color: T.textH }}>{w.creator}</span>
          <span style={{ fontFamily: "system-ui", fontSize: 13, color: T.text, marginLeft: 6 }}>{w.title}</span>
        </div>
      </div>
    );
  }

  // ── Horizontal mode ──
  if (horizontal) {
    return (
      <Crd onClick={onClick} style={{ display: "flex", marginBottom: 10 }}>
        <div
          style={{
            width: 90, height: 90,
            background: (w.accent || T.accent) + "18",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, overflow: "hidden",
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

  // ── Default grid card ──
  return (
    <Crd onClick={onClick}>
      <div
        style={{
          height: 120,
          background: thumb ? T.s2 : `linear-gradient(145deg,${w.accent || T.accent}20,${w.accent || T.accent}06)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}
      >
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Toono size={64} color={w.accent || T.accent} />
        )}
        {w.badge && (
          <span style={{ position: "absolute", top: 8, left: 8, fontFamily: "system-ui", fontSize: 9, fontWeight: 700, color: "#fff", background: w.accent || T.accent, padding: "3px 8px", borderRadius: 6 }}>
            {w.badge}
          </span>
        )}
        {w.digital && (
          <span style={{ position: "absolute", top: 8, right: 8, fontFamily: "system-ui", fontSize: 8, fontWeight: 700, color: "#8850D4", background: "rgba(136,80,212,0.2)", padding: "2px 6px", borderRadius: 5 }}>
            &darr;
          </span>
        )}
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontFamily: "system-ui", fontSize: 12, fontWeight: 700, color: T.textH, lineHeight: 1.4, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
