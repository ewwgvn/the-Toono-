"use client";
import { useState, useEffect } from "react";
import { T } from "@/theme/colors";

let toastFn = null;

export function toast(msg, type = "info") {
  toastFn && toastFn({ msg, type, id: Date.now() });
}

export default function Toast() {
  const [t, setT] = useState(null);
  useEffect(() => {
    toastFn = (item) => { setT(item); setTimeout(() => setT(null), 2500); };
    return () => { toastFn = null; };
  }, []);
  if (!t) return null;
  const cols = { info: "#111111", success: T.green, error: T.red, warning: T.yellow };
  return (
    <div style={{
      position: "absolute", bottom: 96, left: 16, right: 16, zIndex: 999,
      background: "#111111", borderRadius: 8, padding: "14px 18px",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.type === "info" ? "#FFFFFF" : cols[t.type], flexShrink: 0 }} />
      <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 500, color: "#FFFFFF" }}>
        {t.msg}
      </span>
    </div>
  );
}
