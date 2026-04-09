"use client";

import { T } from "@/theme/colors";

export default function Pill({ children, color = T.textSub, bg }) {
  return (
    <span
      style={{
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
        fontSize: 11,
        fontWeight: 500,
        color,
        background: bg || "#F7F7F7",
        padding: "4px 10px",
        borderRadius: 20,
        display: "inline-block",
        letterSpacing: "0.01em",
      }}
    >
      {children}
    </span>
  );
}
