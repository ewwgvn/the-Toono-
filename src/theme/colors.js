"use client";

// ── Uliger color system — folk-art storybook, ink + paper + red ─────────────
// Uliger = 이야기/설화 → 몽골·슬라브 민속 자수책 같은 그래픽한 무드
// (잉크 블랙 · 페이퍼 화이트 · 강렬한 레드의 대비 — 크림/오렌지 톤은 배제)
export const ULIGER = {
  bg:          "#F6F3EE",   // 차분한 페이퍼 화이트 (크림기 제거)
  s1:          "#F6F3EE",
  s2:          "#EFEAE2",
  s3:          "#E2D9CB",
  border:      "#D8CEBE",
  borderMid:   "#C2B6A2",
  borderLight: "#EFEAE2",
  accent:      "#D6362A",   // 민속 자수책의 강렬한 레드 — 메인 액센트
  accentHover: "#B8281D",
  accentSub:   "#F6DEDA",
  accentGlow:  "#EABFB9",
  textH:       "#1C1916",   // 잉크 블랙
  textB:       "#3B342C",
  textSub:     "#897C6D",
  textDim:     "#B7AB99",
  green:       "#5A8F5E",
  greenSub:    "rgba(90,143,94,0.10)",
  red:         "#D6362A",
  redSub:      "rgba(214,54,42,0.09)",
  yellow:      "#BFA046",   // 오렌지기를 뺀 차분한 골드
  nav:         "#F6F3EE",
  isDark:      false,
};

// 민속 자수책 무드의 타이포 — 제목엔 둥글둥글한 디스플레이체, 강조엔 손글씨체
export const ULIGER_FONT_DISPLAY = "'Comfortaa', 'Helvetica Neue', Arial, sans-serif";
export const ULIGER_FONT_ACCENT  = "'Caveat', 'Helvetica Neue', Arial, sans-serif";

// 민속 자수책 무드의 보조 팔레트 — 장식용 일러스트 요소(별, 달, 구름, 꽃 등) 전용
// T 토큰에는 없는 색조(잉크/레드/스톤/페이퍼)를 uliger 테마 장식에 사용
export const ULIGER_DECOR = {
  ink:      "#23201B",   // 잉크 블랙
  inkSub:   "rgba(35,32,27,0.10)",
  red:      "#D6362A",   // 강렬한 레드 (자수 모티프)
  stone:    "#C7BCAC",   // 따뜻한 스톤 그레이
  paper:    "#F6F3EE",   // 페이퍼 화이트
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
