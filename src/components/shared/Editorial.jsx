"use client";

import { T } from "@/theme/colors";

const HELV = "'Helvetica Neue', Arial, sans-serif";
// NOTE: kept for backward-compat imports. Local fonts (Caveat/Stardom) lack
// Mongolian Cyrillic (Ү ү Ө ө) and the ₮ sign, so display text uses Helvetica.
export const SCRIPT = HELV;

// ── Centered section label with flanking hairlines (editorial) ──
export function SectionLabel({ children, color = T.accent, mt = 0, mb = 16 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: mt, marginBottom: mb }}>
      <div style={{ flex: 1, height: 1, background: T.border }} />
      <span style={{ fontFamily: HELV, fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color, whiteSpace: "nowrap" }}>{children}</span>
      <div style={{ flex: 1, height: 1, background: T.border }} />
    </div>
  );
}

// ── Bold editorial display heading (Helvetica, tight tracking) ──
export function Display({ children, size = 28, color = T.textH, align = "left", weight = 800, style }) {
  return (
    <div style={{ fontFamily: HELV, fontSize: size, fontWeight: weight, color, textAlign: align, lineHeight: 1.08, letterSpacing: "-0.02em", ...style }}>
      {children}
    </div>
  );
}
// Backward-compat alias
export const ScriptTitle = Display;

// ── Small uppercase kicker ──
export function Kicker({ children, color = T.textDim, align = "center" }) {
  return (
    <div style={{ fontFamily: HELV, fontSize: 10, fontWeight: 600, letterSpacing: "0.24em", textTransform: "uppercase", color, textAlign: align }}>{children}</div>
  );
}

// ── Diamond bullet ──
export function Diamond({ size = 8, color = T.accent }) {
  return <span style={{ display: "inline-block", width: size, height: size, background: color, transform: "rotate(45deg)" }} />;
}

// ── Solid accent tile with white label ──
export function AccentTile({ label, sub, onClick, aspect = "1" }) {
  return (
    <div onClick={onClick} style={{ aspectRatio: aspect, background: T.accent, borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 14, cursor: onClick ? "pointer" : "default", textAlign: "center" }}>
      <span style={{ fontFamily: HELV, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#fff", lineHeight: 1.3 }}>{label}</span>
      {sub && <span style={{ fontFamily: HELV, fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)", marginTop: 6, textTransform: "uppercase" }}>{sub}</span>}
    </div>
  );
}
