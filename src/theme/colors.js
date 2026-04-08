"use client";

export const DARK = {
  bg: "#08090E",
  s1: "#111318",
  s2: "#181C24",
  border: "rgba(255,255,255,0.06)",
  borderMid: "rgba(255,255,255,0.1)",
  accent: "#5B8FE8",
  accentSub: "rgba(91,143,232,0.12)",
  accentGlow: "rgba(91,143,232,0.22)",
  textH: "#F0F4FF",
  textB: "#B8C6E0",
  textSub: "#4E6080",
  textDim: "#252E3E",
  green: "#2EAA60",
  greenSub: "rgba(46,170,96,0.12)",
  red: "#E04848",
  redSub: "rgba(224,72,72,0.12)",
  yellow: "#E8960C",
  nav: "rgba(8,9,14,0.98)",
  isDark: true,
};

export const LIGHT = {
  bg: "#F5F6FA",
  s1: "#FFFFFF",
  s2: "#EEF0F5",
  border: "rgba(0,0,0,0.08)",
  borderMid: "rgba(0,0,0,0.12)",
  accent: "#3A6FD8",
  accentSub: "rgba(58,111,216,0.1)",
  accentGlow: "rgba(58,111,216,0.18)",
  textH: "#1A1E2A",
  textB: "#3A4260",
  textSub: "#8090A8",
  textDim: "#C0C8D8",
  green: "#1E8A48",
  greenSub: "rgba(30,138,72,0.1)",
  red: "#D43030",
  redSub: "rgba(212,48,48,0.1)",
  yellow: "#C07800",
  nav: "rgba(245,246,250,0.98)",
  isDark: false,
};

// Theme state — persisted
let currentTheme = "dark";
if (typeof window !== "undefined") {
  try {
    currentTheme = localStorage.getItem("toono-theme") || "dark";
  } catch (e) {}
}

export let T = currentTheme === "light" ? { ...LIGHT } : { ...DARK };

export function setTheme(mode) {
  currentTheme = mode;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("toono-theme", mode);
    } catch (e) {}
  }
  const src = mode === "light" ? LIGHT : DARK;
  Object.assign(T, src);
  // Update body background
  if (typeof document !== "undefined") {
    document.body.style.background = T.bg;
    document.documentElement.style.background = T.bg;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", T.bg);
  }
}

// Apply saved theme on load
if (typeof document !== "undefined" && currentTheme === "light") {
  setTheme("light");
}
