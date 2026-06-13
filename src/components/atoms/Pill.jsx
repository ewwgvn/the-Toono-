"use client";

import { T } from "@/theme/colors";

export default function Pill({ children, color = T.textB, bg }) {
  return (
    <span
      style={{
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: 11,
        fontWeight: 600,
        color,
        background: bg || T.s2,
        padding: "4px 11px",
        borderRadius: 20,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}
