"use client";

import { getTheme } from "@/theme/colors";

// 동화책 키치 무드의 물결(스캘럽) 가장자리 — 색면 섹션이나 카드의 경계를
// 책장을 펼친 듯한 곡선으로 마감. "uliger" 테마에서만 노출.
// flip: true면 위아래를 뒤집어 반대쪽 가장자리에 사용
export default function ScallopEdge({ color, height = 22, flip = false, style }) {
  if (getTheme() !== "uliger") return null;
  return (
    <svg
      viewBox="0 0 240 24"
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: "block", width: "100%", height, transform: flip ? "scaleY(-1)" : "none", ...style }}
    >
      <path
        d="M0 0 C 10 22 30 22 40 0 C 50 22 70 22 80 0 C 90 22 110 22 120 0 C 130 22 150 22 160 0 C 170 22 190 22 200 0 C 210 22 230 22 240 0 L240 0 L0 0 Z"
        fill={color}
      />
    </svg>
  );
}
