"use client";

import { useState, useEffect } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { getCreators } from "@/lib/utils";
import { IcUsersEmpty } from "@/components/icons";
import Simple from "@/components/layout/Simple";
import Empty from "@/components/atoms/Empty";
import CreatorRow from "@/components/shared/CreatorRow";

const F = "'Helvetica Neue', Arial, sans-serif";

export default function FollowList({ nav, refresh, goBack }) {
  // Use viewingUserId if viewing someone else, otherwise own user
  const viewingId = GS.viewingFollowsUserId || GS.user.id;
  const isSelf = viewingId === GS.user.id;
  const [tab, setTab] = useState(GS.viewingFollowsTab || "following");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (viewingId && isSupabaseReady()) {
          const [frs, fng] = await Promise.all([
            DB.getFollowers(viewingId).catch(() => []),
            DB.getFollowingList(viewingId).catch(() => []),
          ]);
          setFollowers(frs);
          setFollowing(fng);
        } else if (isSelf) {
          setFollowing(getCreators().filter(c => GS.following.has(c.id)));
        }
      } catch (e) {
        console.error("[FollowList]", e);
      } finally {
        setLoading(false);
      }
    };
    load();
    // Clear viewing context after unmount
    return () => { GS.viewingFollowsUserId = null; GS.viewingFollowsTab = null; };
  }, [viewingId]);

  const list = tab === "following" ? following : followers;
  const tFollow = id => {
    GS.following.has(id) ? GS.following.delete(id) : GS.following.add(id);
    saveGS(); refresh();
    if (GS.user.id) DB.toggleFollow(GS.user.id, id);
  };

  return <Simple nav={nav} title={tab === "following" ? "Дагаж байна" : "Дагагчид"} back="me" goBack={goBack}>
    <div style={{ display: "flex", marginBottom: 8, borderBottom: `1px solid ${T.borderLight}` }}>
      {[["following", `Дагаж байна ${following.length}`], ["followers", `Дагагч ${followers.length}`]].map(t =>
        <button type="button" key={t[0]} onClick={() => setTab(t[0])} style={{
          flex: 1, padding: "12px 0", background: "none", border: "none",
          fontFamily: F, fontSize: 13, fontWeight: tab === t[0] ? 600 : 400,
          color: tab === t[0] ? T.textH : T.textSub,
          borderBottom: `2px solid ${tab === t[0] ? T.textH : "transparent"}`,
          cursor: "pointer",
        }}>{t[1]}</button>
      )}
    </div>
    {loading
      ? <div style={{ padding: 40, textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>Ачаалж байна...</div>
      : list.length === 0
        ? <Empty icon={<IcUsersEmpty />} title={tab === "following" ? "Дагаж байгаа хүн байхгүй" : "Дагагч байхгүй"} action="Бүтээлч хайх" onAction={() => nav("explore")} />
        : list.map(u => <CreatorRow key={u.id} creator={{ ...u, works: 0, comm: false, accent: T.textH }} onClick={() => nav("profile", { creatorId: u.id })} onFollow={tFollow} showFollow={u.id !== GS.user.id} following={GS.following.has(u.id)} />)
    }
  </Simple>;
}
