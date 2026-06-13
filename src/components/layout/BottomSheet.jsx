"use client";
import { useEffect } from "react";
import { T } from "@/theme/colors";
import { IcX } from "@/components/icons";

export default function BottomSheet({ open, onClose, title, children, height = "60%" }) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", handleKey);
    // Prevent body scroll when open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(11,30,58,0.4)", animation: "fadeIn .2s ease" }} />
      <div role="dialog" aria-modal="true" aria-label={title} style={{ position: "relative", background: T.bg, borderRadius: "20px 20px 0 0", maxHeight: height, minHeight: 160, display: "flex", flexDirection: "column", animation: "slideUp .25s ease", boxShadow: "0 -8px 40px rgba(11,30,58,0.18)" }}>
        <div style={{ padding: "10px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} />
        </div>
        <div style={{ padding: "10px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.borderLight}` }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 16, fontWeight: 700, color: T.textH }}>{title}</div>
          <button type="button" aria-label="Хаах" className="toono-pressable" onClick={onClose} style={{ width: 44, height: 44, borderRadius: 22, background: T.s2, border: "none", color: T.textH, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <IcX />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "16px 20px calc(20px + env(safe-area-inset-bottom, 0px))" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
