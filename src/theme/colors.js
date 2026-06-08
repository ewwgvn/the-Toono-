"use client";

// ── Uliger color system — night-sky storybook, cool palette ─────────────────
// Uliger = 이야기/설화 → 동화책 밤하늘의 그래픽한 무드
// 오직 네이비 · 골드 · 하늘색 · 블랙 · 화이트만 사용 (크림/베이지/오렌지/레드 톤 배제)
export const ULIGER = {
  bg:          "#FFFFFF",
  s1:          "#FFFFFF",
  s2:          "#F2F4F8",
  s3:          "#E4E9F0",
  border:      "#DBE2EC",
  borderMid:   "#C2CBDA",
  borderLight: "#EEF1F6",
  accent:      "#2B3A63",   // 밤하늘 네이비 — 메인 액센트
  accentHover: "#1F2C4D",
  accentSub:   "#E6EAF4",
  accentGlow:  "#C7D2E6",
  textH:       "#15171C",   // 거의 블랙
  textB:       "#383D47",
  textSub:     "#777E8C",
  textDim:     "#A8AFBC",
  green:       "#5A8F5E",
  greenSub:    "rgba(90,143,94,0.10)",
  red:         "#C9573F",   // 오류 등 시맨틱 전용 (무드 팔레트에는 사용하지 않음)
  redSub:      "rgba(201,87,63,0.09)",
  yellow:      "#C9A227",   // 골드
  nav:         "#FFFFFF",
  isDark:      false,
};

// 동화책 밤하늘 무드의 타이포 — 제목엔 둥글둥글한 디스플레이체, 강조엔 손글씨체
export const ULIGER_FONT_DISPLAY = "'Comfortaa', 'Helvetica Neue', Arial, sans-serif";
export const ULIGER_FONT_ACCENT  = "'Caveat', 'Helvetica Neue', Arial, sans-serif";

// 동화책 밤하늘 무드의 보조 팔레트 — 장식용 일러스트 요소(별·달·구름·꽃 등) 전용
// 네이비 · 골드 · 하늘색 · 잉크 블랙 · 화이트 다섯 가지로만 구성 (크리미한 톤 배제)
export const ULIGER_DECOR = {
  ink:    "#15171C",   // 잉크 블랙
  inkSub: "rgba(21,23,28,0.10)",
  navy:   "#2B3A63",   // 밤하늘 네이비
  gold:   "#C9A227",   // 별빛 골드
  sky:    "#8FB7DC",   // 하늘색
  paper:  "#FFFFFF",   // 화이트
};

// ── Mono (무채색) theme ───────────────────────────────────────────────────────
export const MONO = {
  bg:          "#FFFFFF",
  s1:          "#FFFFFF",
  s2:          "#F7F7F7",
  s3:          "#EFEFEF",
  border:      "#E5E5E5",
  borderMid:   "#D0D0D0",
  borderLight: "#F0F0F0",
  accent:      "#111111",
  accentHover: "#333333",
  accentSub:   "#F7F7F7",
  accentGlow:  "#E5E5E5",
  textH:       "#111111",
  textB:       "#333333",
  textSub:     "#666666",
  textDim:     "#767676",
  green:       "#2E7D32",
  greenSub:    "rgba(46,125,50,0.08)",
  red:         "#D32F2F",
  redSub:      "rgba(211,47,47,0.08)",
  yellow:      "#F9A825",
  nav:         "#FFFFFF",
  isDark:      false,
};

// ── Active theme ────────────────────────────────────────────────────────────
// "uliger" = 동화책 무드 팔레트 | "mono" = 흑백 모노 팔레트
const PALETTES = { uliger: ULIGER, mono: MONO };

// 예전 모드명("cute"/"classic")으로 저장된 값과의 하위호환
const LEGACY_MODE = { cute: "uliger", classic: "mono" };

function normalizeMode(mode) {
  return PALETTES[mode] ? mode : (LEGACY_MODE[mode] || "uliger");
}

// loadTheme()이 useEffect에서 비동기로 실행되기 전, 첫 렌더부터 저장된 테마를
// 동기적으로 반영해 "uliger로 그렸다가 mono로 다시 그리는" 깜빡임을 방지
function readSavedTheme() {
  if (typeof window === "undefined") return "uliger";
  try { return normalizeMode(localStorage.getItem("uliger-theme")); } catch (e) { return "uliger"; }
}

let currentTheme = readSavedTheme();

export let T = { ...PALETTES[currentTheme] };

export function setTheme(mode) {
  currentTheme = normalizeMode(mode);
  if (typeof window !== "undefined") {
    try { localStorage.setItem("uliger-theme", currentTheme); } catch (e) {}
  }
  Object.assign(T, PALETTES[currentTheme]);
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", currentTheme);
    document.body.style.background = T.bg;
    document.documentElement.style.background = T.bg;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", T.bg);
  }
}

export function loadTheme() {
  try {
    const saved = localStorage.getItem("uliger-theme");
    setTheme(normalizeMode(saved));
  } catch (e) {
    setTheme("uliger");
  }
}

export function getTheme() {
  return currentTheme;
}
