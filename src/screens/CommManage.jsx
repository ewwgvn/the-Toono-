"use client";

import { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { IcBack, IcCommission, IcStar } from "@/components/icons";
import Crd from "@/components/atoms/Crd";
import PBtn from "@/components/atoms/PBtn";
import Empty from "@/components/atoms/Empty";

export default function CommManage({ nav, goBack }) {
  const [tab, setTab] = useState("pending");
  const [, setTick] = useState(0);
  const stepL = ["Захиалга Зөвшөөрөх", "Ажил эхлэх", "Хүргэлтэд бэлтгэх", "Дууссан"];
  const allPending = GS.receivedCommissions.filter(c => c.status === "pending");
  const ongoing = GS.receivedCommissions.filter(c => c.status === "ongoing" || c.status === "accepted");
  const done = GS.receivedCommissions.filter(c => c.status === "done" || c.status === "delivered");

  const acceptComm = (r) => {
    GS.receivedCommissions = GS.receivedCommissions.map(c => c.id === r.id ? { ...c, status: "ongoing", step: 1 } : c);
    GS.notifications.unshift({ id: Date.now(), icon: "comm", title: "Захиалга зөвшөөрөгдлөө", desc: `${r.buyer || r.buyer_id}-ын захиалгыг зөвшөөрлөө.`, time: "Сая", read: true, to: "comm-manage" });
    if (isSupabaseReady() && r.id) DB.updateCommission(r.id, { status: "ongoing", step: 1 });
    saveGS(); setTick(t => t + 1);
  };
  const rejectComm = (r) => {
    GS.receivedCommissions = GS.receivedCommissions.filter(c => c.id !== r.id);
    if (isSupabaseReady() && r.id) DB.updateCommission(r.id, { status: "rejected" });
    saveGS(); setTick(t => t + 1);
  };
  const advanceStep = (r) => {
    const nextStep = (r.step || 1) + 1;
    const nextStatus = nextStep >= 4 ? "delivered" : "ongoing";
    GS.receivedCommissions = GS.receivedCommissions.map(c => c.id === r.id ? { ...c, step: nextStep, status: nextStatus } : c);
    if (isSupabaseReady() && r.id) DB.updateCommission(r.id, { step: nextStep, status: nextStatus });
    saveGS(); setTick(t => t + 1);
  };

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", gap: 10 }}>
      <button onClick={() => goBack ? goBack() : nav("me")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 20, fontWeight: 800, color: T.textH }}>Захиалга удирдах</div>
    </div>
    <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
      {[["pending", "Хүлээгдэж байна " + allPending.length], ["ongoing", "Явагдаж байна " + ongoing.length], ["done", "Дууссан " + done.length]].map(t => <button key={t[0]} onClick={() => setTab(t[0])} style={{ flex: 1, padding: "12px 0", background: "none", border: "none", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: tab === t[0] ? 700 : 500, color: tab === t[0] ? T.accent : T.textSub, borderBottom: `2px solid ${tab === t[0] ? T.accent : "transparent"}`, cursor: "pointer" }}>{t[1]}</button>)}
    </div>
    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "14px 20px 0" }}>
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
            <PBtn full secondary onClick={() => { GS.activeChatId = GS.conversations[0]?.id || null; nav("chatroom"); }}>Асуулт</PBtn>
            <PBtn full onClick={() => acceptComm(r)}>Зөвшөөрөх</PBtn>
          </div>
        </Crd>))}
      {tab === "ongoing" && ongoing.map(r => <Crd key={r.id} style={{ padding: "16px", marginBottom: 12 }}>
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
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub, marginBottom: 12 }}>{stepL[r.step - 1]}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <PBtn full secondary onClick={() => { GS.activeChatId = GS.conversations[0]?.id || null; nav("chatroom"); }}>Харилцаа</PBtn>
          {r.step < 4 && <PBtn full onClick={() => advanceStep(r)}>Дараах шат</PBtn>}
        </div>
      </Crd>)}
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
