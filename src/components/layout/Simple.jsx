"use client";
import { T } from "@/theme/colors";
import { IcBack } from "@/components/icons";

export default function Simple({ children, nav, title, back = "home", right, goBack }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0, borderBottom: `1px solid ${T.borderLight}` }}>
        <button
          onClick={() => (goBack ? goBack() : nav(back))}
          style={{ width: 36, height: 36, borderRadius: 8, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111111", flexShrink: 0 }}
        >
          <IcBack />
        </button>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 16, fontWeight: 600, color: "#111111", letterSpacing: "0.02em" }}>
          {title}
        </div>
        {right && <div style={{ marginLeft: "auto" }}>{right}</div>}
      </div>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "0 16px" }}>
        {children}
        <div style={{ height: 30 }} />
      </div>
    </div>
  );
}
