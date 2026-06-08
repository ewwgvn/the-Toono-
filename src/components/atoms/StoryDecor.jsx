"use client";

import { getTheme, ULIGER_DECOR as D } from "@/theme/colors";

// 동화책 삽화풍 장식 요소 — "uliger" 테마일 때만 노출 (별·초승달·구름)
// variant: "stars" | "moon" | "cloud"
export default function StoryDecor({ variant = "stars", size = 64, style }) {
  if (getTheme() !== "uliger") return null;

  const common = { width: size, height: size, style: { flexShrink: 0, ...style } };

  if (variant === "moon") {
    return (
      <svg {...common} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M40 8c-12 2-20 13-20 24s8 22 20 24c-16 2-30-9-30-24S24 6 40 8Z" fill={D.navy} />
        <circle cx="46" cy="14" r="2" fill={D.star} />
        <circle cx="54" cy="24" r="1.4" fill={D.star} opacity=".8" />
        <circle cx="50" cy="36" r="1" fill={D.star} opacity=".6" />
      </svg>
    );
  }

  if (variant === "cloud") {
    return (
      <svg {...common} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M16 40c-5 0-9-3.6-9-8.5S11 23 16 23c.9-6 6.6-10.5 13-10.5 6 0 11 3.8 12.7 9.1 5.6.5 10.3 5 10.3 10.4 0 5.5-4.6 8-10 8H16Z" fill={D.lavender} opacity=".55" />
      </svg>
    );
  }

  // stars (default) — scattered hand-drawn-style sparkles
  return (
    <svg {...common} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M14 8l2.4 5.6L22 16l-5.6 2.4L14 24l-2.4-5.6L6 16l5.6-2.4L14 8Z" fill={D.mustard} />
      <path d="M48 14l1.6 3.8L53.4 19.4l-3.8 1.6L48 24.8l-1.6-3.8L42.6 19.4l3.8-1.6L48 14Z" fill={D.lavender} />
      <circle cx="34" cy="42" r="2.2" fill={D.navy} opacity=".7" />
      <circle cx="54" cy="46" r="1.5" fill={D.mustard} opacity=".8" />
    </svg>
  );
}
