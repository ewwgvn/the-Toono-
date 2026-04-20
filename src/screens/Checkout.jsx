"use client";

import { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { SQ, isSupabaseReady, supabase } from "@/lib/supabase";
import { getAllWorks } from "@/lib/utils";
import { IcBack, IcMoney, IcB2B, IcShield, IcCheck, IcLock } from "@/components/icons";
import Crd from "@/components/atoms/Crd";
import PBtn from "@/components/atoms/PBtn";
import Toono from "@/components/atoms/Toono";

const F = "'Helvetica Neue', Arial, sans-serif";

export default function Checkout({ nav, workId, refresh, goBack }) {
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [addr, setAddr] = useState({ name: GS.user.name || "", phone: "", city: "Улаанбаатар", district: "", detail: "", memo: "" });

  const directItem = GS.directBuyItem;
  const items = directItem ? [directItem] : GS.cart.length > 0 ? GS.cart : [];
  const subtotal = items.reduce((s, it) => s + ((it.price || 0) * (it.qty || 1)), 0);
  const shipping = items.some(i => !i.digital) ? 15000 : 0;
  const total = subtotal + shipping;
  const w = items[0] || getAllWorks().find(x => x.id === workId) || { id: 0, title: "—", creator: "—", price: 0 };
  const methods = [
    ["card", <IcMoney key="card" />, "Карт", "Visa, Mastercard"],
    ["bank", <IcB2B key="bank" />, "Дансаар", "Банк шилжүүлэг"],
    ["qpay", <IcShield key="qpay" />, "QPay", "QR төлбөр"],
  ];
  const stepL = ["Хүргэлтийн мэдээлэл", "Төлбөрийн хэлбэр", "Баталгаажуулах"];

  const validateStep0 = () => {
    const e = {};
    if (!addr.name.trim()) e.name = "Нэр оруулна уу";
    if (!addr.phone.trim() || addr.phone.trim().length < 8) e.phone = "Утасны дугаар оруулна уу";
    if (!addr.district.trim()) e.district = "Дүүрэг/Сум оруулна уу";
    if (!addr.detail.trim()) e.detail = "Дэлгэрэнгүй хаяг оруулна уу";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const inputStyle = (field) => ({
    width: "100%", background: "#FFFFFF",
    border: `1px solid ${errors[field] ? "#D32F2F" : "#E5E5E5"}`,
    borderRadius: 8, padding: "12px 14px",
    fontFamily: F, fontSize: 14, color: "#111111",
    outline: "none", boxSizing: "border-box",
  });

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FFFFFF" }}>
    {/* Header */}
    <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #F0F0F0" }}>
      <button type="button" onClick={() => step === 0 ? (goBack ? goBack() : nav("home")) : setStep(step - 1)} style={{ background: "none", border: "none", color: "#111111", cursor: "pointer", display: "flex" }}><IcBack /></button>
      <div style={{ fontFamily: F, fontSize: 16, fontWeight: 600, color: "#111111" }}>Checkout</div>
      <div style={{ marginLeft: "auto", fontFamily: F, fontSize: 12, color: "#999999" }}>{step + 1}/{stepL.length}</div>
    </div>

    {/* Step indicator */}
    <div style={{ padding: "12px 16px 0" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {stepL.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? "#111111" : "#E5E5E5", transition: "all .3s" }} />)}
      </div>
      <div style={{ fontFamily: F, fontSize: 12, color: "#999999", marginBottom: 12 }}>{stepL[step]}</div>
    </div>

    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "0 16px" }}>

      {/* Order items summary */}
      {items.map((it, idx) => <div key={it.id || idx} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F0F0F0" }}>
        <div style={{ width: 44, height: 44, borderRadius: 8, background: "#F7F7F7", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
          {it.images?.[0] ? <img src={it.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Toono size={20} color="#999999" />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</div>
          <div style={{ fontFamily: F, fontSize: 11, color: "#999999" }}>{it.creator || ""}{it.size ? " · " + it.size : ""}</div>
        </div>
        <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: "#111111", flexShrink: 0 }}>₮{(it.price || 0).toLocaleString()}</div>
      </div>)}

      <div style={{ height: 16 }} />

      {/* Step 0: Address & Contact */}
      {step === 0 && <>
        <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: "#111111", marginBottom: 12 }}>Хүргэлтийн мэдээлэл</div>
        <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: F, fontSize: 12, fontWeight: 500, color: "#666666", marginBottom: 4 }}>Нэр *</div>
            <input value={addr.name} onChange={e => { setAddr({ ...addr, name: e.target.value }); setErrors(p => ({ ...p, name: "" })); }} placeholder="Нэр" style={inputStyle("name")} />
            {errors.name && <div style={{ fontFamily: F, fontSize: 11, color: "#D32F2F", marginTop: 3 }}>{errors.name}</div>}
          </div>
          <div>
            <div style={{ fontFamily: F, fontSize: 12, fontWeight: 500, color: "#666666", marginBottom: 4 }}>Утасны дугаар *</div>
            <input value={addr.phone} onChange={e => { setAddr({ ...addr, phone: e.target.value }); setErrors(p => ({ ...p, phone: "" })); }} placeholder="99001122" type="tel" style={inputStyle("phone")} />
            {errors.phone && <div style={{ fontFamily: F, fontSize: 11, color: "#D32F2F", marginTop: 3 }}>{errors.phone}</div>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F, fontSize: 12, fontWeight: 500, color: "#666666", marginBottom: 4 }}>Хот *</div>
              <select value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} style={{ ...inputStyle("city"), cursor: "pointer", appearance: "none" }}>
                {["Улаанбаатар", "Дархан", "Эрдэнэт", "Бусад"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F, fontSize: 12, fontWeight: 500, color: "#666666", marginBottom: 4 }}>Дүүрэг *</div>
              <input value={addr.district} onChange={e => { setAddr({ ...addr, district: e.target.value }); setErrors(p => ({ ...p, district: "" })); }} placeholder="Баянгол" style={inputStyle("district")} />
              {errors.district && <div style={{ fontFamily: F, fontSize: 11, color: "#D32F2F", marginTop: 3 }}>{errors.district}</div>}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: F, fontSize: 12, fontWeight: 500, color: "#666666", marginBottom: 4 }}>Дэлгэрэнгүй хаяг *</div>
            <textarea value={addr.detail} onChange={e => { setAddr({ ...addr, detail: e.target.value }); setErrors(p => ({ ...p, detail: "" })); }} placeholder="Байр, тоот, давхар, орц..." rows={2} style={{ ...inputStyle("detail"), resize: "none" }} />
            {errors.detail && <div style={{ fontFamily: F, fontSize: 11, color: "#D32F2F", marginTop: 3 }}>{errors.detail}</div>}
          </div>
          <div>
            <div style={{ fontFamily: F, fontSize: 12, fontWeight: 500, color: "#666666", marginBottom: 4 }}>Тэмдэглэл (заавал биш)</div>
            <input value={addr.memo} onChange={e => setAddr({ ...addr, memo: e.target.value })} placeholder="Delivery instructions..." style={inputStyle("memo")} />
          </div>
        </div>
      </>}

      {/* Step 1: Payment method */}
      {step === 1 && <>
        <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: "#111111", marginBottom: 12 }}>Төлбөрийн хэлбэр</div>
        {methods.map(m => <button type="button" key={m[0]} onClick={() => setMethod(m[0])} style={{
          width: "100%", background: method === m[0] ? "#F7F7F7" : "#FFFFFF",
          border: `1px solid ${method === m[0] ? "#111111" : "#E5E5E5"}`,
          borderRadius: 8, padding: "14px 16px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 12, textAlign: "left", marginBottom: 8,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#F7F7F7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#111111" }}>{m[1]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: "#111111" }}>{m[2]}</div>
            <div style={{ fontFamily: F, fontSize: 12, color: "#999999" }}>{m[3]}</div>
          </div>
          {method === m[0] && <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} /></div>}
        </button>)}
      </>}

      {/* Step 2: Confirmation */}
      {step === 2 && <>
        <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: "#111111", marginBottom: 12 }}>Захиалгын дүн</div>
        <div style={{ border: "1px solid #E5E5E5", borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: F, fontSize: 12, fontWeight: 500, color: "#999999", marginBottom: 8 }}>Хүргэлтийн хаяг</div>
          <div style={{ fontFamily: F, fontSize: 13, color: "#111111", lineHeight: 1.6, marginBottom: 12 }}>
            {addr.name} · {addr.phone}<br/>
            {addr.city} {addr.district}<br/>
            {addr.detail}
            {addr.memo && <><br/><span style={{ color: "#999999" }}>{addr.memo}</span></>}
          </div>
          <div style={{ height: 1, background: "#F0F0F0", margin: "8px 0 12px" }} />
          {[
            ["Барааны дүн", "₮" + subtotal.toLocaleString()],
            ["Хүргэлт", shipping === 0 ? "Үнэгүй" : "₮" + shipping.toLocaleString()],
            ["Нийт", "₮" + total.toLocaleString()],
          ].map((r, i) => <div key={r[0]} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span style={{ fontFamily: F, fontSize: i === 2 ? 14 : 13, fontWeight: i === 2 ? 600 : 400, color: i === 2 ? "#111111" : "#666666" }}>{r[0]}</span>
            <span style={{ fontFamily: F, fontSize: i === 2 ? 16 : 13, fontWeight: i === 2 ? 700 : 400, color: "#111111" }}>{r[1]}</span>
          </div>)}
        </div>
      </>}
      <div style={{ height: 20 }} />
    </div>

    {/* Bottom CTA */}
    <div style={{ padding: "12px 16px 32px", borderTop: "1px solid #F0F0F0" }}>
      <PBtn full loading={loading} onClick={async () => {
        if (step === 0) {
          if (!validateStep0()) return;
          setStep(1);
        } else if (step === 1) {
          setStep(2);
        } else {
          setLoading(true);
          try {
            // Server-side price & stock verification
            if (isSupabaseReady()) {
              for (const it of items) {
                const { data: latestWork } = await supabase.from("works").select("price, stock").eq("id", it.id).single();
                if (!latestWork) {
                  const { toast } = await import("@/components/layout/Toast");
                  toast("Бүтээл олдсонгүй", "error");
                  setLoading(false); return;
                }
                if (latestWork.price !== it.price) {
                  const { toast } = await import("@/components/layout/Toast");
                  toast("Үнэ өөрчлөгдсөн. Дахин оролдоно уу", "error");
                  setLoading(false); return;
                }
                if (latestWork.stock !== null && latestWork.stock < (it.qty || 1)) {
                  const { toast } = await import("@/components/layout/Toast");
                  toast("Нөөц хүрэлцэхгүй байна", "error");
                  setLoading(false); return;
                }
              }
            }
            const sellerId = items[0]?.creator_id || items[0]?.cid || getAllWorks().find(wk => wk.id === items[0]?.id)?.creator_id || null;
            if (!sellerId) {
              const { toast } = await import("@/components/layout/Toast");
              toast("Борлуулагч олдсонгүй", "error");
              setLoading(false); return;
            }
            const newOrder = {
              id: Date.now(),
              title: items.length === 1 ? items[0].title : items.length + " items",
              creator: items[0]?.creator || "—",
              price: total,
              items: items.map(it => ({ id: it.id, title: it.title, price: it.price, qty: it.qty || 1, size: it.size, color: it.color })),
              status: "pending",
              date: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
              address: { ...addr },
              method,
              canReview: false,
              tracking: null,
            };
            if (GS.user.id) {
              const orderPayload = {
                buyer_id: GS.user.id, seller_id: sellerId,
                items: newOrder.items, total_price: total,
                shipping_fee: shipping, payment_method: method,
                address: addr, status: "pending",
              };
              if (isSupabaseReady() && sellerId) {
                const { data, error } = await supabase.from('orders').insert(orderPayload).select().single();
                if (data) newOrder.id = data.id;
                else { const sqId = SQ.push('createOrder', orderPayload); newOrder._sqId = sqId; }
              } else if (sellerId) {
                const sqId = SQ.push('createOrder', orderPayload);
                newOrder._sqId = sqId;
              }
            }
            GS.orders.unshift(newOrder);
            GS.selectedOrderId = newOrder.id;
            // Deduct stock
            items.forEach(it => {
              const work = getAllWorks().find(wk => wk.id === it.id);
              if (work && work.stock > 0) work.stock = Math.max(0, work.stock - (it.qty || 1));
            });
            if (directItem) GS.directBuyItem = null;
            else GS.cart = [];
            GS.notifications.unshift({ id: Date.now(), icon: "sale", title: "Захиалга баталгаажлаа", desc: `"${w.title}" амжилттай захиалагдлаа.`, time: "Сая", read: false, to: "order-detail" });
            GS.unreadNotif++;
            setLoading(false);
            saveGS();
            nav("order-detail");
          } catch (e) {
            setLoading(false);
          }
        }
      }}>{step === 2 ? `₮${total.toLocaleString()} Төлөх` : "Дараах"}</PBtn>
    </div>
  </div>;
}
