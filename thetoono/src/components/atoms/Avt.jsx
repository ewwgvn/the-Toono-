"use client";

import { T } from "@/theme/colors";
import Toono from "@/components/atoms/Toono";

export default function Avt({ size = 44, color = T.accent, photo, children, onClick }) {
  const r = Math.round(size * 0.33);
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: color + "22",
        border: `1.5px solid ${color}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {photo ? (
        <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        children || <Toono size={Math.round(size * 0.65)} color={color} />
      )}
    </div>
  );
}
