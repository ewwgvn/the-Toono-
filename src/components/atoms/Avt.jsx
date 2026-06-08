"use client";

import Image from "next/image";
import { T } from "@/theme/colors";
import Toono from "@/components/atoms/Toono";

export default function Avt({ size = 44, color = T.accent, photo, children, onClick }) {
  const isUrl = photo && !photo.startsWith("data:");
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: T.s2,
        border: `1px solid ${T.borderLight}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: onClick ? "pointer" : "default",
        flexShrink: 0,
        overflow: "hidden",
        position: "relative",
      }}
    >
      {photo ? (
        isUrl
          ? <Image src={photo} fill alt="" sizes={`${size}px`} style={{ objectFit: "cover" }} />
          : <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        children || <Toono size={Math.round(size * 0.55)} color={T.textH} />
      )}
    </div>
  );
}
