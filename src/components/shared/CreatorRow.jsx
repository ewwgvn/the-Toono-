"use client";

import { T } from "@/theme/colors";
import Avt from "@/components/atoms/Avt";
import Pill from "@/components/atoms/Pill";

export default function CreatorRow({ creator: c, onClick, onFollow, showFollow, following }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 0",
        borderBottom: `1px solid ${T.border}`,
        cursor: "pointer",
      }}
    >
      <Avt size={50} color={c.accent} photo={c.photo} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
          <div style={{ fontFamily: "system-ui", fontSize: 15, fontWeight: 700, color: T.textH }}>{c.name}</div>
          {c.comm && <Pill color={T.green}>Захиалга авна</Pill>}
        </div>
        <div style={{ fontFamily: "system-ui", fontSize: 12, color: T.textSub }}>
          {c.field} &middot; {c.works}Бүтээл
        </div>
      </div>
      {showFollow && (
        <button
          onClick={(e) => { e.stopPropagation(); onFollow && onFollow(c.id); }}
          style={{
            background: following ? T.s2 : T.accentSub,
            border: `1px solid ${following ? T.border : T.accentGlow}`,
            borderRadius: 10,
            padding: "7px 14px",
            fontFamily: "system-ui",
            fontSize: 12,
            fontWeight: 700,
            color: following ? T.textSub : T.accent,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          {following ? "Дагаж байна" : "Дагах"}
        </button>
      )}
    </div>
  );
}
