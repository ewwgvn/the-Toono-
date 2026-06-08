"use client";

import { getTheme, ULIGER_DECOR as D } from "@/theme/colors";

// 동화책 삽화풍 장식 요소 — "uliger" 테마일 때만 노출 (별·초승달·구름·꽃 낙서)
// variant: "stars" | "moon" | "cloud" | "flower"
export default function StoryDecor({ variant = "stars", size = 64, style }) {
  if (getTheme() !== "uliger") return null;

  const common = { width: size, height: size, style: { flexShrink: 0, ...style } };

  if (variant === "moon") {
    return (
      <svg {...common} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M40 8c-12 2-20 13-20 24s8 22 20 24c-16 2-30-9-30-24S24 6 40 8Z" fill={D.ink} />
        <circle cx="46" cy="14" r="2" fill={D.paper} />
        <circle cx="54" cy="24" r="1.4" fill={D.paper} opacity=".8" />
        <circle cx="50" cy="36" r="1" fill={D.paper} opacity=".6" />
      </svg>
    );
  }

  if (variant === "cloud") {
    return (
      <svg {...common} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M16 40c-5 0-9-3.6-9-8.5S11 23 16 23c.9-6 6.6-10.5 13-10.5 6 0 11 3.8 12.7 9.1 5.6.5 10.3 5 10.3 10.4 0 5.5-4.6 8-10 8H16Z" fill={D.stone} opacity=".55" />
      </svg>
    );
  }

  if (variant === "flower") {
    return (
      <svg {...common} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <g transform="translate(32,30)">
          <ellipse rx="9" ry="13" transform="rotate(0)" fill={D.stone} opacity=".8" />
          <ellipse rx="9" ry="13" transform="rotate(72)" fill={D.stone} opacity=".8" />
          <ellipse rx="9" ry="13" transform="rotate(144)" fill={D.stone} opacity=".8" />
          <ellipse rx="9" ry="13" transform="rotate(216)" fill={D.stone} opacity=".8" />
          <ellipse rx="9" ry="13" transform="rotate(288)" fill={D.stone} opacity=".8" />
          <circle r="6" fill={D.red} />
        </g>
        <path d="M32 50v12M32 62c-4 0-7-3-7-3s2 5 7 5 7-5 7-5-3 3-7 3Z" stroke={D.ink} strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".55" />
      </svg>
    );
  }

  // stars (default) — scattered hand-drawn-style sparkles
  return (
    <svg {...common} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M14 8l2.4 5.6L22 16l-5.6 2.4L14 24l-2.4-5.6L6 16l5.6-2.4L14 8Z" fill={D.red} />
      <path d="M48 14l1.6 3.8L53.4 19.4l-3.8 1.6L48 24.8l-1.6-3.8L42.6 19.4l3.8-1.6L48 14Z" fill={D.stone} />
      <circle cx="34" cy="42" r="2.2" fill={D.ink} opacity=".7" />
      <circle cx="54" cy="46" r="1.5" fill={D.red} opacity=".8" />
    </svg>
  );
}
