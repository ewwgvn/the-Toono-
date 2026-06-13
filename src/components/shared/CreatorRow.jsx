"use client";

import { T } from "@/theme/colors";
import { a11yClick } from "@/lib/utils";
import Avt from "@/components/atoms/Avt";

const F = "'Helvetica Neue', Arial, sans-serif";

export default function CreatorRow({ creator: c, onClick, onFollow, showFollow, following }) {
  return (
    <div {...a11yClick(onClick)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer" }}>
      <Avt size={44} photo={c.photo} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: T.textH }}>{c.name}</div>
          {c.comm && <span style={{ fontFamily: F, fontSize: 11, fontWeight: 500, color: T.textSub, background: T.s2, padding: "2px 8px", borderRadius: 20 }}>Захиалга авна</span>}
        </div>
        <div style={{ fontFamily: F, fontSize: 12, color: T.textSub }}>
          {c.field} · {c.works} бүтээл
        </div>
      </div>
      {showFollow && (
        <button
          onClick={(e) => { e.stopPropagation(); onFollow && onFollow(c.id); }}
          style={{
            background: following ? "transparent" : T.textH,
            border: following ? `1px solid ${T.border}` : "none",
            borderRadius: 20,
            padding: "7px 16px",
            fontFamily: F, fontSize: 12, fontWeight: 600,
            color: following ? T.textSub : "#FFFFFF",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          {following ? "Дагаж байна" : "Дагах"}
        </button>
      )}
    </div>
  );
}
