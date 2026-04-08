"use client";

import { T } from "@/theme/colors";

export default function PBtn({ children, onClick, full, loading, disabled, small, secondary, danger }) {
  const bg = danger ? T.red : secondary ? T.accentSub : T.accent;
  const col = danger || !secondary ? "#fff" : T.accent;
  return (
    <button
      onClick={!loading && !disabled ? onClick : undefined}
      style={{
        background: disabled ? T.s2 : bg,
        border: secondary ? `1px solid ${T.accentGlow}` : "none",
        borderRadius: 12,
        padding: small ? "8px 18px" : "14px 22px",
        color: disabled ? T.textSub : col,
        fontFamily: "system-ui",
        fontSize: small ? 13 : 15,
        fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        width: full ? "100%" : "auto",
        opacity: loading ? 0.7 : 1,
        transition: "all .15s",
        letterSpacing: "-.01em",
        transform: "scale(1)",
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) e.currentTarget.style.transform = "scale(0.97)";
      }}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {loading ? (
        <span style={{ display: "inline-flex", gap: 3 }}>
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              background: col,
              animation: "pulse 1s infinite",
              animationDelay: "0s",
            }}
          />
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              background: col,
              animation: "pulse 1s infinite",
              animationDelay: ".2s",
            }}
          />
          <span
            style={{
              width: 4,
              height: 4,
              borderRadius: 2,
              background: col,
              animation: "pulse 1s infinite",
              animationDelay: ".4s",
            }}
          />
        </span>
      ) : (
        children
      )}
    </button>
  );
}
