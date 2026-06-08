"use client";

// ── Uliger color system — storybook, warm, soft ──────────────────────────────
// Uliger = 이야기/설화 → 동화책 삽화 같은 따뜻하고 포근한 분위기
// (밤하늘 네이비 · 테라코타 오렌지 · 머스타드 옐로 · 라벤더가 어우러진 무드)
export const ULIGER = {
  bg:          "#FFF9F1",   // 따뜻한 크림 화이트
  s1:          "#FFF9F1",
  s2:          "#FBF1E4",   // 연한 오트밀 크림
  s3:          "#F1E4D2",   // 따뜻한 베이지
  border:      "#E9DCC7",   // 카라멜 베이지 경계선
  borderMid:   "#D2C0A4",
  borderLight: "#F4EAD9",   // 아주 연한 크림 경계
  accent:      "#33406B",   // 동화 일러스트의 깊은 밤하늘 네이비 — 메인 액센트
  accentHover: "#262E50",
  accentSub:   "#E7E9F2",   // 연한 네이비-라벤더 배경
  accentGlow:  "#C4CADC",   // 네이비 글로우
  textH:       "#2A2218",   // 따뜻한 잉크 브라운 (거의 검정)
  textB:       "#4A3D2E",   // 따뜻한 브라운
  textSub:     "#8C7C68",   // 따뜻한 모카 그레이
  textDim:     "#B6A98F",   // 연한 모카
  green:       "#5A8F5E",   // 부드러운 세이지 그린 (성공)
  greenSub:    "rgba(90,143,94,0.10)",
  red:         "#C9573F",
  redSub:      "rgba(201,87,63,0.09)",
  yellow:      "#E0A22C",   // 머스타드 허니 옐로
  nav:         "#FFF9F1",
  isDark:      false,
};

// 동화책 키치/큐티 무드의 타이포 — 제목엔 둥글둥글한 디스플레이체, 강조엔 손글씨체
export const ULIGER_FONT_DISPLAY = "'Comfortaa', 'Helvetica Neue', Arial, sans-serif";
export const ULIGER_FONT_ACCENT  = "'Caveat', 'Helvetica Neue', Arial, sans-serif";

// 동화책 삽화 무드의 보조 팔레트 — 장식용 일러스트 요소(별, 달, 구름 등) 전용
// T 토큰 형태에는 없는 색조(네이비/머스타드/라벤더)를 uliger 테마 장식에 사용
export const ULIGER_DECOR = {
  navy:     "#33406B",   // 밤하늘 네이비
  navySub:  "rgba(51,64,107,0.12)",
  mustard:  "#EAAE3E",   // 머스타드 옐로 (별빛)
  lavender: "#A6A6D6",   // 라벤더
  star:     "#FFF6E8",   // 별빛 크림
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
