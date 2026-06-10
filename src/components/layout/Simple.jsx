"use client";
import { T } from "@/theme/colors";
import { IcBack } from "@/components/icons";

export default function Simple({ children, nav, title, back = "home", right, goBack }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "max(16px, env(safe-area-inset-top, 16px)) 16px 12px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0, borderBottom: `1px solid ${T.borderLight}` }}>
        <button
          type="button"
          aria-label="Буцах"
          className="toono-pressable"
          onClick={() => (goBack ? goBack() : nav(back))}
          style={{ width: 36, height: 36, borderRadius: 10, background: "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textH, flexShrink: 0 }}
          onMouseEnter={(e) => { e.currentTarget.style.background = T.s2; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <IcBack />
        </button>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 17, fontWeight: 700, color: T.textH }}>
          {title}
        </div>
        {right && <div style={{ marginLeft: "auto" }}>{right}</div>}
      </div>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "0 16px" }}>
        <div className="toono-readable">
          {children}
          <div style={{ height: 30 }} />
        </div>
      </div>
    </div>
  );
}
