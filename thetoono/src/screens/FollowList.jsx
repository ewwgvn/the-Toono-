"use client";

import { useState } from "react";
import { T } from "@/theme/colors";
import { GS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { getCreators } from "@/lib/utils";
import { IcUsersEmpty } from "@/components/icons";
import Simple from "@/components/layout/Simple";
import Empty from "@/components/atoms/Empty";
import CreatorRow from "@/components/shared/CreatorRow";

export default function FollowList({ nav, refresh }) {
  const [tab, setTab] = useState("following");
  const followingList = getCreators().filter(c => GS.following.has(c.id));
  const followerList = []; // Populated when other users follow you
  const list = tab === "following" ? followingList : followerList;
  const tFollow = id => {
    GS.following.has(id) ? GS.following.delete(id) : GS.following.add(id);
    refresh();
    if (GS.user.id) DB.toggleFollow(GS.user.id, id);
  };

  return <Simple nav={nav} title="Холболт" back="me">
    <div style={{ display: "flex", marginBottom: 8, borderBottom: `1px solid ${T.border}` }}>
      {[["following", "Дагаж байна " + GS.following.size], ["followers", "Дагагч " + followerList.length]].map(t => <button key={t[0]} onClick={() => setTab(t[0])} style={{ flex: 1, padding: "12px 0", background: "none", border: "none", fontFamily: "system-ui", fontSize: 14, fontWeight: tab === t[0] ? 700 : 500, color: tab === t[0] ? T.accent : T.textSub, borderBottom: `2px solid ${tab === t[0] ? T.accent : "transparent"}`, cursor: "pointer" }}>{t[1]}</button>)}
    </div>
    {list.length === 0
      ? <Empty icon={<IcUsersEmpty />} title="Дагаж байна байхгүй" action="Бүтээлч Хайлт" onAction={() => nav("explore")} />
      : list.map(u => <CreatorRow key={u.id} creator={u} onClick={() => nav("profile", { creatorId: u.id })} onFollow={tFollow} showFollow />)}
  </Simple>;
}
