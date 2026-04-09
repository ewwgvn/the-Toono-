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

export default function Checkout({ nav, workId, refresh, goBack }) {
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [addr, setAddr] = useState({ name: GS.user.name || "", phone: "", city: "Улаанбаатар", district: "", detail: "", memo: "" });

  // Direct buy or from cart
  const directItem = GS.directBuyItem;
  const items = directItem ? [directItem] : GS.cart.length > 0 ? GS.cart : [];
  const subtotal = items.reduce((s, it) => s + ((it.price || 0) * (it.qty || 1)), 0);
  const shipping = items.some(i => !i.digital) ? 15000 : 0;
  const total = subtotal + shipping;
  const w = items[0] || getAllWorks().find(x => x.id === workId) || { id: 0, title: "—", creator: "—", price: 0 };
  const methods = [["card", <IcMoney key="card" />, "Зээлийн карт", "Бүх картаар"], ["bank", <IcB2B key="bank" />, "Данс шилжүүлэг", "Шуурхай"], ["qpay", <IcShield key="qpay" />, "QPay", "Монголын алдарт QPay"], ["socialpay", <IcCheck key="sp" />, "SocialPay", "Хаан Банкны төлбөр"]];
  const stepL = ["Захиалгын мэдээлэл", "Хүргэлт · Төлбөр", "Баталгаажуулах"];

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    <div style={{ padding: "20px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <button onClick={() => step === 0 ? (goBack ? goBack() : nav("home")) : setStep(step - 1)} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 18, fontWeight: 800, color: T.textH }}>Худалдаж авах</div>
      <div style={{ width: 40 }} />
    </div>
    {/* Express Payment Buttons (always visible at top) */}
    {step === 0 && <div style={{ padding: "0 20px 10px", display: "flex", gap: 8 }}>
      <button onClick={() => { setMethod("kakao"); setStep(2); }} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#FEE500", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
        <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 700, color: "#3C1E1E" }}>KakaoPay</span>
      </button>
      <button onClick={() => { setMethod("naver"); setStep(2); }} style={{ flex: 1, padding: "12px", borderRadius: 12, background: "#03C75A", border: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer" }}>
        <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 700, color: "#fff" }}>NaverPay</span>
      </button>
    </div>}
    {step === 0 && <div style={{ padding: "0 20px 12px", display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: T.border }} /><span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub }}>эсвэл</span><div style={{ flex: 1, height: 1, background: T.border }} />
    </div>}
    <div style={{ padding: "0 20px 14px" }}>
      <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
        {stepL.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? T.accent : T.border, transition: "all .3s" }} />)}
      </div>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>{step + 1}/{stepL.length} — {stepL[step]}</div>
    </div>
    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "0 20px" }}>
      {/* Order items */}
      {items.map((it, idx) => <Crd key={it.id || idx} style={{ padding: "12px 16px", display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: (it.accent || T.accent) + "18", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
          {it.images?.[0] ? <img src={it.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Toono size={24} color={it.accent || T.accent} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 700, color: T.textH, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</div>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub }}>{it.creator || GS.user.name}{it.size ? " · " + it.size : ""}{it.color ? " · " + it.color : ""}</div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.accent }}>₮{(it.price || 0).toLocaleString()}</div>
          {(it.qty || 1) > 1 && <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: T.textSub }}>×{it.qty}</div>}
        </div>
      </Crd>)}
      <div style={{ height: 8 }} />
      {step === 0 && <>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 16, fontWeight: 700, color: T.textH, marginBottom: 14 }}>Хүлээн авагчийн мэдээлэл</div>
        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, fontWeight: 600, color: T.textSub, marginBottom: 5 }}>Хүлээн авагчийн нэр</div>
            <input value={addr.name} onChange={e => setAddr({ ...addr, name: e.target.value })} placeholder="Нэр" style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textH, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, fontWeight: 600, color: T.textSub, marginBottom: 5 }}>Утасны дугаар</div>
            <input value={addr.phone} onChange={e => setAddr({ ...addr, phone: e.target.value })} placeholder="99001122" type="tel" style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textH, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, fontWeight: 600, color: T.textSub, marginBottom: 5 }}>Хот / Аймаг</div>
              <select value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textH, outline: "none", appearance: "none", cursor: "pointer", boxSizing: "border-box" }}>
                {["Улаанбаатар", "Дархан", "Эрдэнэт", "Бусад"].map(c => <option key={c} value={c} style={{ background: T.s1 }}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, fontWeight: 600, color: T.textSub, marginBottom: 5 }}>Дүүрэг / Сум</div>
              <input value={addr.district} onChange={e => setAddr({ ...addr, district: e.target.value })} placeholder="Баянгол" style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textH, outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, fontWeight: 600, color: T.textSub, marginBottom: 5 }}>Дэлгэрэнгүй хаяг</div>
            <textarea value={addr.detail} onChange={e => setAddr({ ...addr, detail: e.target.value })} placeholder="Байр, тоот, давхар, орц..." rows={2} style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textH, outline: "none", resize: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, fontWeight: 600, color: T.textSub, marginBottom: 5 }}>Хүргэлтийн тэмдэглэл (заавал биш)</div>
            <input value={addr.memo} onChange={e => setAddr({ ...addr, memo: e.target.value })} placeholder="Жнь: Кодтой хаалга 1234" style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textH, outline: "none", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 16, fontWeight: 700, color: T.textH, marginBottom: 14 }}>Хүргэлтийн мэдээлэл</div>
        {[["Хүлээн авагч", addr.name || "—"], ["Холбоо барих", addr.phone || "—"], ["Хаяг", addr.city + (addr.district ? " " + addr.district : "")], ["Дэлгэрэнгүй хаяг", addr.detail || "—"], ["Тэмдэглэл", addr.memo || "—"]].map(f => <div key={f[0]} style={{ marginBottom: 12 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 600, color: T.textSub, marginBottom: 6 }}>{f[0]}</div>
          <input defaultValue={f[1]} style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12, padding: "12px 14px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textH, outline: "none", boxSizing: "border-box" }} />
        </div>)}
      </>}
      {step === 1 && <>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 16, fontWeight: 700, color: T.textH, marginBottom: 14 }}>Төлбөрийн хэлбэр</div>
        {methods.map(m => <button key={m[0]} onClick={() => setMethod(m[0])} style={{ width: "100%", background: method === m[0] ? T.accentSub : T.s1, border: `1.5px solid ${method === m[0] ? T.accent : T.border}`, borderRadius: 16, padding: "15px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, textAlign: "left", marginBottom: 10 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: T.s2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{m[1]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 600, color: T.textH }}>{m[2]}</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub, marginTop: 2 }}>{m[3]}</div>
          </div>
          {method === m[0] && <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} /></div>}
        </button>)}
      </>}
      {step === 2 && <>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 16, fontWeight: 700, color: T.textH, marginBottom: 14 }}>Баталгаажуулах</div>
        <Crd style={{ padding: "16px", marginBottom: 16 }}>
          {[["Барааны үнэ", "₮" + w.price.toLocaleString()], ["Хүргэлтийн хураамж", "₮" + shipping.toLocaleString()], ["Хөнгөлөлт", "-₮0"], ["Нийт төлбөр", "₮" + total.toLocaleString()]].map((r, i) => <div key={r[0]} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < 3 ? `1px solid ${T.border}` : "none" }}>
            <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: i === 3 ? 14 : 13, fontWeight: i === 3 ? 700 : 400, color: i === 3 ? T.textH : T.textSub }}>{r[0]}</span>
            <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: i === 3 ? 16 : 13, fontWeight: i === 3 ? 800 : 500, color: i === 3 ? T.accent : T.textH }}>{r[1]}</span>
          </div>)}
        </Crd>
      </>}
      <div style={{ height: 20 }} />
    </div>
    <div style={{ padding: "12px 20px 32px", borderTop: `1px solid ${T.border}` }}>
      <PBtn full loading={loading} onClick={async () => {
        if (step === 0 && (!addr.name || !addr.phone)) { if (typeof window !== "undefined") { const { toast } = await import("@/components/layout/Toast"); toast("Нэр, утасны дугаар оруулна уу", "error"); } return; }
        if (step < 2) { setStep(step + 1); }
        else {
          setLoading(true);
          try {
            const sellerId = items[0]?.creator_id || getAllWorks().find(wk => wk.id === items[0]?.id)?.creator_id || null;
            const newOrder = {
              id: Date.now(),
              title: items.length === 1 ? items[0].title : items.length + " бүтээл",
              creator: items[0]?.creator || "—",
              price: total,
              items: items.map(it => ({ id: it.id, title: it.title, price: it.price, qty: it.qty || 1, size: it.size, color: it.color })),
              status: "pending",
              date: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
              address: { ...addr },
              method: method,
              canReview: false,
              tracking: null,
            };
            if (GS.user.id) {
              const orderPayload = {
                buyer_id: GS.user.id,
                seller_id: sellerId,
                items: newOrder.items,
                total_price: total,
                shipping_fee: shipping,
                payment_method: method,
                address: addr,
                status: "pending",
              };
              if (isSupabaseReady() && sellerId) {
                const { data, error } = await supabase.from('orders').insert(orderPayload).select().single();
                if (data) {
                  newOrder.id = data.id;
                } else {
                  const sqId = SQ.push('createOrder', orderPayload);
                  newOrder._sqId = sqId;
                  if (error) console.error('[Checkout] createOrder:', error.message);
                }
              } else if (sellerId) {
                const sqId = SQ.push('createOrder', orderPayload);
                newOrder._sqId = sqId;
              }
            }
            GS.orders.unshift(newOrder);
            GS.selectedOrderId = newOrder.id;
            if (directItem) GS.directBuyItem = null;
            else GS.cart = [];
            GS.notifications.unshift({ id: Date.now(), icon: "sale", title: "Захиалга баталгаажлаа", desc: `"${w.title}" захиалга амжилттай.`, time: "Сая", read: false, to: "order-detail" });
            GS.unreadNotif++;
            setLoading(false);
            saveGS();
            nav("order-detail");
          } catch (e) {
            setLoading(false);
          }
        }
      }}>{step === 2 ? "₮" + total.toLocaleString() + " Төлөх" : "Дараах"}</PBtn>
      {/* Trust signals */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><IcShield /><span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: T.textSub }}>Аюулгүй төлбөр</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><IcLock /><span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: T.textSub }}>Шифрлэгдсэн</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}><IcCheck /><span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: T.textSub }}>Буцаалтын баталгаа</span></div>
      </div>
    </div>
  </div>;
}
