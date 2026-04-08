"use client";
import { useState } from "react";
import { T, setTheme } from "@/theme/colors";
import { GS, resetGS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { toast } from "@/components/layout/Toast";
import {
  IcEdit, IcKey, IcCommission, IcPortfolio, IcDashboard, IcDispute,
  IcGift, IcOrder, IcBell, IcNotif, IcGlobe, IcSettings, IcInfo,
  IcShield, IcX, IcChevron,
} from "@/components/icons";
import Crd from "@/components/atoms/Crd";
import Simple from "@/components/layout/Simple";

export default function Settings({ nav, goBack, refresh }) {
  const [c1, setC1] = useState(true);
  const [c2, setC2] = useState(true);
  const [c3, setC3] = useState(false);

  const Tog = ({ on, set }) => (
    <button onClick={() => set(!on)} style={{ width: 44, height: 26, borderRadius: 13, background: on ? T.accent : T.border, position: "relative", border: "none", cursor: "pointer", transition: "background .2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s" }} />
    </button>
  );

  const Sec = ({ title, items }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: "system-ui", fontSize: 11, fontWeight: 600, color: T.textSub, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 8 }}>{title}</div>
      <Crd style={{ borderRadius: 16, overflow: "hidden" }}>
        {items.map((item, i) => (
          <div key={item.label} style={{ padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : "none", cursor: item.action || item.tog !== undefined ? "pointer" : "default" }} onClick={item.action}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: item.bg || T.s2, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: item.danger ? T.red : T.textB }}>{item.icon}</div>
              <div>
                <div style={{ fontFamily: "system-ui", fontSize: 14, fontWeight: 600, color: item.danger ? T.red : T.textH }}>{item.label}</div>
                {item.sub && <div style={{ fontFamily: "system-ui", fontSize: 11, color: T.textSub, marginTop: 1 }}>{item.sub}</div>}
              </div>
            </div>
            {item.tog !== undefined ? <Tog on={item.tog} set={item.set} />
              : item.val ? <span style={{ fontFamily: "system-ui", fontSize: 13, color: T.textSub }}>{item.val}</span>
                : !item.noArrow && <span style={{ color: T.textSub }}><IcChevron /></span>}
          </div>
        ))}
      </Crd>
    </div>
  );

  return (
    <Simple nav={nav} title="Тохиргоо" back="me">
      <Sec title="Бүртгэл" items={[
        { icon: <IcEdit />, label: "Профайл Засах", action: () => nav("edit-profile"), bg: T.accentSub },
        { icon: <IcKey />, label: "Нууц үг солих", bg: T.accentSub },
        { icon: <IcCommission />, label: "Тооцооны данс", sub: "Тохируулах", bg: "rgba(58,170,106,0.15)" },
        { icon: <IcPortfolio />, label: "Бүтээлийн архив", action: () => nav("portfolio"), bg: T.accentSub },
        { icon: <IcDashboard />, label: "Хяналтын самбар", action: () => nav("dashboard"), bg: T.accentSub },
        { icon: <IcCommission />, label: "Захиалга удирдах", action: () => nav("comm-manage"), bg: T.accentSub },
        { icon: <IcDispute />, label: "Гомдол, буцаалт", action: () => nav("dispute"), bg: "rgba(224,80,80,0.1)" },
        { icon: <IcGift />, label: "Найзаа урих", action: () => nav("referral"), bg: "rgba(58,170,106,0.15)" },
      ]} />
      <Sec title="Бүтээлч" items={[
        { icon: <IcCommission />, label: "Захиалга Зөвшөөрөх", tog: c1, set: setC1 },
        { icon: "⏱", label: "Үндсэн хүргэлтийн хугацаа", val: "Тохируулах" },
        { icon: <IcOrder />, label: "Хүргэлтийн бүс", sub: "Дотоод · Гадаад" },
      ]} />
      <Sec title="Мэдэгдэл" items={[
        { icon: <IcBell />, label: "Түлхэх мэдэгдэл", tog: c2, set: setC2 },
        { icon: <IcNotif />, label: "Имэйл Мэдэгдэл", tog: c3, set: setC3 },
      ]} />
      <Sec title="Програм" items={[
        { icon: <IcGlobe />, label: "Хэл", val: "Монгол" },
        { icon: <IcSettings />, label: "Загвар", val: "Харанхуй" },
        { icon: <IcInfo />, label: "Програмын хувилбар", val: "2.0.0", noArrow: true },
      ]} />
      <Sec title="Бусад" items={[
        {
          icon: T.isDark
            ? <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="5" stroke="currentColor" strokeWidth="1.5" /><path d="M10 2V4M10 16V18M2 10H4M16 10H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            : <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M17 11A7 7 0 1 1 9 3C9.5 5.5 11 8 14 9.5C15.5 10.2 16.5 10.7 17 11Z" stroke="currentColor" strokeWidth="1.5" /></svg>,
          label: T.isDark ? "Цайвар горим" : "Бараан горим",
          action: () => { setTheme(T.isDark ? "light" : "dark"); refresh(); toast(T.isDark ? "Бараан горим" : "Цайвар горим", "success"); }
        },
        { icon: <IcInfo />, label: "Үйлчилгээний нөхцөл", action: () => nav("terms") },
        { icon: <IcShield />, label: "Нууцлалын бодлого", action: () => nav("privacy") },
        {
          icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="6" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" /><path d="M7 6V4C7 2.9 7.9 2 9 2H11C12.1 2 13 2.9 13 4V6" stroke="currentColor" strokeWidth="1.5" /></svg>,
          label: "Миний мэдээлэл татах",
          action: () => {
            const data = JSON.stringify({ user: GS.user, works: GS.myWorks, orders: GS.orders }, null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = "thetoono-data.json"; a.click();
            URL.revokeObjectURL(url);
            toast("Мэдээлэл татагдлаа", "success");
          }
        },
        { icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" /><path d="M10 6V10.5L13 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>, label: "Хувилбар", val: "v1.0.0", noArrow: true },
        {
          icon: <IcX />, label: "Гарах", danger: true, noArrow: true,
          action: async () => {
            if (!window.confirm("Гарах уу?")) return;
            await DB.signOut();
            resetGS();
            try { window.storage.delete("toono-app-state"); } catch (e) { }
            nav("onboarding");
            toast("Амжилттай гарлаа", "info");
          }
        },
      ]} />
    </Simple>
  );
}
