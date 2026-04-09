"use client";

import { useState, useEffect } from "react";
import { T } from "@/theme/colors";
import { GS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { getCreators } from "@/lib/utils";
import { IcUsersEmpty } from "@/components/icons";
import Simple from "@/components/layout/Simple";
import Empty from "@/components/atoms/Empty";
import CreatorRow from "@/components/shared/CreatorRow";

const F = "'Helvetica Neue', Arial, sans-serif";

export default function FollowList({ nav, refresh }) {
  const [tab, setTab] = useState("following");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (GS.user.id && isSupabaseReady()) {
        const [frs, fng] = await Promise.all([
          DB.getFollowers(GS.user.id),
          DB.getFollowingList(GS.user.id),
        ]);
        setFollowers(frs);
        setFollowing(fng);
      } else {
        // Fallback: use local data for following
        setFollowing(getCreators().filter(c => GS.following.has(c.id)));
      }
      setLoading(false);
    };
    load();
  }, []);

  const list = tab === "following" ? following : followers;
  const tFollow = id => {
    GS.following.has(id) ? GS.following.delete(id) : GS.following.add(id);
    refresh();
    if (GS.user.id) DB.toggleFollow(GS.user.id, id);
  };

  return <Simple nav={nav} title={tab === "following" ? "Following" : "Followers"} back="me">
    <div style={{ display: "flex", marginBottom: 8, borderBottom: `1px solid ${T.borderLight}` }}>
      {[["following", `Following ${following.length}`], ["followers", `Followers ${followers.length}`]].map(t =>
        <button key={t[0]} onClick={() => setTab(t[0])} style={{
          flex: 1, padding: "12px 0", background: "none", border: "none",
          fontFamily: F, fontSize: 13, fontWeight: tab === t[0] ? 600 : 400,
          color: tab === t[0] ? "#111111" : "#999999",
          borderBottom: `2px solid ${tab === t[0] ? "#111111" : "transparent"}`,
          cursor: "pointer",
        }}>{t[1]}</button>
      )}
    </div>
    {loading
      ? <div style={{ padding: 40, textAlign: "center", fontFamily: F, fontSize: 13, color: "#999999" }}>Loading...</div>
      : list.length === 0
        ? <Empty icon={<IcUsersEmpty />} title={tab === "following" ? "Not following anyone" : "No followers yet"} action="Explore creators" onAction={() => nav("explore")} />
        : list.map(u => <CreatorRow key={u.id} creator={{ ...u, works: 0, comm: false, accent: "#111111" }} onClick={() => nav("profile", { creatorId: u.id })} onFollow={tFollow} showFollow following={GS.following.has(u.id)} />)
    }
  </Simple>;
}
