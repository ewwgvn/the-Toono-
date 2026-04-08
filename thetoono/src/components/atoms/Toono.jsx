"use client";

import { T } from "@/theme/colors";
import { TOONO_B64 } from "@/components/atoms/toono-b64";

export default function Toono({ size = 32, color = T.accent }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: "inline-block",
        backgroundColor: color,
        WebkitMaskImage: `url(${TOONO_B64})`,
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskImage: `url(${TOONO_B64})`,
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
      }}
    />
  );
}
