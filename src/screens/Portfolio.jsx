"use client";
import { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { IcBack, IcSearch, IcX, IcDots, IcEye, IcHeart, IcStats, IcMoney, IcEdit, IcChevron, IcFolderEmpty } from "@/components/icons";
import Toono from "@/components/atoms/Toono";
import Crd from "@/components/atoms/Crd";
import Pill from "@/components/atoms/Pill";
import PBtn from "@/components/atoms/PBtn";
import Empty from "@/components/atoms/Empty";
import { toast } from "@/components/layout/Toast";

export default function Portfolio({ nav, goBack }) {
  const [view, setView] = useState("grid");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [selected, setSelected] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [activeWork, setActiveWork] = useState(null);

  const allWorks = GS.myWorks.length > 0 ? GS.myWorks : [];

  const statusCfg = {
    published: { label: "Нийтлэгдсэн", color: T.green, bg: T.greenSub },
    draft: { label: "Ноорог", color: T.yellow, bg: "rgba(240,160,48,0.14)" },
    archived: { label: "Архив", color: T.textSub, bg: T.s2 },
    digital: { label: "Дижитал", color: "#666666", bg: "rgba(136,80,212,0.14)" },
  };

  const filtered = allWorks.filter(w => {
    if (filter !== "all" && filter !== "digital" && w.status !== filter) return false;
    if (filter === "digital" && !w.digital) return false;
    if (search && !w.title.toLowerCase().includes(search.toLowerCase()) &&
      !(w.tags||[]).some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  }).sort((a, b) => {
    if (sort === "newest") return (b.year||0) - (a.year||0) || (b.id||0) - (a.id||0);
    if (sort === "oldest") return (a.year||0) - (b.year||0) || (a.id||0) - (b.id||0);
    if (sort === "popular") return (b.likes||0) - (a.likes||0);
    if (sort === "price") return (b.price||0) - (a.price||0);
    return 0;
  });

  const stats = {
    total: allWorks.length,
    published: allWorks.filter(w => w.status === "published").length,
    sales: allWorks.reduce((s, w) => s + (w.sales||0), 0),
    views: allWorks.reduce((s, w) => s + (w.views||0), 0),
    likes: allWorks.reduce((s, w) => s + (w.likes||0), 0),
  };

  const toggleSelect = (id) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const byYear = filtered.reduce((acc, w) => {
    const y = w.year || 2026;
    if (!acc[y]) acc[y] = [];
    acc[y].push(w);
    return acc;
  }, {});

  const DigitalBadge = () => <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:9,color:"#666666",background:"rgba(136,80,212,0.14)",padding:"2px 6px",borderRadius:5,fontWeight:700}}>⬇ Дижитал</span>;

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    {/* Header */}
    <div style={{ padding: "20px 20px 12px", flexShrink: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button type="button" onClick={() => goBack ? goBack() : nav("me")} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
          <div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 26, fontWeight: 600, color: T.textH, letterSpacing: "-.01em" }}>Архив</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textSub, marginTop: 2 }}>Миний бүтээлийн архив</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {bulkMode
            ? <><button type="button" onClick={() => { setBulkMode(false); setSelected(new Set()); }} style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 14px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 600, color: T.textSub, cursor: "pointer" }}>Цуцлах</button>
              {selected.size > 0 && <PBtn small danger onClick={() => {
                const count = selected.size;
                GS.myWorks = GS.myWorks.map(w => selected.has(w.id) ? { ...w, status: "archived" } : w);
                if (isSupabaseReady()) {
                  selected.forEach(id => DB.updateWork?.(id, { status: "archived" }));
                }
                saveGS();
                toast(count + "ш бүтээл архивлагдлаа", "success");
                setBulkMode(false); setSelected(new Set());
              }}>Архивлах ({selected.size})</PBtn>}</>
            : <><button type="button" onClick={() => nav("upload")} style={{ width: 38, height: 38, borderRadius: "50%", background: T.accent, border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3V15M3 9H15" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
            </button>
              <button type="button" onClick={() => setBulkMode(true)} style={{ width: 38, height: 38, borderRadius: "50%", background: T.s1, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textSub }}>
                <IcDots />
              </button></>}
        </div>
      </div>

      {/* Stats summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 14 }}>
        {[
          { v: stats.total, l: "Нийт", color: T.textH },
          { v: stats.published, l: "Нийтлэгдсэн", color: T.green },
          { v: stats.sales + "ш", l: "Борлуулалт", color: T.accent },
          { v: (stats.views / 1000).toFixed(1) + "K", l: "Үзэлт", color: T.yellow },
        ].map((s, i) => <div key={i} style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 0", textAlign: "center" }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 17, fontWeight: 800, color: s.color }}>{s.v}</div>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: T.textSub, marginTop: 2 }}>{s.l}</div>
        </div>)}
      </div>

      {/* Search */}
      <div style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 13, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <IcSearch />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Бүтээл, таг хайх..." style={{ background: "none", border: "none", outline: "none", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textH, flex: 1 }} />
        {search && <button type="button" onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, display: "flex" }}><IcX /></button>}
      </div>
    </div>

    {/* Filter toolbar */}
    <div style={{ padding: "0 20px 10px", flexShrink: 0 }}>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", scrollbarWidth: "none", marginBottom: 10 }}>
        {[
          ["all", "Бүгд (" + allWorks.length + ")"],
          ["published", "Нийтлэгдсэн"],
          ["draft", "Ноорог"],
          ["archived", "Архив"],
          ["digital", "Дижитал"],
        ].map(f => <button type="button" key={f[0]} onClick={() => setFilter(f[0])} style={{ flexShrink: 0, padding: "6px 13px", borderRadius: 20, cursor: "pointer", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 600, background: filter === f[0] ? T.accent : T.s1, border: `1px solid ${filter === f[0] ? T.accent : T.border}`, color: filter === f[0] ? "#fff" : T.textSub, transition: "all .15s" }}>{f[1]}</button>)}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>{filtered.length} бүтээл</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 8, padding: "5px 10px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub, outline: "none", cursor: "pointer" }}>
            <option value="newest">Шинэ</option>
            <option value="oldest">Хуучин</option>
            <option value="popular">Алдартай</option>
            <option value="price">Үнэ</option>
          </select>
          {[
            ["grid", <svg key="g" width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" /></svg>],
            ["list", <svg key="l" width="14" height="14" viewBox="0 0 16 16" fill="none"><line x1="1" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="1" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>],
            ["timeline", <svg key="t" width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="3" cy="4" r="2" stroke="currentColor" strokeWidth="1.3" /><circle cx="3" cy="12" r="2" stroke="currentColor" strokeWidth="1.3" /><line x1="3" y1="6" x2="3" y2="10" stroke="currentColor" strokeWidth="1.3" /><line x1="6" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="1.3" /><line x1="6" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.3" /></svg>],
          ].map(([v, icon]) => <button type="button" key={v} onClick={() => setView(v)} style={{ width: 32, height: 32, borderRadius: 8, background: view === v ? T.accent : T.s1, border: `1px solid ${view === v ? T.accent : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: view === v ? "#fff" : T.textSub }}>{icon}</button>)}
        </div>
      </div>
    </div>

    {/* Content */}
    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "0 20px" }}>
      {filtered.length === 0 && <Empty icon={<IcFolderEmpty />} title="Бүтээл олдсонгүй" sub="Хайлтаа өөрчилж үзнэ үү" />}

      {/* GRID VIEW */}
      {view === "grid" && filtered.length > 0 && <div className="toono-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, paddingTop: 4 }}>
        {filtered.map(w => {
          const isSel = selected.has(w.id);
          const sc = statusCfg[w.digital ? "digital" : w.status] || statusCfg.published;
          return <div key={w.id}
            onClick={() => bulkMode ? toggleSelect(w.id) : setActiveWork(w)}
            style={{ position: "relative", aspectRatio: "1", borderRadius: 14, overflow: "hidden", background: (w.accent||"#111111") + "18", border: `2px solid ${isSel ? T.accent : (w.accent||"#111111") + "25"}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
            {w.images?.[0] ? <img src={w.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} /> : <Toono size={38} color={w.accent || "#111111"} />}
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 9, fontWeight: 700, color: T.textSub, textAlign: "center", padding: "0 4px", lineHeight: 1.3 }}>{(w.title||"").length > 18 ? (w.title||"").slice(0, 17) + "…" : w.title}</div>
            <div style={{ position: "absolute", top: 5, left: 5, background: sc.bg, borderRadius: 5, padding: "2px 5px" }}>
              <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 7, fontWeight: 700, color: sc.color }}>{sc.label}</span>
            </div>
            {bulkMode && <div style={{ position: "absolute", top: 5, right: 5, width: 18, height: 18, borderRadius: "50%", background: isSel ? T.accent : T.border, border: `2px solid ${isSel ? T.accent : T.textDim}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isSel && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
            </div>}
            {w.digital && <div style={{ position: "absolute", bottom: 5, right: 5, background: "rgba(136,80,212,0.85)", borderRadius: 4, padding: "1px 5px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 7, fontWeight: 700, color: "#fff" }}>⬇</div>}
          </div>;
        })}
        <button type="button" onClick={() => nav("upload")} style={{ aspectRatio: "1", borderRadius: 14, background: T.s1, border: `2px dashed ${T.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4 }}>
          <div style={{ width: 30, height: 30, borderRadius: 10, background: T.accentSub, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, fontSize: 18 }}>+</div>
          <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 9, color: T.textSub }}>Нэмэх</span>
        </button>
      </div>}

      {/* LIST VIEW */}
      {view === "list" && filtered.length > 0 && <div style={{ paddingTop: 4 }}>
        {filtered.map(w => {
          const isSel = selected.has(w.id);
          const sc = statusCfg[w.digital ? "digital" : w.status] || statusCfg.published;
          return <div key={w.id}
            onClick={() => bulkMode ? toggleSelect(w.id) : setActiveWork(w)}
            style={{ display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer", background: isSel ? T.accentSub : "transparent" }}>
            {bulkMode && <div style={{ width: 20, height: 20, borderRadius: "50%", background: isSel ? T.accent : T.s2, border: `2px solid ${isSel ? T.accent : T.border}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isSel && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
            </div>}
            <div style={{ width: 52, height: 52, borderRadius: 12, background: (w.accent||"#111111") + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Toono size={30} color={w.accent || "#111111"} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 700, color: T.textH, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: T.textSub }}>{w.cat}</span>
                <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: T.textSub }}>·</span>
                <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: T.textSub }}>{w.year}</span>
                <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 9, fontWeight: 700, color: sc.color, background: sc.bg, padding: "1px 6px", borderRadius: 5 }}>{sc.label}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: T.textSub }}><IcEye /> {(w.views||0).toLocaleString()}</span>
                <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: T.textSub }}><IcHeart /> {w.likes||0}</span>
                {(w.sales||0) > 0 && <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, color: T.green }}><IcStats /> {w.sales}ш</span>}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 700, color: (w.price||0) > 0 ? T.accent : T.textSub }}>
                {(w.price||0) > 0 ? "₮" + ((w.price||0) / 1000).toFixed(0) + "K" : "–"}
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); setActiveWork(w); }} style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, marginTop: 4, display: "flex" }}>
                <IcChevron />
              </button>
            </div>
          </div>;
        })}
      </div>}

      {/* TIMELINE VIEW */}
      {view === "timeline" && <div style={{ paddingTop: 8 }}>
        {Object.keys(byYear).sort((a, b) => +b - +a).map(year => <div key={year} style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 20, fontWeight: 600, color: T.accent }}>{year}</div>
            <div style={{ flex: 1, height: 1, background: T.accentGlow }} />
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub }}>{byYear[+year].length}ш</div>
          </div>
          <div style={{ paddingLeft: 16, borderLeft: `2px solid ${T.accentGlow}` }}>
            {byYear[+year].map((w) => {
              const sc = statusCfg[w.digital ? "digital" : w.status] || statusCfg.published;
              return <div key={w.id} onClick={() => setActiveWork(w)} style={{ position: "relative", marginBottom: 16, cursor: "pointer" }}>
                <div style={{ position: "absolute", left: -22, top: 16, width: 12, height: 12, borderRadius: "50%", background: w.accent || "#111111", border: `2px solid ${T.bg}` }} />
                <Crd style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 52, height: 52, borderRadius: 12, background: (w.accent||"#111111") + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Toono size={30} color={w.accent || "#111111"} /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH }}>{w.title}</div>
                        <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 9, fontWeight: 700, color: sc.color, background: sc.bg, padding: "2px 7px", borderRadius: 6, flexShrink: 0, marginLeft: 8 }}>{sc.label}</span>
                      </div>
                      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub, marginBottom: 6 }}>{w.cat} · {w.medium}</div>
                      <div style={{ display: "flex", gap: 10 }}>
                        <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub }}><IcEye /> {(w.views||0).toLocaleString()}</span>
                        <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub }}><IcHeart /> {w.likes||0}</span>
                        {(w.price||0) > 0 && <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, fontWeight: 700, color: T.accent }}>₮{((w.price||0) / 1000).toFixed(0)}K</span>}
                        {w.digital && <DigitalBadge />}
                      </div>
                      {(w.tags||[]).length > 0 && <div style={{ display: "flex", gap: 5, marginTop: 8, flexWrap: "wrap" }}>
                        {(w.tags||[]).slice(0, 3).map(t => <span key={t} style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 9, color: T.accent, background: T.accentSub, padding: "2px 7px", borderRadius: 6 }}>{t}</span>)}
                      </div>}
                    </div>
                  </div>
                </Crd>
              </div>;
            })}
          </div>
        </div>)}
      </div>}

      <div style={{ height: 30 }} />
    </div>

    {/* Work detail modal */}
    {activeWork && <div onClick={() => setActiveWork(null)} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 80, display: "flex", alignItems: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ width: "100%", background: T.s1, borderRadius: "24px 24px 0 0", padding: "20px 20px 40px", maxHeight: "85%", overflowY: "auto", scrollbarWidth: "none" }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, background: (activeWork.accent||"#111111") + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Toono size={44} color={activeWork.accent || "#111111"} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 18, fontWeight: 800, color: T.textH, marginBottom: 4 }}>{activeWork.title}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[activeWork.cat, (activeWork.year||2026) + "", activeWork.digital ? "Дижитал" : "Биет"].map(t => <Pill key={t} color={T.accent}>{t}</Pill>)}
              <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 10, fontWeight: 700, color: (statusCfg[activeWork.digital ? "digital" : activeWork.status] || statusCfg.published).color, background: (statusCfg[activeWork.digital ? "digital" : activeWork.status] || statusCfg.published).bg, padding: "4px 10px", borderRadius: 20, display: "inline-block" }}>{(statusCfg[activeWork.digital ? "digital" : activeWork.status] || statusCfg.published).label}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[[<IcEye key="e" />, (activeWork.views||0).toLocaleString(), "Үзэлт"], [<IcHeart key="h" />, activeWork.likes||0, "Дурлалт"], [<IcStats key="s" />, (activeWork.sales||0) + "ш", "Борлуулалт"], [<IcMoney key="m" />, (activeWork.price||0) > 0 ? "₮" + ((activeWork.price||0) / 1000).toFixed(0) + "K" : "–", "Үнэ"]].map(s => <div key={s[2]} style={{ background: T.s2, borderRadius: 12, padding: "10px 0", textAlign: "center" }}>
            <div style={{ fontSize: 16, marginBottom: 2 }}>{s[0]}</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 700, color: T.textH }}>{s[1]}</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 9, color: T.textSub }}>{s[2]}</div>
          </div>)}
        </div>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textB, lineHeight: 1.7, marginBottom: 14 }}>{activeWork.desc}</div>
        {[["Материал", activeWork.medium], ["Хэмжээ", activeWork.dims]].map(r => <div key={r[0]} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: `1px solid ${T.border}` }}>
          <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textSub }}>{r[0]}</span>
          <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textH }}>{r[1]}</span>
        </div>)}
        {(activeWork.tags||[]).length > 0 && <div style={{ marginTop: 12, marginBottom: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(activeWork.tags||[]).map(t => <Pill key={t}>{t}</Pill>)}
        </div>}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <PBtn full secondary onClick={() => { setActiveWork(null); nav("upload"); }}><span style={{ display: "flex", marginRight: 4 }}><IcEdit /></span>Засах</PBtn>
          {activeWork.status === "draft" && <PBtn full onClick={() => { toast("Нийтлэгдлээ", "success"); setActiveWork(null); }}>Нийтлэх</PBtn>}
          {activeWork.status === "published" && <PBtn full onClick={() => { const wid = activeWork.id; setActiveWork(null); nav("work", { workId: wid }); }}>Дэлгэрэнгүй</PBtn>}
        </div>
      </div>
    </div>}
  </div>;
}
