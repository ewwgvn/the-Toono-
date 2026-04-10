"use client";
import { T } from "@/theme/colors";
import { IcX } from "@/components/icons";

export default function BottomSheet({ open, onClose, title, children, height = "60%" }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
      <div style={{ position: "relative", background: "#FFFFFF", borderRadius: "16px 16px 0 0", maxHeight: height, display: "flex", flexDirection: "column", animation: "slideUp .2s ease" }}>
        <div style={{ padding: "12px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 32, height: 4, borderRadius: 2, background: "#E5E5E5" }} />
        </div>
        <div style={{ padding: "12px 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 16, fontWeight: 600, color: "#111111" }}>{title}</div>
          <button type="button" aria-label="Close" onClick={onClose} style={{ background: "none", border: "none", color: "#999999", cursor: "pointer", display: "flex" }}>
            <IcX />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "0 20px 32px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
