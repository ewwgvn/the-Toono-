"use client";
import { useState, useEffect } from "react";
import { T } from "@/theme/colors";

// ── TOAST ──
let toastFn = null;

export function toast(msg, type = "info") {
  toastFn && toastFn({ msg, type, id: Date.now() });
}

export default function Toast() {
  const [t, setT] = useState(null);
  useEffect(() => {
    toastFn = (item) => {
      setT(item);
      setTimeout(() => setT(null), 2500);
    };
    return () => {
      toastFn = null;
    };
  }, []);
  if (!t) return null;
  const cols = { info: T.accent, success: T.green, error: T.red, warning: T.yellow };
  return (
    <div
      style={{
        position: "absolute",
        bottom: 96,
        left: 16,
        right: 16,
        zIndex: 999,
        background: "rgba(16,20,30,0.95)",
        backdropFilter: "blur(12px)",
        border: `1px solid ${cols[t.type]}30`,
        borderRadius: 16,
        padding: "13px 18px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5),0 0 0 1px ${cols[t.type]}20`,
      }}
    >
      <div
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: cols[t.type],
          flexShrink: 0,
          boxShadow: `0 0 8px ${cols[t.type]}`,
        }}
      />
      <span
        style={{
          fontFamily: "system-ui",
          fontSize: 13,
          fontWeight: 500,
          color: T.textH,
          letterSpacing: "-.01em",
        }}
      >
        {t.msg}
      </span>
    </div>
  );
}
