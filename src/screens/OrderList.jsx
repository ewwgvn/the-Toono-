"use client";
import { useState } from "react";
import { T } from "@/theme/colors";
import { GS } from "@/lib/store";
import { IcOrder } from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Crd from "@/components/atoms/Crd";
import Empty from "@/components/atoms/Empty";
import Simple from "@/components/layout/Simple";

export default function OrderList({ nav, refresh, goBack }) {
  const [filter, setFilter] = useState("all");
  const statusMap = { "pending": "Хүлээгдэж байна", "making": "Хийж байна", "shipped": "Хүргэгдэж байна", "delivered": "Хүргэгдсэн", "done": "Дууссан" };
  const statusColor = { "pending": T.yellow, "making": T.accent, "shipped": T.accent, "delivered": T.green, "done": T.textSub };
  const orders = filter === "all" ? GS.orders : GS.orders.filter(o => o.status === filter);

  return (
    <Simple nav={nav} title="Захиалгын жагсаалт" back="me" goBack={goBack}>
      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", marginBottom: 16 }}>
        {[["all", "Бүгд"], ["pending", "Хүлээгдэж"], ["making", "Хийж байна"], ["shipped", "Хүргэгдэж"], ["delivered", "Ирсэн"]].map(([k, l]) =>
          <button key={k} onClick={() => setFilter(k)} style={{ flexShrink: 0, padding: "7px 14px", borderRadius: 20, fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: filter === k ? 700 : 500, background: filter === k ? T.accentSub : T.s1, border: `1px solid ${filter === k ? T.accent + "60" : T.border}`, color: filter === k ? T.accent : T.textSub, cursor: "pointer" }}>{l}{k === "all" ? " (" + GS.orders.length + ")" : ""}</button>
        )}
      </div>

      {orders.length === 0
        ? <Empty icon={<IcOrder />} title="Захиалга байхгүй" sub="Бүтээл худалдаж авбал энд харагдана" action="Бүтээл хайх" onAction={() => nav("explore")} />
        : orders.map(o => (
          <Crd key={o.id} onClick={() => { GS.selectedOrderId = o.id; nav("order-detail"); }} style={{ padding: "16px", marginBottom: 10, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 3 }}>{o.title}</div>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>{o.creator} · {o.date}</div>
              </div>
              <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, fontWeight: 700, color: statusColor[o.status] || T.textSub, background: (statusColor[o.status] || T.textSub) + "18", padding: "4px 10px", borderRadius: 8, flexShrink: 0 }}>{statusMap[o.status] || o.status}</span>
            </div>
            {/* Items preview */}
            {o.items && o.items.length > 1 && (
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub, marginBottom: 8 }}>
                {o.items.map(it => it.title).join(" · ")}
              </div>
            )}
            {/* Progress bar */}
            <div style={{ display: "flex", gap: 3, marginBottom: 10 }}>
              {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= { "pending": 0, "making": 1, "shipped": 2, "delivered": 3, "done": 4 }[o.status] ? T.accent : T.border }} />)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 16, fontWeight: 800, color: T.accent }}>₮{(o.price || 0).toLocaleString()}</div>
              <div style={{ display: "flex", gap: 6 }}>
                {o.tracking && <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: T.green, background: T.greenSub, padding: "3px 8px", borderRadius: 6 }}>Хүргэлтийн дугаар</span>}
                <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.accent }}>Дэлгэрэнгүй →</span>
              </div>
            </div>
          </Crd>
        ))}
    </Simple>
  );
}
