"use client";

import { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { getAllWorks } from "@/lib/utils";
import { IcBookmarkEmpty } from "@/components/icons";
import Simple from "@/components/layout/Simple";
import Empty from "@/components/atoms/Empty";
import WorkCard from "@/components/shared/WorkCard";

export default function SavedWorks({ nav, refresh }) {
  const [view, setView] = useState("grid");
  const savedWorks = getAllWorks().filter(w => GS.saved.has(w.id));
  const tSave = id => {
    GS.saved.delete(id);
    saveGS();
    refresh();
    if (GS.user.id && isSupabaseReady()) DB.toggleSave(GS.user.id, id).catch(() => {});
  };
  const ViewBtns = <div style={{ display: "flex", gap: 4, background: T.s2, borderRadius: 10, padding: 3 }}>
    {["grid", "list"].map(v => <button type="button" key={v} onClick={() => setView(v)} style={{ width: 30, height: 30, borderRadius: 8, background: view === v ? "#FFFFFF" : "transparent", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: view === v ? "#111" : "#999", boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none", transition: "all .15s" }}>
      {v === "grid"
        ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" /></svg>
        : <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><line x1="1" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="1" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
    </button>)}
  </div>;

  return <Simple nav={nav} title={"Хадгалсан бүтээл " + GS.saved.size} back="me" right={ViewBtns}>
    {savedWorks.length === 0
      ? <Empty icon={<IcBookmarkEmpty />} title="Хадгалсан бүтээл байхгүй" sub="Дуртай бүтээлийн хавчуургыг дарна уу" action="Бүтээл хайх" onAction={() => nav("explore")} />
      : <div className={view === "grid" ? "toono-grid-2" : ""} style={{ display: "grid", gridTemplateColumns: view === "grid" ? "1fr 1fr" : "1fr", gap: 12, paddingTop: 8 }}>
        {savedWorks.map(w => <WorkCard key={w.id} work={w} onClick={() => nav("work", { workId: w.id })} onToggleSave={tSave} horizontal={view === "list"} />)}
      </div>}
  </Simple>;
}
