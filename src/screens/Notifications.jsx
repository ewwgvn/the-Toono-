"use client";
import { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { toast } from "@/components/layout/Toast";
import {
  IcMoney, IcCommission, IcProfile, IcHeart, IcUpload, IcBell,
} from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Empty from "@/components/atoms/Empty";
import Simple from "@/components/layout/Simple";

export default function Notifications({ nav, refresh }) {
  const iconMap = { sale: <IcMoney />, comm: <IcCommission />, follow: <IcProfile />, like: <IcHeart />, upload: <IcUpload />, money: <IcMoney /> };
  const [notis, setNotis] = useState([...GS.notifications]);
  const unread = notis.filter(n => !n.read).length;

  const markOne = (n) => {
    if (!n.read) {
      n.read = true;
      // Also mark in GS.notifications
      const gsN = GS.notifications.find(x => x.id === n.id);
      if (gsN) gsN.read = true;
      GS.unreadNotif = Math.max(0, GS.unreadNotif - 1);
      setNotis([...notis]);
      refresh();
    }
    nav(n.to);
  };

  const markAll = () => {
    notis.forEach(n => n.read = true);
    GS.notifications.forEach(n => n.read = true);
    GS.unreadNotif = 0;
    setNotis([...notis]);
    refresh();
    toast("Бүгд уншсан", "success");
  };

  return (
    <Simple nav={nav} title={"Мэдэгдэл" + (unread > 0 ? " (" + unread + ")" : "")} back="me" right={unread > 0 && <button onClick={markAll} style={{ background: "none", border: "none", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.accent, cursor: "pointer" }}>Бүгдийг уншсан</button>}>
      {notis.length === 0
        ? <Empty icon={<IcBell />} title="Мэдэгдэл байхгүй" sub="Шинэ мэдэгдэл ирэхэд энд харагдана" />
        : notis.map(n => (
          <div key={n.id} onClick={() => markOne(n)} style={{ padding: "14px 0", display: "flex", gap: 14, alignItems: "flex-start", borderBottom: `1px solid ${T.border}`, cursor: "pointer", transition: "background .15s" }}>
            <div style={{ width: 42, height: 42, borderRadius: 13, background: n.read ? T.s2 : T.accentSub, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, border: `1px solid ${n.read ? T.border : T.accentGlow}`, color: n.read ? T.textSub : T.accent }}>{iconMap[n.icon] || <IcBell />}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: n.read ? 500 : 700, color: n.read ? T.textSub : T.textH }}>{n.title}</div>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub }}>{n.time}</div>
              </div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: n.read ? T.textSub : T.textB, lineHeight: 1.5 }}>{n.desc}</div>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.accent, marginTop: 6, flexShrink: 0 }} />}
          </div>
        ))}
    </Simple>
  );
}
