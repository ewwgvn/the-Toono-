"use client";
import { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { fmtP } from "@/lib/utils";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { toast } from "@/components/layout/Toast";
import {
  IcNotif, IcOrder, IcSaved, IcFollows, IcCommission, IcDashboard,
  IcFire, IcHeart, IcEmptyWorks, IcEmptyCart, IcStar, IcProfile,
  IcUpload, IcBell,
} from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Crd from "@/components/atoms/Crd";
import Avt from "@/components/atoms/Avt";
import Toono from "@/components/atoms/Toono";
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
      <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: sz.fs, fontWeight: 700, color: "#fff" }}>Star Seller</span>
    </div>
  );
}

export default function MyProfile({ nav, refresh }) {
  const [sub, setSub] = useState("works");
  const myWorks = GS.myWorks;
  const myOrders = GS.orders;
  const statusMap = { "delivered": "Хүргэгдсэн", "making": "Хийж байна", "shipped": "Явагдаж байна", "done": "Дууссан", "pending": "Хүлээгдэж байна" };
  const reviews = [];
  const sc = { "Хүргэгдсэн": T.green, "Хийж байна": T.accent, "Явагдаж байна": T.accent, "Дууссан": T.textSub };
  const stepL = ["Захиалга Зөвшөөрөх", "Ажил эхлэх", "Хүргэлтэд бэлтгэх", "Дууссан"];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "20px 20px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 24, fontWeight: 800, color: T.textH }}>Миний профайл</div>
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
        {/* Centered profile photo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 20px 0" }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: T.accentSub, border: `2px solid ${T.accentGlow}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", marginBottom: 14 }}>
            {GS.user.photo ? <img src={GS.user.photo} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Toono size={48} color={T.accent} />}
          </div>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 21, fontWeight: 800, color: T.textH, marginBottom: 3, textAlign: "center" }}>{GS.user.name || "The TOONO"}</div>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textSub, marginBottom: 12, textAlign: "center" }}>{GS.user.field || "The TOONO хэрэглэгч"}</div>
          <PBtn small secondary onClick={() => nav("edit-profile")}>Профайл засах</PBtn>
        </div>
        <div style={{ padding: "16px 20px 0" }}>
          {GS.user.commOpen && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#F7F7F7", borderRadius: 20, padding: "5px 12px", marginBottom: 14 }}>
              <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 500, color: "#666666" }}>Open for commissions</span>
            </div>
          )}
          {!GS.user.commOpen && GS.currentRole === "creator" && (
            <button type="button" onClick={() => { GS.user.commOpen = true; refresh(); toast("Захиалга идэвхжлээ", "success"); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "5px 12px", marginBottom: 14, cursor: "pointer", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 600, color: T.textSub }}>
              Захиалга идэвхжүүлэх
            </button>
          )}
          <div style={{ display: "flex", marginBottom: 16, border: `1px solid ${T.borderLight}`, borderRadius: 8 }}>
            {[[String(GS.myWorks.length), "Works"], [String(GS.following.size), "Following"]].map((s, i) => (
              <div key={s[1]} onClick={() => nav("follows")} style={{ flex: 1, textAlign: "center", padding: "12px 0", borderRight: i < 1 ? `1px solid ${T.borderLight}` : "none", cursor: "pointer" }}>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 16, fontWeight: 700, color: "#111111" }}>{s[0]}</div>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: "#999999", marginTop: 2 }}>{s[1]}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {[["Захиалга", "order-list", <IcOrder />, T.accent], ["Хадгалсан", "saved", <IcSaved />, T.yellow], ["Дагагч", "follows", <IcFollows />, T.green], ["Удирдах", "comm-manage", <IcCommission />, T.accent], ["Самбар", "dashboard", <IcDashboard />, "#666666"], ["Фийд", "feed", <IcFire />, "#F0A030"]].map(item => (
              <Crd key={item[0]} onClick={() => nav(item[1])} style={{ padding: "12px 8px", textAlign: "center", cursor: "pointer" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: item[3] + "18", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", color: item[3] }}>{item[2]}</div>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, fontWeight: 600, color: T.textB }}>{item[0]}</div>
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
                    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.accent }}>₮{o.price.toLocaleString()}</div>
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
                  <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.accent }}>₮{c.price.toLocaleString()}</div>
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
