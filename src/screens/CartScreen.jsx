"use client";

import { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { IcBack, IcBookmark, IcTrash, IcFilter, IcCheck, IcCoupon, IcCartEmpty } from "@/components/icons";
import Crd from "@/components/atoms/Crd";
import PBtn from "@/components/atoms/PBtn";
import Toono from "@/components/atoms/Toono";
import Empty from "@/components/atoms/Empty";

export default function CartScreen({ nav, refresh, goBack }) {
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [qty, setQty] = useState({});

  const cartItems = GS.cart.filter((item, index, self) => self.findIndex(i => i.id === item.id && i.size === item.size && i.color === item.color) === index);
  const getQty = (id) => qty[id] || 1;
  const subtotal = cartItems.reduce((s, it) => s + (it.price * getQty(it.id)), 0);
  const discount = couponApplied ? Math.floor(subtotal * couponDiscount) : 0;
  const shipping = cartItems.some(i => !i.digital) ? 15000 : 0;
  const total = subtotal - discount + shipping;

  const applyCoupon = () => {
    const codes = { "THETOONO10": .10, "MONGOL20": .20, "FIRST15": .15 };
    if (codes[coupon.toUpperCase()]) {
      setCouponDiscount(codes[coupon.toUpperCase()]);
      setCouponApplied(true);
    }
  };

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    <div style={{ padding: "20px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <button type="button" onClick={() => goBack ? goBack() : nav("home")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 20, fontWeight: 800, color: T.textH }}>Сагс</div>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textSub }}>{cartItems.length} бүтээл</div>
    </div>

    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "0 20px" }}>
      {cartItems.length === 0
        ? <Empty icon={<IcCartEmpty />} title="Сагс хоосон байна" sub="Таалагдсан бүтээлийг сагсанд нэмнэ үү" action="Бүтээл хайх" onAction={() => nav("explore")} />
        : <>
          {cartItems.map(item => <Crd key={item.id} style={{ marginBottom: 12, padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 0 }}>
              <div style={{ width: 90, background: "#F7F7F7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                {item.images?.[0] ? <img src={item.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Toono size={36} color="#999999" />}
                {item.digital && <div style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", background: "rgba(136,80,212,0.9)", borderRadius: 6, padding: "2px 6px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 8, fontWeight: 700, color: "#fff" }}>
                  <svg width="9" height="10" viewBox="0 0 9 10" fill="none"><path d="M4.5 1V7M1.5 4.5L4.5 7.5L7.5 4.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><path d="M1 9H8" stroke="white" strokeWidth="1.2" strokeLinecap="round" /></svg> Дижитал
                </div>}
              </div>
              <div style={{ flex: 1, padding: "12px 14px" }}>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 3 }}>{item.title}</div>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub, marginBottom: 6 }}>{item.creator}</div>
                {(item.size || item.color) && <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {item.size && <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.accent, background: T.accentSub, padding: "2px 8px", borderRadius: 6 }}><IcFilter /> {item.size}</span>}
                  {item.color && <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.accent, background: T.accentSub, padding: "2px 8px", borderRadius: 6 }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1" fill="none" /><circle cx="5" cy="5" r="1.8" /></svg> {item.color}
                  </span>}
                </div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.accent }}>₮{(item.price * getQty(item.id)).toLocaleString()}</div>
                  {!item.digital && <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button type="button" onClick={() => setQty(q => ({ ...q, [item.id]: Math.max(1, getQty(item.id) - 1) }))} style={{ width: 28, height: 28, borderRadius: 8, background: T.s2, border: `1px solid ${T.border}`, color: T.textH, cursor: "pointer", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                    <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, minWidth: 16, textAlign: "center" }}>{getQty(item.id)}</span>
                    <button type="button" onClick={() => setQty(q => ({ ...q, [item.id]: Math.min(item.stock, getQty(item.id) + 1) }))} style={{ width: 28, height: 28, borderRadius: 8, background: T.s2, border: `1px solid ${T.border}`, color: T.textH, cursor: "pointer", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                  </div>}
                </div>
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${T.border}`, padding: "8px 14px", display: "flex", justifyContent: "space-between" }}>
              <button type="button" onClick={() => { GS.saved.add(item.id); GS.cart = GS.cart.filter(c => c.id !== item.id); refresh(); }} style={{ background: "none", border: "none", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.accent, cursor: "pointer" }}><span style={{ display: "flex" }}><IcBookmark /></span> Хадгалах</button>
              <button type="button" onClick={() => { GS.cart = GS.cart.filter(c => c.id !== item.id); refresh(); }} style={{ background: "none", border: "none", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.red, cursor: "pointer" }}><span style={{ display: "flex" }}><IcTrash /></span> Хасах</button>
            </div>
          </Crd>)}

          {/* Order summary */}
          <Crd style={{ padding: "16px", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 12 }}>Захиалгын дүн</div>
            {[
              ["Барааны дүн", "₮" + subtotal.toLocaleString()],
              ...(couponApplied ? [["Купон хөнгөлөлт", "-₮" + discount.toLocaleString()]] : []),
              ["Хүргэлт", shipping === 0 ? "Үнэгүй" : "₮" + shipping.toLocaleString()],
            ].map((r, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textSub }}>{r[0]}</span>
              <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: r[0].includes("хөнгөлөлт") ? T.green : T.textH }}>{r[1]}</span>
            </div>)}
            <div style={{ height: 1, background: T.border, margin: "8px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.textH }}>Нийт дүн</span>
              <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 18, fontWeight: 800, color: T.accent }}>₮{total.toLocaleString()}</span>
            </div>
          </Crd>
        </>}
      <div style={{ height: 20 }} />
    </div>

    {cartItems.length > 0 && <div style={{ padding: "12px 20px 32px", borderTop: `1px solid ${T.border}` }}>
      <PBtn full disabled={cartItems.length === 0} onClick={() => {
        // Update cart items with adjusted quantities
        GS.cart = cartItems.map(it => ({...it, qty: getQty(it.id)}));
        GS.directBuyItem = null; saveGS(); nav("checkout");
      }}>Захиалах — ₮{total.toLocaleString()}</PBtn>
    </div>}
  </div>;
}
