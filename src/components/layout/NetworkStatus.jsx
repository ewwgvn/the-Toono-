"use client";
import { useState, useEffect } from "react";
import { T } from "@/theme/colors";

// ── NETWORK STATUS ──
export default function NetworkStatus() {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  if (online) return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: T.red,
        padding: "10px 20px",
        textAlign: "center",
        fontFamily: "system-ui",
        fontSize: 13,
        fontWeight: 600,
        color: "#fff",
      }}
    >
      Интернет холболтгүй байна · Офлайн горим
    </div>
  );
}
