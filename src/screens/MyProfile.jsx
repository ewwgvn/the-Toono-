"use client";
import { useState } from "react";
import { T, getTheme, ULIGER_DECOR as D, ULIGER_FONT_DISPLAY } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { fmtP } from "@/lib/utils";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { toast } from "@/components/layout/Toast";
import {
  IcNotif, IcOrder, IcSaved, IcFollows, IcCommission, IcDashboard,
  IcEmptyWorks, IcEmptyCart, IcStar, IcStats, IcChevron, IcPortfolio,
} from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Crd from "@/components/atoms/Crd";
import Toono from "@/components/atoms/Toono";
import Avt from "@/components/atoms/Avt";
import Empty from "@/components/atoms/Empty";

// ── StarSellerBadge (inline) ──
function StarSellerBadge({ size = "sm" }) {
  const met = GS.trustMetrics;
  const isStarSeller = met.responseRate >= 95 && met.onTimeRate >= 95 && met.avgRating >= 4.8;
  if (!isStarSeller) return null;
  const sz = size === "sm" ? { fs: 10, p: "3px 8px", gap: 4 } : { fs: 12, p: "5px 12px", gap: 6 };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: sz.gap, background: "linear-gradient(135deg,#E8960C,#F0C040)", borderRadius: 20, padding: sz.p }}>
      <svg width={sz.fs} height={sz.fs} viewBox="0 0 12 12" fill="#fff"><path d="M6 1L7.4 4.2H10.8L8 6.4L9.2 9.6L6 7.6L2.8 9.6L4 6.4L1.2 4.2H4.6Z" /></svg>
      <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: sz.fs, fontWeight: 700, color: "#fff" }}>Шилдэг худалдагч</span>
    </div>
  );
}

export default function MyProfile({ nav, refresh }) {
  const isUliger = getTheme() === "uliger";
  const [sub, setSub] = useState("works");
  const myWorks = GS.myWorks;
  const myOrders = GS.orders;
  const statusMap = { "delivered": "Хүргэгдсэн", "making": "Хийж байна", "shipped": "Явагдаж байна", "done": "Дууссан", "pending": "Хүлээгдэж байна", "cancelled": "Цуцлагдсан", "return_requested": "Буцаалт хүссэн" };
  const reviews = GS.orders.filter(o => o.reviewed);
  const sc = { "Хүргэгдсэн": T.green, "Хийж байна": T.accent, "Явагдаж байна": T.accent, "Дууссан": T.textSub, "Цуцлагдсан": T.red, "Буцаалт хүссэн": T.red };
  const stepL = ["Захиалга Зөвшөөрөх", "Ажил эхлэх", "Хүргэлтэд бэлтгэх", "Дууссан"];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: isUliger ? ULIGER_FONT_DISPLAY : "'Helvetica Neue', Arial, sans-serif", fontSize: 24, fontWeight: isUliger ? 700 : 800, color: T.textH }}>Миний профайл</div>
          <StarSellerBadge />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {GS.unreadNotif > 0 && (
            <button type="button" onClick={() => nav("notifications")} style={{ width: 38, height: 38, borderRadius: "50%", background: T.accentSub, border: `1px solid ${T.accentGlow}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.accent }}>
              <IcNotif />
            </button>
          )}
          <button type="button" onClick={() => nav("settings")} style={{ width: 38, height: 38, borderRadius: "50%", background: T.s1, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textSub }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" /><path d="M10 2V4M10 16V18M2 10H4M16 10H18M4.6 4.6L6 6M14 14L15.4 15.4M4.6 15.4L6 14M14 6L15.4 4.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        <div style={{ padding: "20px 20px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ marginBottom: 12 }}><Avt size={88} photo={GS.user.photo} /></div>
          <div style={{ fontFamily: isUliger ? ULIGER_FONT_DISPLAY : "'Helvetica Neue', Arial, sans-serif", fontSize: 22, fontWeight: isUliger ? 700 : 800, color: T.textH, marginBottom: 4, textAlign: "center", letterSpacing: "-0.02em" }}>{GS.user.name || "Үлгэр"}</div>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: "#888888", marginBottom: 14, textAlign: "center" }}>{GS.user.field || "Үлгэр хэрэглэгч"}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <PBtn small secondary onClick={() => nav("edit-profile")}>Профайл засах</PBtn>
            {GS.currentRole === "creator" && <PBtn small onClick={() => nav("upload")}>Бүтээл нэмэх</PBtn>}
          </div>
        </div>
        <div style={{ padding: "16px 20px 0" }}>

          {/* ── 통계 바 ── */}
          <div style={{ display: "flex", marginBottom: 16, border: `1px solid ${T.borderLight}`, borderRadius: 12, background: "#FAFAFA", overflow: "hidden" }}>
            {[[String(GS.myWorks.length), "Бүтээл", null], [String(GS.user.followers || 0), "Дагагч", () => { GS.viewingFollowsUserId = GS.user.id; GS.viewingFollowsTab = "followers"; nav("follows"); }], [String(GS.following.size), "Дагаж байна", () => { GS.viewingFollowsUserId = GS.user.id; GS.viewingFollowsTab = "following"; nav("follows"); }]].map((s, i) => (
              <div key={s[1]} onClick={s[2] || undefined} style={{ flex: 1, textAlign: "center", padding: "13px 0", borderRight: i < 2 ? `1px solid ${T.borderLight}` : "none", cursor: s[2] ? "pointer" : "default" }}>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 18, fontWeight: 800, color: T.textH }}>{s[0]}</div>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub, marginTop: 2 }}>{s[1]}</div>
              </div>
            ))}
          </div>

          {/* ── 역할별 핵심 액션 카드 (가장 눈에 띄는 위치) ── */}
          {GS.currentRole === "creator" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {/* 커미션 관리 */}
              <Crd onClick={() => nav("comm-manage")} style={{ padding: "16px", cursor: "pointer", borderRadius: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><IcCommission /></div>
                  <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH }}>Захиалга</div>
                </div>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 20, fontWeight: 800, color: T.textH }}>{GS.receivedCommissions?.filter(c => c.status === "pending").length || 0}</div>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub }}>хүлээгдэж байна</div>
              </Crd>
              {/* 판매 대시보드 */}
              <Crd onClick={() => nav("dashboard")} style={{ padding: "16px", cursor: "pointer", borderRadius: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: T.green, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}><IcStats /></div>
                  <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH }}>Борлуулалт</div>
                </div>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 20, fontWeight: 800, color: T.green }}>₮{(GS.user.revenue || "₮0").replace("₮", "")}</div>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub }}>нийт орлого</div>
              </Crd>
            </div>
          ) : (
            /* 바이어 역할 — 주문 현황 */
            <div style={{ marginBottom: 16 }}>
              <Crd onClick={() => nav("order-list")} style={{ padding: "16px", cursor: "pointer", borderRadius: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><IcOrder /></div>
                    <div>
                      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.textH }}>Миний захиалгууд</div>
                      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>
                        {GS.orders.filter(o => o.status === "pending" || o.status === "making" || o.status === "shipped").length > 0
                          ? `${GS.orders.filter(o => ["pending","making","shipped"].includes(o.status)).length} явагдаж байна`
                          : `Нийт ${GS.orders.length} захиалга`}
                      </div>
                    </div>
                  </div>
                  <IcChevron />
                </div>
              </Crd>
            </div>
          )}

          {/* ── 커미션 버튼 (바이어) ── */}
          {GS.currentRole !== "creator" && (
            <div style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              {/* 내 의뢰 현황 */}
              {GS.myCommissions?.length > 0 && (
                <Crd onClick={() => nav("comm-status")} style={{ padding: "14px 16px", cursor: "pointer", borderRadius: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><IcCommission /></div>
                      <div>
                        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.textH }}>Миний захиалгууд</div>
                        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>
                          {GS.myCommissions.filter(c => c.status === "pending").length > 0
                            ? `${GS.myCommissions.filter(c => c.status === "pending").length} хүлээгдэж байна`
                            : `Нийт ${GS.myCommissions.length} захиалга`}
                        </div>
                      </div>
                    </div>
                    <IcChevron />
                  </div>
                </Crd>
              )}
              {/* 새 의뢰 */}
              <Crd onClick={() => nav("explore")} style={{ padding: "14px 16px", cursor: "pointer", borderRadius: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: T.accentSub, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent }}><IcCommission /></div>
                    <div>
                      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.textH }}>Захиалга өгөх</div>
                      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>Бүтээлч хайж захиалга илгээх</div>
                    </div>
                  </div>
                  <IcChevron />
                </div>
              </Crd>
            </div>
          )}

          {/* ── 커미션 열림 상태 토글 (크리에이터) ── */}
          {GS.currentRole === "creator" && (
            <div style={{ marginBottom: 16 }}>
              <button type="button" onClick={() => { GS.user.commOpen = !GS.user.commOpen; saveGS(); refresh(); toast(GS.user.commOpen ? "Захиалга нээлтэй болсон" : "Захиалга хаалттай болсон", "success"); }} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: GS.user.commOpen ? "#F0FAF0" : T.s2, border: `1.5px solid ${GS.user.commOpen ? T.green + "60" : T.border}`, borderRadius: 12, padding: "12px 16px", cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: GS.user.commOpen ? T.green : "#BBBBBB" }} />
                  <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 600, color: GS.user.commOpen ? T.green : T.textSub }}>
                    {GS.user.commOpen ? "Захиалга авч байна" : "Захиалга хаалттай"}
                  </span>
                </div>
                <div style={{ width: 40, height: 22, borderRadius: 11, background: GS.user.commOpen ? T.green : T.textDim, position: "relative", transition: "background .2s" }}>
                  <div style={{ position: "absolute", top: 3, left: GS.user.commOpen ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
              </button>
            </div>
          )}

          {/* ── 보조 바로가기 ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {(GS.currentRole === "creator"
              ? [["Захиалга", "order-list", <IcOrder key="o" />], ["Хадгалсан", "saved", <IcSaved key="s" />], ["Дагагч", "follows", <IcFollows key="f" />]]
              : [["Хадгалсан", "saved", <IcSaved key="s" />], ["Дагагч", "follows", <IcFollows key="f" />], ["Портфолио", "portfolio", <IcPortfolio key="p" />]]
            ).map(([label, route, icon]) => (
              <Crd key={label} onClick={() => nav(route)} style={{ padding: "12px 8px", textAlign: "center", cursor: "pointer", borderRadius: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: T.s2, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 5px", color: T.textH }}>{icon}</div>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, fontWeight: 600, color: T.textB }}>{label}</div>
              </Crd>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
          {[["works", "Бүтээл" + (GS.myWorks.length > 0 ? " " + GS.myWorks.length : "")], ["orders", "Авалт" + (GS.orders.length > 0 ? " " + GS.orders.length : "")], ["commissions", "Захиалга" + (GS.myCommissions.length > 0 ? " " + GS.myCommissions.length : "")], ["reviews", "Үнэлгээ" + (reviews.length > 0 ? " " + reviews.length : "")]].map(t => (
            <button type="button" key={t[0]} onClick={() => setSub(t[0])} style={{ flex: 1, padding: "12px 0", background: "none", border: "none", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: sub === t[0] ? 700 : 500, color: sub === t[0] ? T.accent : T.textSub, borderBottom: `2px solid ${sub === t[0] ? T.accent : "transparent"}`, cursor: "pointer" }}>{t[1]}</button>
          ))}
        </div>
        {sub === "works" && (
          <div style={{ padding: "14px 20px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textSub }}>Нийт {myWorks.length} ш</div>
              <div style={{ display: "flex", gap: 6 }}><PBtn small secondary onClick={() => nav("portfolio")}>Архив</PBtn><PBtn small onClick={() => nav("upload")}>+ Нэмэх</PBtn></div>
            </div>
            {myWorks.length === 0
              ? <Empty icon={<IcEmptyWorks />} title="Бүтээл байхгүй" sub="Эхний бүтээлээ байршуулаарай" action="Бүтээл нэмэх" onAction={() => nav("upload")} />
              : myWorks.map(w => (
                <Crd key={w.id} style={{ marginBottom: 10 }}>
                  <div onClick={() => nav("work", { workId: w.id })} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: w.accent + "18", border: `1px solid ${w.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                      {w.images?.[0] ? <img src={w.images[0]} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Toono size={30} color={w.accent || T.accent} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 3 }}>{w.title}</div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>Үзэлт {typeof w.views === "number" ? w.views.toLocaleString() : w.views}</span>
                        <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.green }}>Борлуулалт {w.sales || 0} ш</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.accent }}>{fmtP(w)}</div>
                      {w.badge && <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 9, fontWeight: 600, color: "#fff", background: T.accent, padding: "2px 7px", borderRadius: 6, marginTop: 4, display: "inline-block" }}>{w.badge}</div>}
                    </div>
                  </div>
                  <div style={{ borderTop: `1px solid ${T.border}`, display: "flex" }}>
                    {["Засах", "Статистик", "Устгах"].map((btn, i) => (
                      <button type="button" key={btn} onClick={() => {
                        if (btn === "Статистик") nav("dashboard");
                        else if (btn === "Засах") { GS.editingWorkId = w.id; nav("upload"); }
                        else {
                          if (!window.confirm("Энэ бүтээлийг устгах уу?")) return;
                          GS.myWorks = GS.myWorks.filter(x => x.id !== w.id);
                          GS.user.works = GS.myWorks.length;
                          saveGS();
                          if (isSupabaseReady() && w.id) DB.deleteWork?.(w.id);
                          refresh();
                          toast("Бүтээл устгагдлаа", "info");
                        }
                      }} style={{ flex: 1, padding: "9px 0", background: "none", border: "none", borderRight: i < 2 ? `1px solid ${T.border}` : "none", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 500, color: btn === "Устгах" ? T.red : T.textSub, cursor: "pointer" }}>{btn}</button>
                    ))}
                  </div>
                </Crd>
              ))}
          </div>
        )}
        {sub === "orders" && (
          <div style={{ padding: "14px 20px 0" }}>
            {myOrders.length > 0 && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                <button type="button" onClick={() => nav("order-list")} style={{ background: "none", border: "none", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.accent, cursor: "pointer" }}>Бүгд харах →</button>
              </div>
            )}
            {myOrders.length === 0
              ? <Empty icon={<IcEmptyCart />} title="Худалдан авалт байхгүй" sub="Дуртай бүтээлийг нээж олоорой" action="Бүтээл хайх" onAction={() => nav("explore")} />
              : myOrders.map(o => (
                <Crd key={o.id} onClick={() => { GS.selectedOrderId = o.id; nav("order-detail"); }} style={{ padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 3 }}>{o.title}</div>
                      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>{o.creator} · {o.date}</div>
                    </div>
                    <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, fontWeight: 700, color: sc[statusMap[o.status] || o.status] || T.textSub, background: (sc[statusMap[o.status] || o.status] || T.textSub) + "18", padding: "3px 9px", borderRadius: 8 }}>{statusMap[o.status] || o.status}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.accent }}>₮{(o.price || 0).toLocaleString()}</div>
                    {(o.status === "Хүргэгдсэн" || o.status === "delivered" || o.canReview) && <PBtn small secondary onClick={e => { e.stopPropagation(); nav("review-write"); }}>Үнэлгээ бичих</PBtn>}
                  </div>
                </Crd>
              ))}
          </div>
        )}
        {sub === "commissions" && (
          <div style={{ padding: "14px 20px 0" }}>
            {GS.myCommissions.map(c => (
              <Crd key={c.id} style={{ padding: "16px", marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 3 }}>{c.title}</div>
                    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>{c.creator} · {c.date}</div>
                  </div>
                  <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, fontWeight: 700, color: T.accent, background: T.accentSub, padding: "3px 9px", borderRadius: 8 }}>{c.status}</span>
                </div>
                <div style={{ display: "flex", gap: 3, marginBottom: 10 }}>
                  {stepL.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < c.step ? T.accent : T.border }} />)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.accent }}>₮{(c.price || 0).toLocaleString()}</div>
                  <PBtn small secondary onClick={() => { GS.activeChatId = GS.conversations[0]?.id || null; nav("chatroom"); }}>Зурвас үзэх</PBtn>
                </div>
              </Crd>
            ))}
          </div>
        )}
        {sub === "reviews" && (
          <div style={{ padding: "14px 20px 0" }}>
            {reviews.length === 0
              ? <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 40, marginBottom: 12 }}>☆</div>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 6 }}>Үнэлгээ байхгүй</div>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textSub, lineHeight: 1.6 }}>Худалдан авагчдын үнэлгээ энд харагдана</div>
              </div>
              : <>
                <Crd style={{ padding: "16px", marginBottom: 14, display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 40, fontWeight: 800, color: T.yellow }}>{(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}</div>
                    <IcStar n={5} />
                    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub, marginTop: 4 }}>{reviews.length} Үнэлгээ</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5, 4, 3].map(n => { const cnt = reviews.filter(r => r.rating === n).length; return <div key={n} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub, width: 8 }}>{n}</span>
                      <div style={{ flex: 1, height: 5, borderRadius: 3, background: T.border, overflow: "hidden" }}><div style={{ height: "100%", background: T.yellow, width: (cnt / reviews.length * 100) + "%" }} /></div>
                      <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub, width: 12 }}>{cnt}</span>
                    </div>; })}
                  </div>
                </Crd>
                {reviews.map(r => (
                  <Crd key={r.id} style={{ padding: "14px 16px", marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: T.accentSub, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 700, color: T.accent }}>{r.buyer[0]}</div>
                        <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textH }}>{r.buyer}</span>
                      </div>
                      <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub }}>{r.date}</span>
                    </div>
                    <IcStar n={r.rating} />
                    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textB, lineHeight: 1.6, marginTop: 8 }}>{r.text}</div>
                  </Crd>
                ))}
              </>}
          </div>
        )}
        <div style={{ height: 30 }} />
      </div>
    </div>
  );
}
