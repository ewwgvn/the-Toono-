"use client";
import { T } from "@/theme/colors";
import { IcX } from "@/components/icons";

// ── BOTTOM SHEET ──
export default function BottomSheet({ open, onClose, title, children, height = "60%" }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "relative",
          background: T.s1,
          borderRadius: "20px 20px 0 0",
          maxHeight: height,
          display: "flex",
          flexDirection: "column",
          animation: "slideUp .25s ease",
        }}
      >
        <div style={{ padding: "12px 0 0", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} />
        </div>
        <div
          style={{
            padding: "12px 20px 8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontFamily: "system-ui", fontSize: 17, fontWeight: 700, color: T.textH }}>
            {title}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: T.textSub,
              cursor: "pointer",
              display: "flex",
            }}
          >
            <IcX />
          </button>
        </div>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            scrollbarWidth: "none",
            padding: "0 20px 32px",
          }}
        >
          {children}
        </div>
      </div>
      <style>
        {"@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}"}
      </style>
    </div>
  );
}
