"use client";
import { useState, useEffect } from "react";
import { T } from "@/theme/colors";
import Toono from "@/components/atoms/Toono";
import { IcX } from "@/components/icons";

export default function PWAInstall() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); setShow(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show) return null;

  return (
    <div style={{ position: "fixed", bottom: 80, left: 16, right: 16, zIndex: 999, background: "#FFFFFF", border: `1px solid ${T.border}`, borderRadius: 8, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: T.s2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Toono size={24} color={T.textH} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 600, color: T.textH }}>Uliger суулгах</div>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>Гэрийн дэлгэцэд нэмэх</div>
      </div>
      <button
        onClick={async () => { if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; } setShow(false); }}
        style={{ background: T.accent, border: "none", borderRadius: 20, padding: "8px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: "#FFFFFF", cursor: "pointer" }}
      >
        Суулгах
      </button>
      <button type="button" onClick={() => setShow(false)} style={{ background: "none", border: "none", color: T.textSub, cursor: "pointer", display: "flex" }}>
        <IcX />
      </button>
    </div>
  );
}
