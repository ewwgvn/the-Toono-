"use client";

import { T } from "@/theme/colors";

export default function Pill({ children, color = T.accent, bg }) {
  return (
    <span
      style={{
        fontFamily: "system-ui",
        fontSize: 11,
        fontWeight: 600,
        color,
        background: bg || color + "18",
        padding: "4px 10px",
        borderRadius: 20,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}
