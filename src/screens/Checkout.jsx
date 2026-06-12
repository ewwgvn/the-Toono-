"use client";

import { useState, useEffect, useRef } from "react";
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
  const [doneOrder, setDoneOrder] = useState(null);
  const [qpayData, setQpayData] = useState(null); // { orderId, qrImage, qrText, shortUrl, deeplinks }
  const [qpayStatus, setQpayStatus] = useState("waiting"); // waiting | checking | paid | failed
  const pollRef = useRef(null);
  const [addr, setAddr] = useState({ name: GS.user.name || "", phone: "", city: "Улаанбаатар", district: "", detail: "", memo: "" });

  const directItem = GS.directBuyItem;
  const items = directItem ? [directItem] : GS.cart.length > 0 ? GS.cart : [];
  const subtotal = items.reduce((s, it) => s + ((it.price || 0) * (it.qty || 1)), 0);
  const shipping = items.some(i => !i.digital) ? 15000 : 0;
  const platformFee = Math.round(subtotal * 0.08);
  const sellerPayout = Math.max(0, subtotal - platformFee);
  const total = subtotal + shipping;
  const w = items[0] || getAllWorks().find(x => x.id === workId) || { id: 0, title: "—", creator: "—", price: 0 };
  const methods = [
    ["card", <IcMoney key="card" />, "Карт", "Visa, Mastercard"],
    ["bank", <IcB2B key="bank" />, "Дансаар", "Банк шилжүүлэг"],
    ["qpay", <IcShield key="qpay" />, "QPay", "QR төлбөр"],
  ];
  const stepL = ["Хүргэлтийн мэдээлэл", "Төлбөрийн хэлбэр", "Баталгаажуулах"];

  // Poll QPay order status while QR is shown
  useEffect(() => {
    if (!qpayData || qpayStatus === "paid" || qpayStatus === "failed") return;
    const poll = async () => {
      try {
        setQpayStatus("checking");
        const res = await fetch(`/api/orders/${qpayData.orderId}/status`);
        const json = await res.json();
        if (json?.data?.status === "PAID") {
          clearInterval(pollRef.current);
          setQpayStatus("paid");
          finishOrder(qpayData.orderId);
        } else {
          setQpayStatus("waiting");
        }
      } catch {
        setQpayStatus("waiting");
      }
    };
    pollRef.current = setInterval(poll, 2000);
    return () => clearInterval(pollRef.current);
  }, [qpayData]);

  const finishOrder = (remoteOrderId) => {
    const newOrder = {
      id: remoteOrderId || Date.now(),
      title: items.length === 1 ? items[0].title : items.length + " items",
      creator: items[0]?.creator || "—",
      price: total, subtotal, shipping, platformFee, sellerPayout,
      items: items.map(it => ({ id: it.id, title: it.title, price: it.price, qty: it.qty || 1, size: it.size, color: it.color })),
      status: "pending", paymentStatus: "paid", escrowStatus: "held", payoutStatus: "pending",
      date: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
      address: { ...addr }, method,
      canReview: false, tracking: null,
      protectionUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10).replace(/-/g, "."),
    };
    GS.orders.unshift(newOrder);
    GS.selectedOrderId = newOrder.id;
    GS.notifications.unshift({ id: Date.now(), icon: "sale", title: "Захиалга баталгаажлаа", desc: `"${w.title}" амжилттай захиалагдлаа.`, time: "Сая", read: false, to: "order-detail" });
    GS.unreadNotif++;
    if (directItem) GS.directBuyItem = null;
    else GS.cart = [];
    saveGS();
    setDoneOrder(newOrder);
  };

  const launchQPay = async () => {
    setLoading(true);
    try {
      const sellerId = items[0]?.creator_id || items[0]?.cid || getAllWorks().find(wk => wk.id === items[0]?.id)?.creator_id || null;
      if (!sellerId) {
        const { toast } = await import("@/components/layout/Toast");
        toast("Борлуулагч олдсонгүй", "error");
        setLoading(false); return;
      }
      let buyerEmail = `${addr.phone}@guest.uliger.world`;
      if (GS.user.id && isSupabaseReady()) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) buyerEmail = user.email;
        } catch {}
      }
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: sellerId,
          workId: items[0]?.id ?? null,
          buyerEmail,
          buyerName: addr.name,
          itemTitle: items.length === 1 ? items[0].title : `${items.length}개 상품`,
          amount: total,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json?.data?.orderId) {
        throw new Error(json?.error?.message || "QPay error");
      }
      setQpayData(json.data);
    } catch (e) {
      const { toast } = await import("@/components/layout/Toast");
      toast(e.message || "QPay холболт алдаатай", "error");
    } finally {
      setLoading(false);
    }
  };

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
    border: `1px solid ${errors[field] ? T.red : T.border}`,
    borderRadius: 8, padding: "12px 14px",
    fontFamily: F, fontSize: 14, color: T.textH,
    outline: "none", boxSizing: "border-box",
  });

  // ── Payment success screen ──────────────────────────────────────
  if (doneOrder) return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#FFFFFF", padding: "32px 24px", textAlign: "center" }}>
      {/* Checkmark circle */}
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#F0FAF0", border: `2px solid ${T.green}40`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <path d="M8 18L15 25L28 11" stroke={T.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div style={{ fontFamily: F, fontSize: 22, fontWeight: 800, color: T.textH, marginBottom: 8 }}>Төлбөр амжилттай!</div>
      <div style={{ fontFamily: F, fontSize: 14, color: T.textSub, lineHeight: 1.7, marginBottom: 24 }}>
        Таны захиалга баталгаажлаа.<br/>
        Бүтээлч удахгүй боловсруулж эхэлнэ.
      </div>
      {/* Order summary card */}
      <div style={{ width: "100%", maxWidth: 360, background: T.s2, borderRadius: 16, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
        <div style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: T.textSub, letterSpacing: ".05em", marginBottom: 10 }}>ЗАХИАЛГЫН МЭДЭЭЛЭЛ</div>
        {doneOrder.items?.map((it, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: i < doneOrder.items.length - 1 ? `1px solid ${T.border}` : "none" }}>
            <span style={{ fontFamily: F, fontSize: 13, color: T.textH }}>{it.title}{it.qty > 1 ? ` ×${it.qty}` : ""}</span>
            <span style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: T.textH }}>₮{((it.price || 0) * (it.qty || 1)).toLocaleString()}</span>
          </div>
        ))}
        <div style={{ height: 1, background: T.border, margin: "10px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: T.textH }}>Нийт</span>
          <span style={{ fontFamily: F, fontSize: 16, fontWeight: 800, color: T.textH }}>₮{(doneOrder.price || 0).toLocaleString()}</span>
        </div>
        <div style={{ fontFamily: F, fontSize: 11, color: T.textSub, marginTop: 8 }}>
          Хүргэлт: {doneOrder.address?.city} {doneOrder.address?.district}
        </div>
      </div>
      {/* Escrow note */}
      <div style={{ width: "100%", maxWidth: 360, background: "#F0FAF0", border: `1px solid ${T.green}20`, borderRadius: 12, padding: "12px 16px", marginBottom: 28, textAlign: "left", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <IcShield />
        <div style={{ fontFamily: F, fontSize: 12, color: T.green, lineHeight: 1.6 }}>Таны ₮{(doneOrder.price || 0).toLocaleString()} эскроуд хадгалагдлаа. Хүргэлтийг баталгаажуулсны дараа бүтээлчид шилжинэ.</div>
      </div>
      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 10 }}>
        <PBtn full onClick={() => { GS.selectedOrderId = doneOrder.id; nav("order-detail"); }}>Захиалга харах</PBtn>
        <PBtn full secondary onClick={() => nav("home")}>Нүүр хуудас руу</PBtn>
      </div>
    </div>
  );

  // ── QPay QR screen ─────────────────────────────────────────────
  if (qpayData) {
    const isMobile = typeof window !== "undefined" && /Android|iPhone|iPad/i.test(navigator.userAgent);
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FFFFFF" }}>
        <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.borderLight}` }}>
          <button type="button" onClick={() => { clearInterval(pollRef.current); setQpayData(null); setQpayStatus("waiting"); }} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
          <div style={{ fontFamily: F, fontSize: 16, fontWeight: 600, color: T.textH }}>QPay төлбөр</div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ fontFamily: F, fontSize: 26, fontWeight: 800, color: T.textH, marginBottom: 4 }}>₮{total.toLocaleString()}</div>
          <div style={{ fontFamily: F, fontSize: 13, color: T.textSub, marginBottom: 24 }}>{items[0]?.title || "Захиалга"}</div>

          {/* QR code image */}
          {!isMobile && qpayData.qrImage && (
            <div style={{ border: `1px solid ${T.border}`, borderRadius: 16, padding: 16, marginBottom: 20, background: "#fff" }}>
              <img src={`data:image/png;base64,${qpayData.qrImage}`} alt="QPay QR" style={{ width: 200, height: 200, display: "block" }} />
            </div>
          )}

          {/* Status pill */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, padding: "8px 16px", borderRadius: 20, background: qpayStatus === "paid" ? "#F0FAF0" : T.s2 }}>
            {qpayStatus === "paid" ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L7 12L13 4" stroke={T.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: qpayStatus === "checking" ? T.textH : T.textSub, animation: "pulse 1.5s ease-in-out infinite" }} />
            )}
            <span style={{ fontFamily: F, fontSize: 13, color: qpayStatus === "paid" ? T.green : T.textSub }}>
              {qpayStatus === "paid" ? "Төлбөр баталгаажлаа!" : qpayStatus === "checking" ? "Шалгаж байна..." : "Төлбөрийн хариу хүлээж байна"}
            </span>
          </div>

          {/* Mobile deeplinks */}
          {isMobile && qpayData.deeplinks && Array.isArray(qpayData.deeplinks) && qpayData.deeplinks.length > 0 && (
            <div style={{ width: "100%", maxWidth: 360, marginBottom: 20 }}>
              <div style={{ fontFamily: F, fontSize: 12, color: T.textSub, marginBottom: 10, textAlign: "center" }}>Банкны апп сонгоно уу</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {qpayData.deeplinks.slice(0, 6).map((dl, i) => (
                  <a key={i} href={dl.link} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", border: `1px solid ${T.border}`, borderRadius: 10, textDecoration: "none", background: "#fff" }}>
                    {dl.logo ? <img src={dl.logo} alt={dl.name} style={{ width: 24, height: 24, borderRadius: 4, objectFit: "contain" }} /> : <div style={{ width: 24, height: 24, borderRadius: 4, background: T.s2 }} />}
                    <span style={{ fontFamily: F, fontSize: 12, color: T.textH, fontWeight: 500 }}>{dl.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Desktop hint */}
          {!isMobile && (
            <div style={{ fontFamily: F, fontSize: 13, color: T.textSub, textAlign: "center", lineHeight: 1.7, maxWidth: 280 }}>
              QPay апп нээж QR кодыг уншуулна уу.<br />Төлбөр хийгдсний дараа автоматаар дуусна.
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#FFFFFF" }}>
    {/* Header */}
    <div style={{ padding: "16px 16px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${T.borderLight}` }}>
      <button type="button" onClick={() => step === 0 ? (goBack ? goBack() : nav("home")) : setStep(step - 1)} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
      <div style={{ fontFamily: F, fontSize: 16, fontWeight: 600, color: T.textH }}>Төлбөр</div>
      <div style={{ marginLeft: "auto", fontFamily: F, fontSize: 12, color: T.textSub }}>{step + 1}/{stepL.length}</div>
    </div>

    {/* Step indicator */}
    <div style={{ padding: "12px 16px 0" }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {stepL.map((_, i) => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? T.textH : T.border, transition: "all .3s" }} />)}
      </div>
      <div style={{ fontFamily: F, fontSize: 12, color: T.textSub, marginBottom: 12 }}>{stepL[step]}</div>
    </div>

    <div className="toono-readable" style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "0 16px" }}>

      {/* Order items summary */}
      {items.map((it, idx) => <div key={it.id || idx} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.borderLight}` }}>
        <div style={{ width: 44, height: 44, borderRadius: 8, background: T.s2, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
          {it.images?.[0] ? <img src={it.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Toono size={20} color={T.textSub} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: T.textH, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</div>
          <div style={{ fontFamily: F, fontSize: 11, color: T.textSub }}>{it.creator || ""}{it.size ? " · " + it.size : ""}</div>
        </div>
        <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: T.textH, flexShrink: 0 }}>₮{(it.price || 0).toLocaleString()}</div>
      </div>)}

      <div style={{ height: 16 }} />

      {/* Step 0: Address & Contact */}
      {step === 0 && <>
        <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: T.textH, marginBottom: 12 }}>Хүргэлтийн мэдээлэл</div>
        <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
          <div>
            <label htmlFor="co-name" style={{ display: "block", fontFamily: F, fontSize: 12, fontWeight: 500, color: T.textSub, marginBottom: 4 }}>Нэр *</label>
            <input id="co-name" value={addr.name} onChange={e => { setAddr({ ...addr, name: e.target.value }); setErrors(p => ({ ...p, name: "" })); }} placeholder="Нэр" aria-invalid={!!errors.name} aria-describedby={errors.name?"co-name-err":undefined} style={inputStyle("name")} />
            {errors.name && <div id="co-name-err" role="alert" style={{ fontFamily: F, fontSize: 11, color: T.red, marginTop: 3 }}>{errors.name}</div>}
          </div>
          <div>
            <label htmlFor="co-phone" style={{ display: "block", fontFamily: F, fontSize: 12, fontWeight: 500, color: T.textSub, marginBottom: 4 }}>Утасны дугаар *</label>
            <input id="co-phone" value={addr.phone} onChange={e => { setAddr({ ...addr, phone: e.target.value }); setErrors(p => ({ ...p, phone: "" })); }} placeholder="99001122" type="tel" aria-invalid={!!errors.phone} aria-describedby={errors.phone?"co-phone-err":undefined} style={inputStyle("phone")} />
            {errors.phone && <div id="co-phone-err" role="alert" style={{ fontFamily: F, fontSize: 11, color: T.red, marginTop: 3 }}>{errors.phone}</div>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="co-city" style={{ display: "block", fontFamily: F, fontSize: 12, fontWeight: 500, color: T.textSub, marginBottom: 4 }}>Хот *</label>
              <select id="co-city" value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} style={{ ...inputStyle("city"), cursor: "pointer", appearance: "none" }}>
                {["Улаанбаатар", "Дархан", "Эрдэнэт", "Бусад"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="co-district" style={{ display: "block", fontFamily: F, fontSize: 12, fontWeight: 500, color: T.textSub, marginBottom: 4 }}>Дүүрэг *</label>
              <input id="co-district" value={addr.district} onChange={e => { setAddr({ ...addr, district: e.target.value }); setErrors(p => ({ ...p, district: "" })); }} placeholder="Баянгол" aria-invalid={!!errors.district} aria-describedby={errors.district?"co-district-err":undefined} style={inputStyle("district")} />
              {errors.district && <div id="co-district-err" role="alert" style={{ fontFamily: F, fontSize: 11, color: T.red, marginTop: 3 }}>{errors.district}</div>}
            </div>
          </div>
          <div>
            <label htmlFor="co-detail" style={{ display: "block", fontFamily: F, fontSize: 12, fontWeight: 500, color: T.textSub, marginBottom: 4 }}>Дэлгэрэнгүй хаяг *</label>
            <textarea id="co-detail" value={addr.detail} onChange={e => { setAddr({ ...addr, detail: e.target.value }); setErrors(p => ({ ...p, detail: "" })); }} placeholder="Байр, тоот, давхар, орц..." rows={2} aria-invalid={!!errors.detail} aria-describedby={errors.detail?"co-detail-err":undefined} style={{ ...inputStyle("detail"), resize: "none" }} />
            {errors.detail && <div id="co-detail-err" role="alert" style={{ fontFamily: F, fontSize: 11, color: T.red, marginTop: 3 }}>{errors.detail}</div>}
          </div>
          <div>
            <label htmlFor="co-memo" style={{ display: "block", fontFamily: F, fontSize: 12, fontWeight: 500, color: T.textSub, marginBottom: 4 }}>Тэмдэглэл (заавал биш)</label>
            <input id="co-memo" value={addr.memo} onChange={e => setAddr({ ...addr, memo: e.target.value })} placeholder="Тэмдэглэл бичих..." style={inputStyle("memo")} />
          </div>
        </div>
      </>}

      {/* Step 1: Payment method */}
      {step === 1 && <>
        <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: T.textH, marginBottom: 12 }}>Төлбөрийн хэлбэр</div>
        {methods.map(m => <button type="button" key={m[0]} onClick={() => setMethod(m[0])} style={{
          width: "100%", background: method === m[0] ? T.s2 : "#FFFFFF",
          border: `1px solid ${method === m[0] ? T.textH : T.border}`,
          borderRadius: 8, padding: "14px 16px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 12, textAlign: "left", marginBottom: 8,
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: T.s2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: T.textH }}>{m[1]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: T.textH }}>{m[2]}</div>
            <div style={{ fontFamily: F, fontSize: 12, color: T.textSub }}>{m[3]}</div>
          </div>
          {method === m[0] && <div style={{ width: 18, height: 18, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} /></div>}
        </button>)}
      </>}

      {/* Step 1: QPay hint */}
      {step === 1 && method === "qpay" && (
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginTop: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <IcShield />
          <div style={{ fontFamily: F, fontSize: 12, color: T.textSub, lineHeight: 1.6 }}>
            "Дараах" дарахад QPay QR код үүсгэж, банкны апп-аар шууд төлнө.
          </div>
        </div>
      )}
      {step === 1 && method === "bank" && (
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: 20, marginTop: 12 }}>
          <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: T.textH, marginBottom: 12 }}>Банкны шилжүүлгийн мэдээлэл</div>
          {[["Банк", "Хаан Банк"], ["Дансны дугаар", "5000XXXXXXXX"], ["Хүлээн авагч", "TOONO LLC"], ["Гүйлгээний утга", `ORDER-${Date.now().toString().slice(-6)}`]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.borderLight}` }}>
              <span style={{ fontFamily: F, fontSize: 12, color: T.textSub }}>{k}</span>
              <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: T.textH }}>{v}</span>
            </div>
          ))}
          <div style={{ fontFamily: F, fontSize: 11, color: T.textSub, marginTop: 10, lineHeight: 1.6 }}>Шилжүүлэг хийсний дараа "Дараах" дарна уу. Гүйлгээ баталгаажих хүртэл 1-3 цаг шаардлагатай.</div>
        </div>
      )}

      {/* Step 2: Confirmation */}
      {step === 2 && <>
        <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: T.textH, marginBottom: 12 }}>Захиалгын дүн</div>
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: F, fontSize: 12, fontWeight: 500, color: T.textSub, marginBottom: 8 }}>Хүргэлтийн хаяг</div>
          <div style={{ fontFamily: F, fontSize: 13, color: T.textH, lineHeight: 1.6, marginBottom: 12 }}>
            {addr.name} · {addr.phone}<br/>
            {addr.city} {addr.district}<br/>
            {addr.detail}
            {addr.memo && <><br/><span style={{ color: T.textSub }}>{addr.memo}</span></>}
          </div>
          <div style={{ height: 1, background: T.borderLight, margin: "8px 0 12px" }} />
          {[
            ["Барааны дүн", "₮" + subtotal.toLocaleString()],
            ["Хүргэлт", shipping === 0 ? "Үнэгүй" : "₮" + shipping.toLocaleString()],
            ["Нийт", "₮" + total.toLocaleString()],
          ].map((r, i) => <div key={r[0]} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
            <span style={{ fontFamily: F, fontSize: i === 2 ? 14 : 13, fontWeight: i === 2 ? 600 : 400, color: i === 2 ? T.textH : T.textSub }}>{r[0]}</span>
            <span style={{ fontFamily: F, fontSize: i === 2 ? 16 : 13, fontWeight: i === 2 ? 700 : 400, color: T.textH }}>{r[1]}</span>
          </div>)}
        </div>
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 8, padding: 16, marginBottom: 16, background: T.s2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <IcShield />
            <span style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: T.textH }}>TOONO хамгаалалт</span>
          </div>
          {[
            ["Эскроуд хадгалах дүн", "₮" + total.toLocaleString()],
            ["Платформын шимтгэл", "₮" + platformFee.toLocaleString()],
            ["Бүтээлчид очих дүн", "₮" + sellerPayout.toLocaleString()],
          ].map(r => <div key={r[0]} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
            <span style={{ fontFamily: F, fontSize: 12, color: T.textSub }}>{r[0]}</span>
            <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: T.textH }}>{r[1]}</span>
          </div>)}
          <div style={{ fontFamily: F, fontSize: 11, color: T.textSub, lineHeight: 1.6, marginTop: 8 }}>Төлбөр хүргэлт баталгаажих хүртэл хадгалагдаж, худалдан авагч баталгаажуулсны дараа бүтээлчид шилжинэ.</div>
        </div>
      </>}
      <div style={{ height: 20 }} />
    </div>

    {/* Bottom CTA */}
    <div style={{ padding: "12px 16px 32px", borderTop: `1px solid ${T.borderLight}` }}>
      <PBtn full loading={loading} onClick={async () => {
        if (step === 0) {
          if (!validateStep0()) return;
          setStep(1);
        } else if (step === 1) {
          if (method === "qpay") {
            await launchQPay();
          } else {
            setStep(2);
          }
        } else {
          setLoading(true);
          try {
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
            finishOrder(null);
            if (isSupabaseReady() && sellerId) {
              const { DB } = await import("@/lib/supabase");
              DB.createNotification({
                user_id: sellerId,
                icon: "sale",
                title: "Шинэ захиалга ирлээ!",
                description: `₮${total.toLocaleString()} — ${items[0]?.title}${items.length > 1 ? ` болон ${items.length - 1} бараа` : ""}`,
                link: "comm-manage",
                read: false,
              }).catch(() => {});
            }
            items.forEach(it => {
              const work = getAllWorks().find(wk => wk.id === it.id);
              if (work && work.stock > 0) work.stock = Math.max(0, work.stock - (it.qty || 1));
            });
            setLoading(false);
          } catch (e) {
            setLoading(false);
          }
        }
      }}>{step === 2 ? `₮${total.toLocaleString()} Төлөх` : method === "qpay" && step === 1 ? "QR үүсгэх" : "Дараах"}</PBtn>
    </div>
  </div>;
}
