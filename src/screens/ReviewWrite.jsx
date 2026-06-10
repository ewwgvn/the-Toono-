"use client";
import { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady, supabase } from "@/lib/supabase";
import { IcBack, IcStar } from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import { toast } from "@/components/layout/Toast";

export default function ReviewWrite({ nav, goBack }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (rating === 0) { toast("Одоор үнэлнэ үү", "error"); return; }
    if (!GS.user.id) { toast("Нэвтэрч орно уу", "error"); return; }
    setLoading(true);
    try {
      // Get the order/commission to review
      const order = GS.orders.find(o => o.id === GS.selectedOrderId);
      const sellerId = order?.seller_id || order?.creatorId || null;

      if (isSupabaseReady() && sellerId) {
        await supabase.from("reviews").insert({
          reviewer_id: GS.user.id,
          seller_id: sellerId,
          order_id: order?.id || null,
          rating,
          text: text.trim() || null,
        }).then(({ error }) => {
          if (error && process.env.NODE_ENV === "development") console.error("[ReviewWrite]", error.code);
        });
        // Bump seller's average rating
        supabase.rpc("update_seller_rating", { seller_id: sellerId }).catch(() => {});
      }

      GS.notifications.unshift({
        id: Date.now(), icon: "review", title: "Сэтгэгдэл бичигдлээ",
        desc: `${rating} одоор үнэллээ`, time: "Сая", read: true, to: "me",
      });
      saveGS();
      toast("Сэтгэгдэл амжилттай илгээгдлээ", "success");
      goBack ? goBack() : nav("home");
    } catch (e) { if (process.env.NODE_ENV === "development") console.error(e); toast("Алдаа гарлаа", "error"); }
    finally { setLoading(false); }
  };

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    <div style={{ padding: "20px 20px 14px", display: "flex", alignItems: "center", gap: 10 }}>
      <button type="button" onClick={() => goBack ? goBack() : nav("home")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 20, fontWeight: 800, color: T.textH }}>Сэтгэгдэл бичих</div>
    </div>
    <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textSub, marginBottom: 16 }}>Та энэ бүтээлч/захиалгад хэр сэтгэл хангалуун байна вэ?</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
        {[1, 2, 3, 4, 5].map(n => <button type="button" key={n} onClick={() => setRating(n)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 32, color: n <= rating ? T.yellow : T.textDim }}><IcStar n={n <= rating ? 1 : 0} /></button>)}
      </div>
      <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Сэтгэгдэлээ бичнэ үү..." style={{ width: "100%", minHeight: 150, background: T.s1, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textH, outline: "none", resize: "none", lineHeight: 1.7, boxSizing: "border-box" }} />
      <div style={{ marginTop: 20 }}>
        <PBtn full loading={loading} onClick={submit}>Илгээх</PBtn>
      </div>
    </div>
  </div>;
}
