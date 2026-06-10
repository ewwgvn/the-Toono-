"use client";
import { GS, resetGS, saveGS } from "@/lib/store";
import { T } from "@/theme/colors";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { toast } from "@/components/layout/Toast";
import {
  IcEdit, IcPortfolio, IcDashboard, IcDispute,
  IcOrder, IcInfo, IcShield, IcX, IcChevron, IcCommission,
} from "@/components/icons";
import Simple from "@/components/layout/Simple";

const F = "'Helvetica Neue', Arial, sans-serif";

export default function Settings({ nav, refresh }) {
  const Sec = ({ title, items }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: "#767676", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 8 }}>{title}</div>
      <div style={{ border: `1px solid ${T.borderLight}`, borderRadius: 8, overflow: "hidden" }}>
        {items.map((item, i) => (
          <div key={item.label} style={{ padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < items.length - 1 ? `1px solid ${T.borderLight}` : "none", cursor: item.action ? "pointer" : "default" }} onClick={item.action}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F7F7F7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: item.danger ? "#D32F2F" : "#111111" }}>{item.icon}</div>
              <div>
                <div style={{ fontFamily: F, fontSize: 14, fontWeight: 500, color: item.danger ? "#D32F2F" : "#111111" }}>{item.label}</div>
                {item.sub && <div style={{ fontFamily: F, fontSize: 11, color: "#767676", marginTop: 1 }}>{item.sub}</div>}
              </div>
            </div>
            {item.val ? <span style={{ fontFamily: F, fontSize: 13, color: "#767676" }}>{item.val}</span>
              : !item.noArrow && <span style={{ color: "#767676" }}><IcChevron /></span>}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Simple nav={nav} title="Тохиргоо" back="me">
      <Sec title="Бүртгэл" items={[
        { icon: <IcEdit />, label: "Профайл засах", action: () => nav("edit-profile") },
        { icon: <IcPortfolio />, label: "Портфолио", action: () => nav("portfolio") },
        { icon: <IcDashboard />, label: "Хянах самбар", action: () => nav("dashboard") },
      ]} />
      {GS.currentRole === "creator" && <Sec title="Бүтээлч" items={[
        { icon: <IcCommission />, label: "Захиалга удирдах", action: () => nav("comm-manage") },
        { icon: <IcOrder />, label: "Захиалгууд", action: () => nav("order-list") },
        { icon: <IcDispute />, label: "Маргаан", action: () => nav("dispute") },
      ]} />}
      <Sec title="Эрх" items={[
        {
          icon: <IcEdit />,
          label: GS.currentRole === "creator" ? "Худалдан авагч руу шилжих" : "Бүтээлч рүү шилжих",
          sub: `Одоогийн эрх: ${GS.currentRole === "creator" ? "Бүтээлч" : "Худалдан авагч"}`,
          action: () => {
            const next = GS.currentRole === "creator" ? "Худалдан авагч" : "Бүтээлч";
            if (!window.confirm(`${next} руу шилжих үү?`)) return;
            GS.currentRole = GS.currentRole === "creator" ? "buyer" : "creator";
            if (GS.currentRole === "creator") GS.user.commOpen = true;
            if (GS.user.id && isSupabaseReady()) {
              DB.updateProfile?.(GS.user.id, { role: GS.currentRole });
            }
            saveGS();
            refresh();
            toast(`${next} руу шилжлээ`, "success");
          },
        },
      ]} />
      <Sec title="Мэдээлэл" items={[
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
        { icon: <IcInfo />, label: "Хувилбар", val: "2.1.0", noArrow: true },
        {
          icon: <IcX />, label: "Гарах", danger: true, noArrow: true,
          action: async () => {
            if (!window.confirm("Гарах уу?")) return;
            await DB.signOut();
            resetGS();
            try { localStorage.removeItem("toono-app-state"); } catch (e) {}
            nav("onboarding");
            toast("Амжилттай гарлаа", "info");
          }
        },
      ]} />
    </Simple>
  );
}
