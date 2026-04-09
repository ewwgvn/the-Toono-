"use client";

import { T } from "@/theme/colors";
import Toono from "@/components/atoms/Toono";

export default function Avt({ size = 44, color = T.accent, photo, children, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "#F7F7F7",
        border: `1px solid ${T.borderLight}`,
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
        children || <Toono size={Math.round(size * 0.55)} color="#111111" />
      )}
    </div>
  );
}
