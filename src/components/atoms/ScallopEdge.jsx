"use client";

import { getTheme } from "@/theme/colors";

// 동화책 키치 무드의 물결(스캘럽) 가장자리 — 색면 섹션이나 펼친 책 내지의 경계를
// 책장을 펼친 듯한 곡선/제본선으로 마감. "uliger" 테마에서만 노출.
// orientation: "horizontal"(가로 폭 전체, 위·아래 경계용) | "vertical"(세로 높이 전체, 좌·우 책장 가르는 제본선용)
// flip: true면 곡률 방향을 뒤집어 반대쪽 가장자리/페이지에 맞춤
export default function ScallopEdge({ color, size = 22, orientation = "horizontal", flip = false, style }) {
  if (getTheme() !== "uliger") return null;

  if (orientation === "vertical") {
    return (
      <svg
        viewBox="0 0 24 320"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ display: "block", width: size, height: "100%", transform: flip ? "scaleX(-1)" : "none", flexShrink: 0, ...style }}
      >
        <path
          d="M0 0 C 22 14 22 38 0 52 C 22 66 22 90 0 104 C 22 118 22 142 0 156 C 22 170 22 194 0 208 C 22 222 22 246 0 260 C 22 274 22 298 0 312 L0 320 L24 320 L24 0 Z"
          fill={color}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 240 24"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: size, transform: flip ? "scaleY(-1)" : "none", ...style }}
    >
      <path
        d="M0 0 C 10 22 30 22 40 0 C 50 22 70 22 80 0 C 90 22 110 22 120 0 C 130 22 150 22 160 0 C 170 22 190 22 200 0 C 210 22 230 22 240 0 L240 0 L0 0 Z"
        fill={color}
      />
    </svg>
  );
}
