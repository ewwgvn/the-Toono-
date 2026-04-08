"use client";
import { T } from "@/theme/colors";
import { IcBack } from "@/components/icons";

// ── SIMPLE WRAPPER ──
export default function Simple({ children, nav, title, back = "home", right, goBack }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div
        style={{
          padding: "16px 20px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => (goBack ? goBack() : nav(back))}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: T.s1,
            border: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: T.textH,
            flexShrink: 0,
          }}
        >
          <IcBack />
        </button>
        <div style={{ fontFamily: "system-ui", fontSize: 20, fontWeight: 800, color: T.textH }}>
          {title}
        </div>
        {right && <div style={{ marginLeft: "auto" }}>{right}</div>}
      </div>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "0 20px" }}>
        {children}
        <div style={{ height: 30 }} />
      </div>
    </div>
  );
}
