"use client";

import { T } from "@/theme/colors";
import PBtn from "@/components/atoms/PBtn";
import StoryDecor from "@/components/atoms/StoryDecor";

export default function Empty({ icon, title, sub, action, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: "56px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10, animation: "fadeUp .35s ease", position: "relative" }}>
      <StoryDecor variant="cloud" size={56} style={{ position: "absolute", top: 8, right: 16, opacity: .7 }} />
      <StoryDecor variant="stars" size={40} style={{ position: "absolute", top: 18, left: 12, opacity: .6 }} />
      {icon && (
        <div style={{ width: 72, height: 72, borderRadius: 24, background: T.s2, display: "flex", alignItems: "center", justifyContent: "center", color: T.textDim, marginBottom: 6 }}>
          {icon}
        </div>
      )}
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 16, fontWeight: 700, color: T.textH }}>
        {title}
      </div>
      {sub && (
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textSub, lineHeight: 1.6, maxWidth: 280 }}>
          {sub}
        </div>
      )}
      {action && <div style={{ marginTop: 6 }}><PBtn small onClick={onAction}>{action}</PBtn></div>}
    </div>
  );
}
