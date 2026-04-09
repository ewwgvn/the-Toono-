"use client";

import { T } from "@/theme/colors";

export default function Crd({ children, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "#FFFFFF",
        border: `1px solid ${T.borderLight}`,
        borderRadius: 8,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: "border-color 150ms ease",
        ...style,
      }}
      onMouseEnter={(e) => { if (onClick) e.currentTarget.style.borderColor = T.border; }}
      onMouseLeave={(e) => { if (onClick) e.currentTarget.style.borderColor = T.borderLight; }}
    >
      {children}
    </div>
  );
}
