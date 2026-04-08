"use client";

import { T } from "@/theme/colors";

export default function Crd({ children, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: T.s1,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        transition: "all .15s",
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.borderColor = T.borderMid;
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.borderColor = T.border;
      }}
    >
      {children}
    </div>
  );
}
