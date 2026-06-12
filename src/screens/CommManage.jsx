"use client";

import { useState, useEffect } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { IcBack, IcCommission, IcStar, IcOrder } from "@/components/icons";
import Crd from "@/components/atoms/Crd";
import PBtn from "@/components/atoms/PBtn";
import Empty from "@/components/atoms/Empty";
import { toast } from "@/components/layout/Toast";

const F = "'Helvetica Neue', Arial, sans-serif";
const orderStatusLabel = { pending: "Хүлээгдэж байна", making: "Хийж байна", shipped: "Хүргэгдэж байна", delivered: "Хүргэгдсэн", done: "Дууссан", cancelled: "Цуцлагдсан" };
const orderStatusColor = { pending: T.yellow, making: T.accent, shipped: T.accent, delivered: T.green, done: T.textSub, cancelled: T.red };

export default function CommManage({ nav, goBack, refresh }) {
  const [tab, setTab] = useState("orders"); // default to orders tab
  const [, setTick] = useState(0);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [trackingInput, setTrackingInput] = useState({});
  const stepL = ["Захиалга Зөвшөөрөх", "Ажил эхлэх", "Хүргэлтэд бэлтгэх", "Дууссан"];
  const allPending = GS.receivedCommissions.filter(c => c.status === "pending");
  const ongoing = GS.receivedCommissions.filter(c => c.status === "ongoing" || c.status === "accepted");
  const done = GS.receivedCommissions.filter(c => c.status === "done" || c.status === "delivered");

  useEffect(() => {
    if (!isSupabaseReady() || !GS.user.id) return;
    setLoadingOrders(true);
    DB.getReceivedOrders(GS.user.id).then(data => {
      setReceivedOrders(data || []);
    }).catch(() => {}).finally(() => setLoadingOrders(false));
  }, []);

  const updateOrderStatus = async (orderId, newStatus, tracking = null) => {
    const update = { status: newStatus };
    if (tracking) update.tracking = tracking;
    if (isSupabaseReady() && orderId) {
      await DB.updateOrder(orderId, update).catch(() => {});
    }
    const order = receivedOrders.find(o => o.id === orderId);
    setReceivedOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...update } : o));
    if (tracking) setTrackingInput(prev => ({ ...prev, [orderId]: "" }));
    // Notify buyer
    const buyerMsgs = {
      making: ["Захиалга хүлээн авагдлаа ✓", "Таны захиалгыг хүлээн авлаа. Ажил эхэллээ!"],
      shipped: ["Захиалга хүргэлтэд гарлаа 📦", tracking ? `Хүргэлтийн дугаар: ${tracking}` : "Таны захиалга хүргэлтэд гарлаа."],
      cancelled: ["Захиалга цуцлагдлаа", "Таны захиалга цуцлагдлаа."],
    };
    if (order?.buyer_id && buyerMsgs[newStatus]) {
      notifyBuyer(order.buyer_id, buyerMsgs[newStatus][0], buyerMsgs[newStatus][1], "order-list");
    }
    toast(`Захиалга "${orderStatusLabel[newStatus]}" болгон шинэчлэгдлээ`, "success");
  };

  const notifyBuyer = (buyerId, title, desc, link = "me") => {
    if (isSupabaseReady() && buyerId) {
      DB.createNotification({ user_id: buyerId, icon: "comm", title, description: desc, link, read: false }).catch(() => {});
    }
  };

  const acceptComm = (r) => {
    GS.receivedCommissions = GS.receivedCommissions.map(c => c.id === r.id ? { ...c, status: "ongoing", step: 1 } : c);
    if (isSupabaseReady() && r.id) DB.updateCommission(r.id, { status: "ongoing", step: 1 });
    notifyBuyer(r.buyer_id,
      "Захиалга зөвшөөрөгдлөө ✓",
      `${GS.user.name} таны "${r.type}" захиалгыг зөвшөөрлөө. Ажил эхэллээ!`,
      "comm-status"
    );
    saveGS(); setTick(t => t + 1);
    toast("Захиалга зөвшөөрөгдлөө", "success");
  };
  const rejectComm = (r) => {
    GS.receivedCommissions = GS.receivedCommissions.filter(c => c.id !== r.id);
    if (isSupabaseReady() && r.id) DB.updateCommission(r.id, { status: "rejected" });
    notifyBuyer(r.buyer_id,
      "Захиалга татгалзагдлаа",
      `${GS.user.name} таны "${r.type}" захиалгыг хүлээж авах боломжгүй байна.`,
      "comm-status"
    );
    saveGS(); setTick(t => t + 1);
    toast("Захиалга татгалзагдлаа", "info");
  };

  const openChatWith = async (r) => {
    const buyerId = r.buyer_id || null;
    const buyerName = r.buyer || "Худалдан авагч";
    let convo = GS.conversations.find(cv => cv.creatorId === buyerId || cv.name === buyerName);
    if (!convo) {
      convo = { id: Date.now(), creatorId: buyerId, name: buyerName, accent: T.textH, online: false, unread: 0, msgs: [] };
      GS.conversations.unshift(convo);
    }
    if (isSupabaseReady() && GS.user.id && buyerId && GS.user.id !== buyerId) {
      const dbConvo = await DB.getOrCreateConversation(GS.user.id, buyerId);
      if (dbConvo) convo.dbId = dbConvo.id;
    }
    GS.activeChatId = convo.id; saveGS(); nav("chatroom");
  };
  const advanceStep = (r) => {
    const nextStep = (r.step || 1) + 1;
    const nextStatus = nextStep >= 4 ? "delivered" : "ongoing";
    const stepNames = ["", "Ажил эхэллээ", "Хийгдэж байна", "Хүргэлтэд бэлтгэж байна", "Дууссан — Хүлээн авна уу"];
    GS.receivedCommissions = GS.receivedCommissions.map(c => c.id === r.id ? { ...c, step: nextStep, status: nextStatus } : c);
    if (isSupabaseReady() && r.id) DB.updateCommission(r.id, { step: nextStep, status: nextStatus });
    notifyBuyer(r.buyer_id,
      `Захиалга шинэчлэгдлээ — ${stepNames[nextStep] || ""}`,
      `"${r.type}" захиалга дараах шатанд орлоо: ${stepNames[nextStep]}`,
      "comm-status"
    );
    saveGS(); setTick(t => t + 1);
    toast("Шат дэвшлээ", "success");
  };

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", gap: 10 }}>
      <button type="button" onClick={() => goBack ? goBack() : nav("me")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
      <div style={{ fontFamily: F, fontSize: 20, fontWeight: 800, color: T.textH }}>Захиалга удирдах</div>
    </div>
    {/* Main tabs: Orders vs Commissions */}
    <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
      {[["orders", "Захиалга", receivedOrders.length], ["pending", "Комисс", allPending.length + ongoing.length]].map(([id, label, count]) => (
        <button type="button" key={id} onClick={() => setTab(id === "orders" ? "orders" : "pending")} style={{ flex: 1, padding: "12px 0", background: "none", border: "none", fontFamily: F, fontSize: 13, fontWeight: (id === "orders" ? tab === "orders" : tab !== "orders") ? 700 : 500, color: (id === "orders" ? tab === "orders" : tab !== "orders") ? T.accent : T.textSub, borderBottom: `2px solid ${(id === "orders" ? tab === "orders" : tab !== "orders") ? T.accent : "transparent"}`, cursor: "pointer" }}>
          {label}{count > 0 ? ` ${count}` : ""}
        </button>
      ))}
    </div>
    {/* Commission sub-tabs */}
    {tab !== "orders" && <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, background: T.s2, flexShrink: 0 }}>
      {[["pending", "Хүлээгдэж байна " + allPending.length], ["ongoing", "Явагдаж байна " + ongoing.length], ["done", "Дууссан " + done.length]].map(t => <button type="button" key={t[0]} onClick={() => setTab(t[0])} style={{ flex: 1, padding: "10px 0", background: "none", border: "none", fontFamily: F, fontSize: 12, fontWeight: tab === t[0] ? 700 : 500, color: tab === t[0] ? T.accent : T.textSub, borderBottom: `2px solid ${tab === t[0] ? T.accent : "transparent"}`, cursor: "pointer" }}>{t[1]}</button>)}
    </div>}
    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "14px 20px 0" }}>
      {/* ── Orders tab ── */}
      {tab === "orders" && (loadingOrders
        ? <div style={{ padding: "40px 0", textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>Уншиж байна...</div>
        : receivedOrders.length === 0
          ? <Empty icon={<IcOrder />} title="Захиалга байхгүй" sub="Худалдан авалт хийгдэх үед энд харагдана" />
          : receivedOrders.map(o => {
            const pending = o.status === "pending";
            const making = o.status === "making";
            const canShip = making || o.status === "pending";
            return <Crd key={o.id} style={{ padding: "16px", marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {o.items?.[0]?.title || "Захиалга"}
                    {o.items?.length > 1 ? <span style={{ color: T.textSub, fontWeight: 400 }}> +{o.items.length - 1}</span> : ""}
                  </div>
                  <div style={{ fontFamily: F, fontSize: 12, color: T.textSub }}>
                    {o.created_at ? new Date(o.created_at).toLocaleDateString("mn-MN") : "—"}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                  <div style={{ fontFamily: F, fontSize: 15, fontWeight: 800, color: T.accent }}>₮{(o.total_price || o.price || 0).toLocaleString()}</div>
                  <span style={{ fontFamily: F, fontSize: 10, fontWeight: 600, color: orderStatusColor[o.status] || T.textSub, background: (orderStatusColor[o.status] || T.textSub) + "18", padding: "2px 8px", borderRadius: 6 }}>
                    {orderStatusLabel[o.status] || o.status}
                  </span>
                </div>
              </div>
              {/* Address */}
              {o.address && <div style={{ fontFamily: F, fontSize: 12, color: T.textSub, background: T.s2, borderRadius: 8, padding: "8px 12px", marginBottom: 10 }}>
                {o.address.city} {o.address.district} · {o.address.name} · {o.address.phone}
              </div>}
              {/* Items detail */}
              {o.items?.length > 0 && <div style={{ marginBottom: 10 }}>
                {o.items.map((it, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: i < o.items.length - 1 ? `1px solid ${T.border}` : "none" }}>
                  <span style={{ fontFamily: F, fontSize: 12, color: T.textH }}>{it.title}{it.size ? ` · ${it.size}` : ""}{it.qty > 1 ? ` ×${it.qty}` : ""}</span>
                  <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: T.textH }}>₮{((it.price || 0) * (it.qty || 1)).toLocaleString()}</span>
                </div>)}
              </div>}
              {/* Tracking input when shipping */}
              {canShip && o.status !== "cancelled" && <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    value={trackingInput[o.id] || ""}
                    onChange={e => setTrackingInput(prev => ({ ...prev, [o.id]: e.target.value }))}
                    placeholder="Хүргэлтийн дугаар (заавал биш)..."
                    style={{ flex: 1, background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "9px 12px", fontFamily: F, fontSize: 12, color: T.textH, outline: "none" }}
                  />
                </div>
              </div>}
              {/* Actions */}
              {o.status !== "cancelled" && o.status !== "done" && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {pending && <PBtn full onClick={() => updateOrderStatus(o.id, "making")}>Зөвшөөрч хийж эхлэх</PBtn>}
                {(pending || making) && <PBtn full secondary onClick={() => updateOrderStatus(o.id, "shipped", trackingInput[o.id] || null)}>Хүргэлтэд өгсөн</PBtn>}
                {o.status === "shipped" && <div style={{ fontFamily: F, fontSize: 12, color: T.textSub, width: "100%" }}>Худалдан авагч хүлээн авахыг хүлээж байна...</div>}
                {pending && <PBtn small secondary onClick={() => updateOrderStatus(o.id, "cancelled")}>Цуцлах</PBtn>}
              </div>}
              {o.status === "done" && <div style={{ fontFamily: F, fontSize: 12, color: T.green, textAlign: "center", padding: 8 }}>✓ Захиалга дууссан — ₮{(o.seller_payout || o.total_price || 0).toLocaleString()} хүлээгдэж байна</div>}
              {o.tracking && <div style={{ fontFamily: F, fontSize: 11, color: T.textSub, marginTop: 6 }}>Хүргэлтийн дугаар: <strong>{o.tracking}</strong></div>}
            </Crd>;
          })
      )}
      {tab === "pending" && (allPending.length === 0
        ? <Empty icon={<IcCommission />} title="Хүлээгдэж буй захиалга байхгүй" />
        : allPending.map(r => <Crd key={r.id} style={{ padding: "16px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 2 }}>{r.buyer}</div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>{r.type} · {r.date}</div>
            </div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.accent }}>{r.budget}</div>
          </div>
          <Crd style={{ padding: "10px 12px", marginBottom: 12, background: T.s2, border: "none", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textB, lineHeight: 1.5 }}>{r.msg}</Crd>
          <div style={{ display: "flex", gap: 8 }}>
            <PBtn full secondary danger onClick={() => rejectComm(r)}>Татгалзах</PBtn>
            <PBtn full secondary onClick={() => { openChatWith(r); }}>Асуулт</PBtn>
            <PBtn full onClick={() => acceptComm(r)}>Зөвшөөрөх</PBtn>
          </div>
        </Crd>))}
      {tab === "ongoing" && ongoing.map(r => {
        const [milestoneQR, setMilestoneQR] = useState(null);
        const [milestoneLoading, setMilestoneLoading] = useState(false);
        const requestMilestoneInvoice = async (stage) => {
          setMilestoneLoading(true);
          try {
            const res = await fetch(`/api/commissions/${r.id}/invoice`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ stage, buyerEmail: `${r.buyer_id}@uliger.world`, buyerName: r.buyer }),
            });
            const json = await res.json();
            if (json?.data?.qrImage) setMilestoneQR({ stage, ...json.data });
            else toast("QPay 연결 실패", "error");
          } catch { toast("오류 발생", "error"); }
          finally { setMilestoneLoading(false); }
        };
        return <Crd key={r.id} style={{ padding: "16px", marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 2 }}>{r.buyer}</div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>{r.type}</div>
            </div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.green }}>{r.budget}</div>
          </div>
          <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
            {stepL.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < r.step ? T.accent : T.border }} />)}
          </div>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub, marginBottom: 10 }}>{stepL[r.step - 1]}</div>

          {/* Milestone status */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: r.deposit_paid ? "#F0FAF0" : T.s2, border: `1px solid ${r.deposit_paid ? T.green + "40" : T.border}`, textAlign: "center" }}>
              <div style={{ fontFamily: F, fontSize: 10, color: T.textSub }}>계약금 50%</div>
              <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: r.deposit_paid ? T.green : T.textSub }}>{r.deposit_paid ? "납부됨" : "미납"}</div>
            </div>
            <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: r.final_paid ? "#F0FAF0" : T.s2, border: `1px solid ${r.final_paid ? T.green + "40" : T.border}`, textAlign: "center" }}>
              <div style={{ fontFamily: F, fontSize: 10, color: T.textSub }}>잔금 50%</div>
              <div style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: r.final_paid ? T.green : T.textSub }}>{r.final_paid ? "납부됨" : "미납"}</div>
            </div>
          </div>

          {/* Milestone QR popup */}
          {milestoneQR && (
            <div style={{ background: T.s2, borderRadius: 12, padding: 16, marginBottom: 12, textAlign: "center" }}>
              <div style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: T.textH, marginBottom: 10 }}>
                {milestoneQR.stage === "deposit" ? "계약금 50% QPay" : "잔금 50% QPay"}
              </div>
              <img src={`data:image/png;base64,${milestoneQR.qrImage}`} alt="QPay QR" style={{ width: 160, height: 160, display: "block", margin: "0 auto 10px" }} />
              <button onClick={() => setMilestoneQR(null)} style={{ fontFamily: F, fontSize: 12, color: T.textSub, background: "none", border: "none", cursor: "pointer" }}>닫기</button>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <PBtn full secondary onClick={() => { openChatWith(r); }}>Харилцаа</PBtn>
            {!r.deposit_paid && !milestoneQR && <PBtn full secondary loading={milestoneLoading} onClick={() => requestMilestoneInvoice("deposit")}>계약금 QR</PBtn>}
            {r.deposit_paid && !r.final_paid && r.step >= 3 && !milestoneQR && <PBtn full secondary loading={milestoneLoading} onClick={() => requestMilestoneInvoice("final")}>잔금 QR</PBtn>}
            {r.step < 4 && r.deposit_paid && <PBtn full onClick={() => advanceStep(r)}>Дараах шат</PBtn>}
          </div>
        </Crd>;
      })}
      {tab === "done" && done.map(r => <Crd key={r.id} style={{ padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 2 }}>{r.buyer}</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>{r.type} · {r.date}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.green }}>{r.budget}</div>
            <IcStar n={r.rating} />
          </div>
        </div>
      </Crd>)}
      <div style={{ height: 30 }} />
    </div>
  </div>;
}
