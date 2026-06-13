"use client";

import { T } from "@/theme/colors";
import { a11yClick } from "@/lib/utils";
import Toono from "@/components/atoms/Toono";

// Avatar — plain <img> (handles both storage URLs and base64 data URLs).
// Intentionally NOT next/image: avatars are tiny and the optimizer caused
// inconsistent rendering across screens.
export default function Avt({ size = 44, color = T.accent, photo, children, onClick }) {
  return (
    <div
      {...a11yClick(onClick)}
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
        <img src={photo} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        children || <Toono size={Math.round(size * 0.55)} color={T.textH} />
      )}
    </div>
  );
}
