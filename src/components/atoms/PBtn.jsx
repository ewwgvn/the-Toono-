"use client";

import { T } from "@/theme/colors";

export default function PBtn({ children, onClick, full, loading, disabled, small, secondary, danger, type = "button", style }) {
  const isOff = disabled || loading;
  const bg = disabled ? T.border : danger ? T.red : secondary ? "transparent" : T.accent;
  const col = disabled ? T.textDim : danger ? "#FFFFFF" : secondary ? T.accent : "#FFFFFF";
  const border = secondary ? `1px solid ${T.border}` : danger ? "none" : "none";
  return (
    <button
      type={type}
      className="toono-btn"
      disabled={isOff}
      onClick={isOff ? undefined : onClick}
      style={{
        position: "relative",
        background: bg,
        border,
        borderRadius: 20,
        padding: small ? "8px 18px" : "13px 24px",
        color: col,
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: small ? 13 : 14,
        fontWeight: 600,
        cursor: isOff ? "not-allowed" : "pointer",
        width: full ? "100%" : "auto",
        letterSpacing: "0.01em",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      {loading && (
        <span
          aria-hidden="true"
          style={{
            width: small ? 13 : 15,
            height: small ? 13 : 15,
            borderRadius: "50%",
            border: `2px solid ${secondary ? "rgba(17,17,17,0.25)" : "rgba(255,255,255,0.35)"}`,
            borderTopColor: col,
            animation: "spin 0.7s linear infinite",
          }}
        />
      )}
      <span style={{ opacity: loading ? 0.85 : 1, display: "inline-flex", alignItems: "center", gap: 4 }}>{children}</span>
    </button>
  );
}
