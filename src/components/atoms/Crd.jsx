"use client";

import { T } from "@/theme/colors";

export default function Crd({ children, onClick, style }) {
  return (
    <div
      onClick={onClick}
      className={onClick ? "toono-card toono-card-tap" : "toono-card"}
      style={{
        background: T.bg,
        border: `1px solid ${T.borderLight}`,
        borderRadius: 12,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
      onMouseEnter={(e) => { if (onClick) { e.currentTarget.style.borderColor = T.borderMid; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; } }}
      onMouseLeave={(e) => { if (onClick) { e.currentTarget.style.borderColor = T.borderLight; e.currentTarget.style.boxShadow = "none"; } }}
    >
      {children}
    </div>
  );
}
