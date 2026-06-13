"use client";

import { useState, useEffect } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady, supabase } from "@/lib/supabase";
import { IcCommission, IcMsg } from "@/components/icons";
import Simple from "@/components/layout/Simple";
import Empty from "@/components/atoms/Empty";
import Crd from "@/components/atoms/Crd";
import PBtn from "@/components/atoms/PBtn";
import Avt from "@/components/atoms/Avt";
import { toast } from "@/components/layout/Toast";

const F = "'Helvetica Neue', Arial, sans-serif";

const STEPS = ["Илгээгдсэн", "Хийгдэж байна", "Бэлтгэж байна", "Дууссан"];

const STATUS_LABEL = {
  pending:   { text: "Хүлээгдэж байна", color: T.yellow,   bg: "rgba(249,168,37,0.12)" },
  ongoing:   { text: "Явагдаж байна",    color: T.accent,   bg: T.accentSub },
  accepted:  { text: "Явагдаж байна",    color: T.accent,   bg: T.accentSub },
  delivered: { text: "Дууссан",          color: T.green,    bg: T.greenSub  },
  done:      { text: "Дууссан",          color: T.green,    bg: T.greenSub  },
  rejected:  { text: "Татгалзагдсан",    color: T.red,      bg: "rgba(211,47,47,0.1)" },
  cancelled: { text: "Цуцлагдсан",       color: T.red,      bg: "rgba(211,47,47,0.1)" },
};

export default function CommStatus({ nav, goBack, refresh }) {
  const [commissions, setCommissions] = useState(GS.myCommissions || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSupabaseReady() || !GS.user.id) return;
    setLoading(true);
    supabase
      .from("commissions")
      .select("*, seller:profiles!seller_id(id, name, photo, field)")
      .eq("buyer_id", GS.user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data?.length) {
          const mapped = data.map(c => ({
            id: c.id,
            seller_id: c.seller_id,
            sellerName: c.seller?.name || "Бүтээлч",
            sellerPhoto: c.seller?.photo || null,
            sellerField: c.seller?.field || "",
            type: c.type || "—",
            budget: c.budget || "—",
            desc: c.description || "",
            date: c.created_at ? new Date(c.created_at).toLocaleDateString("mn-MN") : "—",
            status: c.status || "pending",
            step: c.step || 0,
          }));
          setCommissions(mapped);
          GS.myCommissions = mapped;
          saveGS();
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openChat = async (c) => {
    if (!c.seller_id) { toast("Бүтээлчтэй холбогдох боломжгүй", "error"); return; }
    let convo = GS.conversations.find(cv => cv.creatorId === c.seller_id);
    if (!convo) {
      convo = { id: Date.now(), creatorId: c.seller_id, name: c.sellerName, accent: T.textH, online: false, unread: 0, msgs: [] };
      GS.conversations.unshift(convo);
    }
    if (isSupabaseReady() && GS.user.id && c.seller_id && GS.user.id !== c.seller_id) {
      const dbConvo = await DB.getOrCreateConversation(GS.user.id, c.seller_id);
      if (dbConvo) { convo.dbId = dbConvo.id; saveGS(); }
    }
    GS.activeChatId = convo.id; nav("chatroom");
  };

  return (
    <Simple nav={nav} title="Миний захиалгууд" back="me" goBack={goBack}>
      <div style={{ height: 12 }} />
      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>Уншиж байна...</div>
      ) : commissions.length === 0 ? (
        <Empty
          icon={<IcCommission />}
          title="Захиалга байхгүй"
          sub="Бүтээлчид захиалга явуулаагүй байна"
          action="Бүтээлч хайх"
          onAction={() => nav("explore")}
        />
      ) : commissions.map(c => {
        const s = STATUS_LABEL[c.status] || STATUS_LABEL.pending;
        const stepIdx = c.step || 0;
        const isActive = c.status === "ongoing" || c.status === "accepted";

        return (
          <Crd key={c.id} style={{ padding: "16px", marginBottom: 12, borderRadius: 16 }}>
            {/* 헤더 — 셀러 정보 + 상태 */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <Avt size={44} photo={c.sellerPhoto} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 2 }}>{c.sellerName}</div>
                <div style={{ fontFamily: F, fontSize: 11, color: T.textSub }}>{c.sellerField}</div>
              </div>
              <span style={{ fontFamily: F, fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: "4px 10px", borderRadius: 20, flexShrink: 0 }}>
                {s.text}
              </span>
            </div>

            {/* 의뢰 내용 */}
            <div style={{ background: T.s2, borderRadius: 10, padding: "10px 14px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: T.textH }}>{c.type}</span>
                <span style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: T.accent }}>{c.budget}</span>
              </div>
              <div style={{ fontFamily: F, fontSize: 12, color: T.textSub }}>{c.date}</div>
              {c.desc && <div style={{ fontFamily: F, fontSize: 12, color: T.textB, marginTop: 6, lineHeight: 1.5 }}>{c.desc.slice(0, 100)}{c.desc.length > 100 ? "..." : ""}</div>}
            </div>

            {/* 진행 상황 바 (ongoing일 때만) */}
            {isActive && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                  {STEPS.map((_, i) => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < stepIdx ? T.accent : T.border, transition: "background .3s" }} />
                  ))}
                </div>
                <div style={{ fontFamily: F, fontSize: 11, color: T.accent, fontWeight: 600 }}>
                  {STEPS[stepIdx - 1] || "Эхлэхийг хүлээж байна"}
                </div>
              </div>
            )}

            {/* 액션 버튼 */}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" onClick={() => openChat(c)} style={{ width: 38, height: 38, borderRadius: 10, background: T.s2, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textH, flexShrink: 0 }}>
                <IcMsg />
              </button>
              {c.status === "pending" && (
                <div style={{ flex: 1, fontFamily: F, fontSize: 12, color: T.textSub, display: "flex", alignItems: "center" }}>
                  бүтээлч хариу хүлээж байна...
                </div>
              )}
              {(c.status === "ongoing" || c.status === "accepted") && (
                <div style={{ flex: 1, fontFamily: F, fontSize: 12, color: T.green, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.green }} />
                  Хийгдэж байна
                </div>
              )}
              {(c.status === "delivered" || c.status === "done") && (
                <PBtn small full onClick={() => { GS.reviewTarget = { sellerId: c.seller_id, commissionId: c.id }; nav("review-write"); }}>Сэтгэгдэл бичих</PBtn>
              )}
              {c.status === "rejected" && (
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: F, fontSize: 12, color: T.red }}>Татгалзагдсан —</span>
                  <button type="button" onClick={() => nav("explore")} style={{ background: "none", border: "none", fontFamily: F, fontSize: 12, fontWeight: 600, color: T.accent, cursor: "pointer" }}>Өөр хайх →</button>
                </div>
              )}
            </div>
          </Crd>
        );
      })}
    </Simple>
  );
}
