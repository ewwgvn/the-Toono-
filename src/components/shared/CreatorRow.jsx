"use client";

import { T } from "@/theme/colors";
import Avt from "@/components/atoms/Avt";

const F = "'Helvetica Neue', Arial, sans-serif";

export default function CreatorRow({ creator: c, onClick, onFollow, showFollow, following }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer" }}>
      <Avt size={44} photo={c.photo} />
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
          <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: "#111111" }}>{c.name}</div>
          {c.comm && <span style={{ fontFamily: F, fontSize: 11, fontWeight: 500, color: "#666666", background: "#F7F7F7", padding: "2px 8px", borderRadius: 20 }}>Commissions open</span>}
        </div>
        <div style={{ fontFamily: F, fontSize: 12, color: "#666666" }}>
          {c.field} · {c.works} бүтээл
        </div>
      </div>
      {showFollow && (
        <button
          onClick={(e) => { e.stopPropagation(); onFollow && onFollow(c.id); }}
          style={{
            background: following ? "transparent" : "#111111",
            border: following ? "1px solid #E5E5E5" : "none",
            borderRadius: 20,
            padding: "7px 16px",
            fontFamily: F, fontSize: 12, fontWeight: 600,
            color: following ? "#666666" : "#FFFFFF",
            cursor: "pointer", flexShrink: 0,
          }}
        >
          {following ? "Дагаж байна" : "Дагах"}
        </button>
      )}
    </div>
  );
}
