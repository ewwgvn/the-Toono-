"use client";

import { useState, useEffect } from "react";
import { T } from "@/theme/colors";
import Toono from "@/components/atoms/Toono";
import { IcX } from "@/components/icons";

export default function PWAInstall() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 80,
        left: 16,
        right: 16,
        zIndex: 999,
        background: T.s1,
        border: `1px solid ${T.accentGlow}`,
        borderRadius: 16,
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: T.accentSub,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Toono size={28} color={T.accent} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "system-ui", fontSize: 14, fontWeight: 700, color: T.textH }}>The TOONO суулгах</div>
        <div style={{ fontFamily: "system-ui", fontSize: 12, color: T.textSub }}>Гэрийн дэлгэцэд нэмэх</div>
      </div>
      <button
        onClick={async () => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
          }
          setShow(false);
        }}
        style={{
          background: T.accent,
          border: "none",
          borderRadius: 10,
          padding: "10px 16px",
          fontFamily: "system-ui",
          fontSize: 13,
          fontWeight: 600,
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Суулгах
      </button>
      <button
        onClick={() => setShow(false)}
        style={{ background: "none", border: "none", color: T.textSub, cursor: "pointer", display: "flex" }}
      >
        <IcX />
      </button>
    </div>
  );
}
