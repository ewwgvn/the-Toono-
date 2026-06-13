"use client";
import { useState, useEffect } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { toast } from "@/components/layout/Toast";
import {
  IcMoney, IcCommission, IcProfile, IcHeart, IcUpload, IcBell,
} from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Empty from "@/components/atoms/Empty";
import Simple from "@/components/layout/Simple";
import { a11yClick } from "@/lib/utils";

export default function Notifications({ nav, refresh }) {
  const iconMap = { sale: <IcMoney />, comm: <IcCommission />, follow: <IcProfile />, like: <IcHeart />, upload: <IcUpload />, money: <IcMoney /> };
  const [notis, setNotis] = useState([...GS.notifications]);
  const unread = notis.filter(n => !n.read).length;

  // Real-time subscription for incoming notifications
  useEffect(() => {
    if (!isSupabaseReady() || !GS.user.id) return;
    const sub = DB.subscribeToNotifications?.(GS.user.id, (newNotif) => {
      const mapped = {
        id: newNotif.id, icon: newNotif.icon, title: newNotif.title,
        desc: newNotif.description, time: "Сая", read: false, to: newNotif.link,
      };
      GS.notifications.unshift(mapped);
      GS.unreadNotif = (GS.unreadNotif || 0) + 1;
      setNotis([...GS.notifications]);
      refresh();
    });
    return () => { sub?.unsubscribe?.(); };
  }, []);

  const markOne = (n) => {
    if (!n.read) {
      n.read = true;
      // Also mark in GS.notifications
      const gsN = GS.notifications.find(x => x.id === n.id);
      if (gsN) gsN.read = true;
      GS.unreadNotif = Math.max(0, GS.unreadNotif - 1);
      setNotis([...notis]);
      saveGS();
      refresh();
      // Persist to Supabase
      if (isSupabaseReady()) {
        DB.markNotificationRead(n.id).catch(() => {});
      }
    }
    // Set context before navigating
    if (n.to === "order-detail" && n.orderId) GS.selectedOrderId = n.orderId;
    if (n.to) nav(n.to);
  };

  const markAll = () => {
    notis.forEach(n => n.read = true);
    GS.notifications.forEach(n => n.read = true);
    GS.unreadNotif = 0;
    setNotis([...notis]);
    saveGS();
    refresh();
    toast("Бүгд уншсан", "success");
    // Persist to Supabase
    if (isSupabaseReady() && GS.user.id) {
      DB.markAllNotificationsRead(GS.user.id).catch(() => {});
    }
  };

  return (
    <Simple nav={nav} title={"Мэдэгдэл" + (unread > 0 ? " (" + unread + ")" : "")} back="me" right={unread > 0 && <button type="button" onClick={markAll} style={{ background: "none", border: "none", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.accent, cursor: "pointer" }}>Бүгдийг уншсан</button>}>
      {notis.length === 0
        ? <Empty icon={<IcBell />} title="Мэдэгдэл байхгүй" sub="Шинэ мэдэгдэл ирэхэд энд харагдана" />
        : <div style={{ paddingTop: 6 }}>{notis.map(n => (
          <div key={n.id} {...a11yClick(() => markOne(n))} className="toono-pressable" style={{ padding: "13px 12px", marginBottom: 4, display: "flex", gap: 13, alignItems: "flex-start", borderRadius: 14, background: n.read ? "transparent" : T.accentSub, cursor: "pointer" }}>
            <div style={{ width: 42, height: 42, borderRadius: 14, background: n.read ? T.s2 : T.textH, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: n.read ? T.textDim : "#fff" }}>{iconMap[n.icon] || <IcBell />}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 3 }}>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: n.read ? 500 : 700, color: n.read ? T.textSub : T.textH, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: "#AAA", flexShrink: 0 }}>{n.time}</div>
              </div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: n.read ? T.textSub : T.textB, lineHeight: 1.5 }}>{n.desc}</div>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.red, marginTop: 6, flexShrink: 0 }} />}
          </div>
        ))}</div>}
    </Simple>
  );
}
