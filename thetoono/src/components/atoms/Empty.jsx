"use client";

import { T } from "@/theme/colors";
import PBtn from "@/components/atoms/PBtn";

export default function Empty({ icon, title, sub, action, onAction }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 22,
          background: T.s1,
          border: `1px solid ${T.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: T.textSub,
          marginBottom: 4,
        }}
      >
        {icon}
      </div>
      <div style={{ fontFamily: "system-ui", fontSize: 17, fontWeight: 700, color: T.textH }}>
        {title}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "system-ui",
            fontSize: 13,
            color: T.textSub,
            lineHeight: 1.6,
            maxWidth: 240,
          }}
        >
          {sub}
        </div>
      )}
      {action && (
        <PBtn small onClick={onAction}>
          {action}
        </PBtn>
      )}
    </div>
  );
}
