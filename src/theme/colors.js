"use client";

export const DARK = {
  bg: "#FFFFFF",
  s1: "#FFFFFF",
  s2: "#F7F7F7",
  s3: "#EFEFEF",
  border: "#E5E5E5",
  borderMid: "#D0D0D0",
  borderLight: "#F0F0F0",
  accent: "#111111",
  accentHover: "#333333",
  accentSub: "#F7F7F7",
  accentGlow: "#E5E5E5",
  textH: "#111111",
  textB: "#333333",
  textSub: "#666666",
  textDim: "#999999",
  green: "#2E7D32",
  greenSub: "rgba(46,125,50,0.08)",
  red: "#D32F2F",
  redSub: "rgba(211,47,47,0.08)",
  yellow: "#F9A825",
  nav: "#FFFFFF",
  isDark: false,
};

export const LIGHT = { ...DARK };

// Theme state — mono clean has only one mode
let currentTheme = "dark";

export let T = { ...DARK };

export function setTheme(mode) {
  currentTheme = mode;
  if (typeof window !== "undefined") {
    try { localStorage.setItem("toono-theme", mode); } catch (e) {}
  }
  Object.assign(T, DARK);
  if (typeof document !== "undefined") {
    document.body.style.background = T.bg;
    document.documentElement.style.background = T.bg;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", T.bg);
  }
}
