"use client";

import { T } from "@/theme/colors";
import PBtn from "@/components/atoms/PBtn";

export default function Empty({ icon, title, sub, action, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ width: 64, height: 64, borderRadius: 32, background: "#F7F7F7", display: "flex", alignItems: "center", justifyContent: "center", color: "#999999", marginBottom: 4 }}>
        {icon}
      </div>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 16, fontWeight: 600, color: T.textH }}>
        {title}
      </div>
      {sub && (
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textSub, lineHeight: 1.6, maxWidth: 260 }}>
          {sub}
        </div>
      )}
      {action && <PBtn small onClick={onAction}>{action}</PBtn>}
    </div>
  );
}
