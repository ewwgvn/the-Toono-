"use client";

import { T } from "@/theme/colors";

export default function Pill({ children, color = "#444444", bg }) {
  return (
    <span
      style={{
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: 11,
        fontWeight: 600,
        color,
        background: bg || "#F2F2F2",
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
