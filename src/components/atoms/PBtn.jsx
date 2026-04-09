"use client";

import { T } from "@/theme/colors";

export default function PBtn({ children, onClick, full, loading, disabled, small, secondary, danger }) {
  const bg = disabled ? "#E5E5E5" : danger ? T.red : secondary ? "transparent" : "#111111";
  const col = disabled ? "#999999" : danger ? "#FFFFFF" : secondary ? "#111111" : "#FFFFFF";
  const border = secondary ? "1px solid #111111" : "none";
  return (
    <button
      onClick={!loading && !disabled ? onClick : undefined}
      style={{
        background: bg,
        border,
        borderRadius: 20,
        padding: small ? "8px 20px" : "12px 24px",
        color: col,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: small ? 13 : 14,
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        width: full ? "100%" : "auto",
        opacity: loading ? 0.7 : 1,
        transition: "all 150ms ease",
        letterSpacing: "0.01em",
      }}
    >
      {loading ? (
        <span style={{ display: "inline-flex", gap: 3 }}>
          {[0, 0.2, 0.4].map((d) => (
            <span key={d} style={{ width: 4, height: 4, borderRadius: 2, background: col, animation: "pulse 1s infinite", animationDelay: `${d}s` }} />
          ))}
        </span>
      ) : children}
    </button>
  );
}
