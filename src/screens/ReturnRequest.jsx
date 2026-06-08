"use client";
import { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { isSupabaseReady, supabase } from "@/lib/supabase";
import { IcBack } from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import { toast } from "@/components/layout/Toast";

export default function ReturnRequest({ nav, goBack }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const reasons = ["Чанарын асуудал", "Тайлбартай таарахгүй", "Хүргэлт удсан", "Буруу бараа ирсэн", "Бусад"];

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    <div style={{ padding: "20px 20px 14px", display: "flex", alignItems: "center", gap: 10 }}>
      <button type="button" onClick={() => goBack ? goBack() : nav("home")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 20, fontWeight: 800, color: T.textH }}>Буцаалт хүсэх</div>
    </div>
    <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textSub, marginBottom: 16 }}>Буцаалтын шалтгааныг сонгоно уу</div>
      {reasons.map(r => <button type="button" key={r} onClick={() => setReason(r)} style={{ width: "100%", textAlign: "left", background: reason === r ? T.accentSub : T.s1, border: `1.5px solid ${reason === r ? T.accent : T.border}`, borderRadius: 12, padding: "14px 16px", marginBottom: 8, fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: reason === r ? T.accent : T.textH, cursor: "pointer" }}>{r}</button>)}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textSub, marginBottom: 8 }}>Нэмэлт тайлбар</div>
        <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Дэлгэрэнгүй тайлбар..." style={{ width: "100%", minHeight: 120, background: T.s1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textH, outline: "none", resize: "none", lineHeight: 1.7, boxSizing: "border-box" }} />
      </div>
      <div style={{ marginTop: 20, paddingBottom: 40 }}>
        <PBtn full disabled={!reason} loading={loading} onClick={async () => {
          setLoading(true);
          try {
            const order = GS.orders.find(o => o.id === GS.selectedOrderId);
            if (order) {
              order.returnRequested = true;
              order.returnReason = reason;
              order.returnDetails = details;
              order.status = "return_requested";
            }
            GS.notifications.unshift({ id: Date.now(), icon: "return", title: "Буцаалтын хүсэлт", desc: reason, time: "Сая", read: true, to: "order-detail" });
            saveGS();
            // Save to Supabase
            if (isSupabaseReady() && GS.user.id) {
              await supabase.from("return_requests").insert({
                order_id: GS.selectedOrderId,
                buyer_id: GS.user.id,
                seller_id: order?.seller_id || null,
                reason,
                details: details.trim() || null,
                status: "pending",
                created_at: new Date().toISOString(),
              }).catch(() => {});
              // Update order status in Supabase
              if (order?.id) {
                await supabase.from("orders").update({ status: "return_requested", return_reason: reason }).eq("id", order.id).catch(() => {});
              }
            }
            toast("Буцаалтын хүсэлт илгээгдлээ", "success");
            goBack ? goBack() : nav("home");
          } catch (e) {
            toast("Алдаа гарлаа", "error");
          } finally {
            setLoading(false);
          }
        }}>Хүсэлт илгээх</PBtn>
      </div>
    </div>
  </div>;
}
