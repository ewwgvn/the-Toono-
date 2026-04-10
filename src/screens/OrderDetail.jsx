"use client";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { toast } from "@/components/layout/Toast";
import { IcShield } from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Crd from "@/components/atoms/Crd";
import Avt from "@/components/atoms/Avt";
import Simple from "@/components/layout/Simple";

export default function OrderDetail({ nav, refresh, goBack }) {
  const order = GS.orders.find(o => o.id === GS.selectedOrderId) || GS.orders?.[0] || { title: "—", creator: "—", price: 0, status: "pending", date: "—" };
  const statusIdx = { "pending": 0, "making": 1, "shipped": 2, "delivered": 3, "done": 4 }[order.status] || 0;
  const steps = [
    { label: "Захиалга баталгаажлаа", date: order.date || "—", done: statusIdx >= 0 },
    { label: "Үйлдвэрлэл эхэллээ", date: statusIdx >= 1 ? "Хийгдэж байна" : "", done: statusIdx >= 1 },
    { label: "Хүргэлт бэлтгэж байна", date: statusIdx >= 2 ? "Бэлтгэж байна" : "", done: statusIdx >= 2 },
    { label: "Хүргэгдэж байна", date: statusIdx >= 3 ? "Хүргэгдлээ" : "", done: statusIdx >= 3 },
    { label: "Хүргэлт дууссан", date: statusIdx >= 4 ? "Дууссан" : "", done: statusIdx >= 4 },
  ];

  return (
    <Simple nav={nav} title="Захиалгын дэлгэрэнгүй" back="me" goBack={goBack}>
      <Crd style={{ padding: "14px 16px", display: "flex", gap: 14, alignItems: "center", marginBottom: 20 }}>
        <Avt size={52} color={T.accent} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 2 }}>{order.title}</div>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>{order.creator}</div>
        </div>
        <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, fontWeight: 700, color: T.accent, background: T.accentSub, padding: "4px 10px", borderRadius: 8 }}>{steps[statusIdx]?.label || "—"}</span>
      </Crd>
      {/* Order price + items */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 22, fontWeight: 800, color: T.accent }}>₮{(order.price || 0).toLocaleString()}</div>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>{order.date}</div>
      </div>
      {order.items && order.items.length > 0 && (
        <Crd style={{ padding: "12px 16px", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 600, color: T.textSub, marginBottom: 8 }}>Захиалсан бүтээл</div>
          {order.items.map((it, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < order.items.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textH }}>{it.title}{it.size ? " · " + it.size : ""}</span>
              <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textH }}>₮{(it.price || 0).toLocaleString()}{(it.qty || 1) > 1 ? " ×" + it.qty : ""}</span>
            </div>
          ))}
        </Crd>
      )}
      {/* Address */}
      {order.address && (
        <Crd style={{ padding: "12px 16px", marginBottom: 14 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 600, color: T.textSub, marginBottom: 6 }}>Хүргэлтийн хаяг</div>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textH, lineHeight: 1.6 }}>{order.address.name} · {order.address.phone}<br />{order.address.city} {order.address.district}<br />{order.address.detail}</div>
          {order.address.memo && <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub, marginTop: 4 }}>Тэмдэглэл: {order.address.memo}</div>}
        </Crd>
      )}
      {/* Tracking number */}
      {order.tracking && (
        <Crd style={{ padding: "12px 16px", marginBottom: 14, background: T.greenSub, border: `1px solid ${T.green}30` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 600, color: T.green, marginBottom: 4 }}>Хүргэлтийн дугаар</div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.textH, letterSpacing: ".05em" }}>{order.tracking}</div>
            </div>
            <button type="button" onClick={() => { navigator.clipboard?.writeText(order.tracking); toast("Дугаар хуулагдлаа", "success"); }} style={{ background: T.green + "20", border: `1px solid ${T.green}40`, borderRadius: 10, padding: "8px 14px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 600, color: T.green, cursor: "pointer" }}>Хуулах</button>
          </div>
        </Crd>
      )}
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 14 }}>Хүргэлт байдал</div>
      <Crd style={{ padding: "20px 16px", marginBottom: 18 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", gap: 16, marginBottom: i < steps.length - 1 ? 20 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: s.done ? T.accent : T.border, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {s.done && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
              </div>
              {i < steps.length - 1 && <div style={{ width: 2, height: 20, background: s.done && steps[i + 1].done ? T.accent : T.border, marginTop: 2 }} />}
            </div>
            <div style={{ flex: 1, paddingTop: 2 }}>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: s.done ? 700 : 500, color: s.done ? T.textH : T.textSub }}>{s.label}</div>
              {s.date && <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub, marginTop: 2 }}>{s.date}</div>}
            </div>
          </div>
        ))}
      </Crd>
      <div style={{ display: "flex", gap: 10 }}>
        <PBtn full secondary onClick={() => { GS.activeChatId = GS.conversations[0]?.id || null; nav("chatroom"); }}>Бүтээлчтэй зурвасаар холбогдох</PBtn>
        <PBtn full secondary onClick={() => {
          if(!window.confirm("Захиалга цуцлах уу?")) return;
          const o = GS.orders.find(o => o.id === GS.selectedOrderId);
          if(o) { o.status = "cancelled"; saveGS(); refresh(); toast("Захиалга цуцлагдлаа","info"); }
        }}>Захиалга цуцлах</PBtn>
      </div>
      {statusIdx >= 3 && (
        <div style={{ marginTop: 16 }}>
          <Crd style={{ padding: "14px 16px", background: T.redSub, border: `1px solid ${T.red}30` }}>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.red, marginBottom: 8 }}>Асуудал гарсан уу?</div>
            <div style={{ display: "flex", gap: 8 }}>
              <PBtn small danger onClick={() => nav("return-request")}>Буцаалт / Солилт</PBtn>
              <PBtn small secondary onClick={() => nav("dispute")}>Маргаан</PBtn>
            </div>
          </Crd>
        </div>
      )}
      <Crd style={{ padding: "14px 16px", marginTop: 12, background: T.accentSub, border: `1px solid ${T.accent}30` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <IcShield />
          <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 700, color: T.accent }}>Эскроу хамгаалалт</span>
        </div>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub, lineHeight: 1.6 }}>Таны төлбөр аюулгүй хадгалагдаж байна. Хүргэлт баталгаажсаны дараа бүтээлчид шилжинэ.</div>
      </Crd>
    </Simple>
  );
}
