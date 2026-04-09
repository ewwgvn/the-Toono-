"use client";
import { useState, useEffect } from "react";

export default function NetworkStatus() {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (online) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, background: "#D32F2F", padding: "10px 20px", textAlign: "center", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 500, color: "#FFFFFF" }}>
      Интернет холболтгүй байна
    </div>
  );
}
