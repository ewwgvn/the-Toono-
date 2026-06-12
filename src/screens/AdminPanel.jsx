"use client";

import { useState, useEffect, useCallback } from "react";
import { T } from "@/theme/colors";
import { GS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { toast } from "@/components/layout/Toast";
import { IcBack, IcShield, IcOrder, IcProfile, IcStar } from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Crd from "@/components/atoms/Crd";
import Avt from "@/components/atoms/Avt";
import Simple from "@/components/layout/Simple";

const F = "'Helvetica Neue', Arial, sans-serif";

const TABS = [
  { id: "disputes", label: "분쟁" },
  { id: "reports",  label: "신고" },
  { id: "payouts",  label: "정산 큐" },
  { id: "users",    label: "유저" },
  { id: "works",    label: "작품" },
];

const STATUS_COLOR = {
  pending: T.yellow, open: T.yellow,
  resolved: T.green, closed: T.green,
  rejected: T.red, refunded: T.red,
};

function StatusPill({ s }) {
  const label = { pending: "대기", open: "오픈", resolved: "해결됨", closed: "종료", rejected: "거절", refunded: "환불" }[s] || s;
  return (
    <span style={{ fontFamily: F, fontSize: 10, fontWeight: 700, color: STATUS_COLOR[s] || T.textSub, background: (STATUS_COLOR[s] || T.textSub) + "18", padding: "3px 9px", borderRadius: 6 }}>
      {label}
    </span>
  );
}

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 320, width: "100%" }}>
        <div style={{ fontFamily: F, fontSize: 15, fontWeight: 600, color: T.textH, marginBottom: 20, lineHeight: 1.5 }}>{message}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <PBtn full secondary onClick={onCancel}>취소</PBtn>
          <PBtn full onClick={onConfirm}>확인</PBtn>
        </div>
      </div>
    </div>
  );
}

// ── Disputes tab ───────────────────────────────────────────────
function DisputesTab() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState({});
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    DB.adminGetDisputes().then(d => { setDisputes(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const resolve = async (id, action) => {
    await DB.adminResolveDispute(id, action, note[id] || "");
    setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: action } : d));

    // If releasing escrow, also update the order
    if (action === "resolved") {
      const dispute = disputes.find(d => d.id === id);
      if (dispute?.order_id && isSupabaseReady()) {
        await DB.updateOrder(dispute.order_id, { status: "done", escrow_status: "released", payout_status: "scheduled" }).catch(() => {});
      }
    }
    if (action === "refunded") {
      const dispute = disputes.find(d => d.id === id);
      if (dispute?.order_id && isSupabaseReady()) {
        await DB.updateOrder(dispute.order_id, { status: "cancelled", escrow_status: "refunded", payout_status: "cancelled" }).catch(() => {});
      }
    }
    toast(action === "resolved" ? "에스크로 해제됨 → 창작자 지급 예약" : action === "refunded" ? "환불 처리됨" : "처리됨", "success");
    setConfirm(null);
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>로딩 중...</div>;
  if (!disputes.length) return <div style={{ padding: 40, textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>분쟁 없음</div>;

  return (
    <>
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} />}
      {disputes.map(d => (
        <Crd key={d.id} style={{ padding: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: T.textH, marginBottom: 3 }}>
                {d.profiles?.name || "알 수 없음"} · ₮{(d.orders?.total_price || 0).toLocaleString()}
              </div>
              <div style={{ fontFamily: F, fontSize: 11, color: T.textSub }}>
                {new Date(d.created_at).toLocaleDateString("mn-MN")} · 주문 {d.order_id?.slice(0, 8)}
              </div>
            </div>
            <StatusPill s={d.status} />
          </div>
          <div style={{ fontFamily: F, fontSize: 13, color: T.textB, lineHeight: 1.6, background: T.s2, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
            {d.reason || d.description || "—"}
          </div>
          {d.status === "open" || d.status === "pending" ? (
            <>
              <input
                value={note[d.id] || ""}
                onChange={e => setNote(p => ({ ...p, [d.id]: e.target.value }))}
                placeholder="관리자 메모 (선택)"
                style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 12px", fontFamily: F, fontSize: 12, color: T.textH, outline: "none", boxSizing: "border-box", marginBottom: 8 }}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <PBtn full secondary danger onClick={() => setConfirm({ message: "구매자에게 환불 처리할까요?", onConfirm: () => resolve(d.id, "refunded") })}>환불</PBtn>
                <PBtn full onClick={() => setConfirm({ message: "에스크로를 해제하고 창작자에게 지급할까요?", onConfirm: () => resolve(d.id, "resolved") })}>창작자 지급</PBtn>
              </div>
            </>
          ) : (
            d.admin_note && <div style={{ fontFamily: F, fontSize: 11, color: T.textSub }}>메모: {d.admin_note}</div>
          )}
        </Crd>
      ))}
    </>
  );
}

// ── Reports tab ────────────────────────────────────────────────
function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DB.adminGetReports().then(r => { setReports(r); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const act = async (id, action) => {
    await DB.adminResolveReport(id, action);
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    toast("처리됨", "success");
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>로딩 중...</div>;
  if (!reports.length) return <div style={{ padding: 40, textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>신고 없음</div>;

  return reports.map(r => (
    <Crd key={r.id} style={{ padding: 16, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: T.textH, marginBottom: 2 }}>{r.type || "신고"} · {r.profiles?.name}</div>
          <div style={{ fontFamily: F, fontSize: 11, color: T.textSub }}>{r.target_type}: {r.target_id?.slice(0, 8)}</div>
        </div>
        <StatusPill s={r.status || "pending"} />
      </div>
      <div style={{ fontFamily: F, fontSize: 13, color: T.textB, background: T.s2, borderRadius: 8, padding: "8px 12px", marginBottom: 10, lineHeight: 1.5 }}>{r.reason || "—"}</div>
      {(!r.status || r.status === "pending" || r.status === "open") && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <PBtn small secondary onClick={() => act(r.id, "closed")}>무시</PBtn>
          <PBtn small secondary onClick={async () => { if (r.target_type === "user") await DB.adminSuspendUser(r.target_id, true); else await DB.adminSuspendWork(r.target_id, true); act(r.id, "resolved"); }}>정지</PBtn>
        </div>
      )}
    </Crd>
  ));
}

// ── Payouts tab ────────────────────────────────────────────────
function PayoutsTab() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/payouts", { headers: { authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_SECRET || ""}` } })
      .then(r => r.json())
      .then(j => { setPayouts(j.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const approve = async (id) => {
    const res = await fetch(`/api/admin/payouts/${id}/approve`, { method: "POST" });
    const json = await res.json();
    if (res.ok) { setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: "COMPLETED" } : p)); toast("지급 완료", "success"); }
    else toast(json?.error || "실패", "error");
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>로딩 중...</div>;
  if (!payouts.length) return <div style={{ padding: 40, textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>대기 중인 정산 없음</div>;

  return payouts.map(p => (
    <Crd key={p.id} style={{ padding: 16, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: T.textH, marginBottom: 2 }}>창작자 {p.creator_id?.slice(0, 8)}</div>
          <div style={{ fontFamily: F, fontSize: 11, color: T.textSub }}>{p.bank_code} · {p.bank_account_no}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: F, fontSize: 16, fontWeight: 800, color: T.accent }}>₮{Number(p.amount || 0).toLocaleString()}</div>
          <StatusPill s={p.status?.toLowerCase() || "pending"} />
        </div>
      </div>
      {p.status === "PENDING" && <PBtn full onClick={() => approve(p.id)}>지급 승인</PBtn>}
    </Crd>
  ));
}

// ── Users tab ──────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    DB.adminGetAllUsers().then(u => { setUsers(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = query ? users.filter(u => u.name?.toLowerCase().includes(query.toLowerCase())) : users;

  const toggle = async (u, field) => {
    const newVal = !u[field];
    if (field === "suspended") await DB.adminSuspendUser(u.id, newVal);
    if (field === "verified") await DB.adminSetVerified(u.id, newVal);
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, [field]: newVal } : x));
    toast(newVal ? `${field} 적용됨` : `${field} 해제됨`, "success");
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>로딩 중...</div>;

  return (
    <>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="이름 검색..."
        style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontFamily: F, fontSize: 13, color: T.textH, outline: "none", boxSizing: "border-box", marginBottom: 12 }}
      />
      {filtered.map(u => (
        <Crd key={u.id} style={{ padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <Avt size={36} photo={u.photo} color={T.accent} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: T.textH }}>{u.name || "—"}</span>
              {u.verified && <span style={{ fontSize: 10, color: T.accent, fontWeight: 700 }}>✓인증</span>}
              {u.suspended && <span style={{ fontSize: 10, color: T.red, fontWeight: 700 }}>정지</span>}
            </div>
            <div style={{ fontFamily: F, fontSize: 11, color: T.textSub }}>{u.role} · {u.field || "—"}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => toggle(u, "verified")} style={{ background: u.verified ? T.accent : T.s2, border: `1px solid ${u.verified ? T.accent : T.border}`, borderRadius: 8, padding: "5px 10px", fontFamily: F, fontSize: 11, fontWeight: 600, color: u.verified ? "#fff" : T.textSub, cursor: "pointer" }}>
              {u.verified ? "인증됨" : "인증"}
            </button>
            <button onClick={() => toggle(u, "suspended")} style={{ background: u.suspended ? T.red + "18" : T.s2, border: `1px solid ${u.suspended ? T.red : T.border}`, borderRadius: 8, padding: "5px 10px", fontFamily: F, fontSize: 11, fontWeight: 600, color: u.suspended ? T.red : T.textSub, cursor: "pointer" }}>
              {u.suspended ? "정지됨" : "정지"}
            </button>
          </div>
        </Crd>
      ))}
    </>
  );
}

// ── Works tab ──────────────────────────────────────────────────
function WorksTab() {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    DB.adminGetAllWorks().then(w => { setWorks(w); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = query ? works.filter(w => w.title?.toLowerCase().includes(query.toLowerCase())) : works;

  const toggleSuspend = async (w) => {
    const newVal = !w.suspended;
    await DB.adminSuspendWork(w.id, newVal);
    setWorks(prev => prev.map(x => x.id === w.id ? { ...x, suspended: newVal } : x));
    toast(newVal ? "작품 정지됨" : "정지 해제됨", "success");
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>로딩 중...</div>;

  return (
    <>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="제목 검색..."
        style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", fontFamily: F, fontSize: 13, color: T.textH, outline: "none", boxSizing: "border-box", marginBottom: 12 }}
      />
      {filtered.map(w => (
        <Crd key={w.id} style={{ padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: T.textH, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</span>
              {w.suspended && <span style={{ fontSize: 10, color: T.red, fontWeight: 700, flexShrink: 0 }}>정지</span>}
            </div>
            <div style={{ fontFamily: F, fontSize: 11, color: T.textSub }}>{w.profiles?.name || "—"} · ₮{(w.price || 0).toLocaleString()}</div>
          </div>
          <button onClick={() => toggleSuspend(w)} style={{ background: w.suspended ? T.red + "18" : T.s2, border: `1px solid ${w.suspended ? T.red : T.border}`, borderRadius: 8, padding: "5px 12px", fontFamily: F, fontSize: 11, fontWeight: 600, color: w.suspended ? T.red : T.textSub, cursor: "pointer", flexShrink: 0 }}>
            {w.suspended ? "정지됨" : "정지"}
          </button>
        </Crd>
      ))}
    </>
  );
}

// ── Main ────────────────────────────────────────────────────────
export default function AdminPanel({ nav, goBack }) {
  const [tab, setTab] = useState("disputes");

  if (GS.user.role !== "admin") {
    return (
      <Simple nav={nav} title="접근 불가" back="home" goBack={goBack}>
        <div style={{ padding: "60px 20px", textAlign: "center", fontFamily: F, fontSize: 14, color: T.textSub }}>관리자 권한이 필요합니다.</div>
      </Simple>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <button type="button" onClick={() => goBack ? goBack() : nav("me")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IcShield />
          <span style={{ fontFamily: F, fontSize: 20, fontWeight: 800, color: T.textH }}>Admin</span>
        </div>
      </div>
      <div style={{ display: "flex", overflowX: "auto", scrollbarWidth: "none", borderBottom: `1px solid ${T.border}`, marginTop: 12, flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "10px 18px", background: "none", border: "none", fontFamily: F, fontSize: 13, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? T.accent : T.textSub, borderBottom: `2px solid ${tab === t.id ? T.accent : "transparent"}`, cursor: "pointer", whiteSpace: "nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "14px 16px" }}>
        {tab === "disputes" && <DisputesTab />}
        {tab === "reports"  && <ReportsTab />}
        {tab === "payouts"  && <PayoutsTab />}
        {tab === "users"    && <UsersTab />}
        {tab === "works"    && <WorksTab />}
        <div style={{ height: 30 }} />
      </div>
    </div>
  );
}
