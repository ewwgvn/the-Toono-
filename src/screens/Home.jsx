"use client";
import { useState, useEffect } from "react";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { getAllWorks, getCreators, fmtP } from "@/lib/utils";
import Toono from "@/components/atoms/Toono";
import Avt from "@/components/atoms/Avt";
import CommentSheet from "@/components/shared/CommentSheet";
import { IcCart, IcBell, IcHeart, IcBookmark, IcShare } from "@/components/icons";

const F = "'Helvetica Neue', Arial, sans-serif";
const STARDOM = "'Stardom', 'Helvetica Neue', Arial, sans-serif";

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "одоо";
  if (diff < 3600) return Math.floor(diff / 60) + "м";
  if (diff < 86400) return Math.floor(diff / 3600) + "ц";
  if (diff < 604800) return Math.floor(diff / 86400) + "ө";
  return Math.floor(diff / 604800) + "7хон";
}

function IcComment() {
  return <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M22 13c0 4.97-4.03 9-9 9-1.54 0-2.99-.39-4.25-1.07L4 22l1.07-4.75C4.39 15.99 4 14.54 4 13c0-4.97 4.03-9 9-9s9 4.03 9 9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg>;
}

function FeedPost({ work, creator, nav, refresh, onOpenComment }) {
  const [liked, setLiked] = useState(GS.liked.has(work.id));
  const [saved, setSaved] = useState(GS.saved.has(work.id));
  const [likeCount, setLikeCount] = useState(work.likes_count || 0);
  const [commentCount, setCommentCount] = useState(0);
  const [imgRatio, setImgRatio] = useState(null);

  useEffect(() => {
    if (work.id && isSupabaseReady()) {
      DB.getCommentCount(work.id).then(n => setCommentCount(n || 0));
    }
  }, [work.id]);

  const tLike = () => {
    const v = !liked;
    if (v) { GS.liked.add(work.id); setLikeCount(n => n + 1); }
    else { GS.liked.delete(work.id); setLikeCount(n => Math.max(0, n - 1)); }
    setLiked(v);
    saveGS(); refresh();
    if (GS.user.id) DB.toggleLike(GS.user.id, work.id);
  };
  const tSave = () => {
    const v = !saved;
    if (v) GS.saved.add(work.id); else GS.saved.delete(work.id);
    setSaved(v);
    saveGS(); refresh();
    if (GS.user.id) DB.toggleSave(GS.user.id, work.id);
  };
  const tShare = () => {
    const url = `${location.origin}?work=${work.id}`;
    if (navigator.share) navigator.share({ title: work.title, url }).catch(() => {});
    else navigator.clipboard?.writeText(url);
  };

  const img = work.images?.[0];

  return (
    <article style={{ background: "#FFFFFF" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "12px 14px", gap: 10 }}>
        <div onClick={() => creator?.id && nav("profile", { creatorId: creator.id })} style={{ cursor: "pointer" }}>
          <Avt size={38} photo={creator?.photo} />
        </div>
        <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => creator?.id && nav("profile", { creatorId: creator.id })}>
          <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {creator?.name || work.creator || "—"}
          </div>
          <div style={{ fontFamily: F, fontSize: 11, color: "#999999", display: "flex", gap: 6, alignItems: "center" }}>
            <span>{work.cat || creator?.field || ""}</span>
            {work.created_at && <><span>·</span><span>{timeAgo(work.created_at)}</span></>}
          </div>
        </div>
      </div>

      {/* Commission banner */}
      {creator?.comm && (
        <div onClick={() => creator?.id && nav("commission", { creatorId: creator.id })} style={{ margin: "0 14px 10px", background: "#F7F7F7", borderRadius: 8, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: F, fontSize: 12, fontWeight: 600, color: "#111111" }}>Захиалга өгөх боломжтой</span>
          <span style={{ fontFamily: F, fontSize: 11, color: "#666666" }}>→</span>
        </div>
      )}

      {/* Image */}
      <div
        onClick={() => nav("work", { workId: work.id })}
        onDoubleClick={(e) => { e.preventDefault(); if (!liked) tLike(); }}
        style={{
          width: "100%", aspectRatio: img ? (imgRatio || "1") : "4/5", background: "#F7F7F7",
          cursor: "pointer", position: "relative", overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {img ? (
          <img
            src={img}
            alt=""
            loading="lazy"
            onLoad={(e) => {
              const { naturalWidth: nw, naturalHeight: nh } = e.currentTarget;
              if (nw && nh) setImgRatio(`${nw}/${nh}`);
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Toono size={80} color="#E5E5E5" />
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", padding: "10px 12px 4px" }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center", flex: 1 }}>
          <button type="button" onClick={tLike} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", color: liked ? "#D32F2F" : "#111111" }}>
            <IcHeart filled={liked} />
          </button>
          <button type="button" onClick={() => onOpenComment(work, creator, (delta) => setCommentCount(c => c + delta))} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", color: "#111111" }}>
            <IcComment />
          </button>
          <button type="button" onClick={tShare} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", color: "#111111" }}>
            <IcShare />
          </button>
        </div>
        <button type="button" onClick={tSave} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex", color: "#111111" }}>
          <IcBookmark filled={saved} />
        </button>
      </div>

      {/* Likes */}
      {likeCount > 0 && (
        <div style={{ padding: "0 16px 4px", fontFamily: F, fontSize: 13, fontWeight: 700, color: "#111111" }}>
          {likeCount.toLocaleString()} таалагдсан
        </div>
      )}

      {/* Caption */}
      <div style={{ padding: "2px 16px 0", fontFamily: F, fontSize: 13, lineHeight: 1.5, color: "#111111" }}>
        <span style={{ fontWeight: 700 }}>{creator?.name || work.creator || "—"}</span>
        <span style={{ marginLeft: 6, color: "#333333" }}>{work.title}</span>
      </div>
      {work.description && (
        <div style={{ padding: "2px 16px 0", fontFamily: F, fontSize: 12, color: "#666666", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
          {work.description.length > 120 ? work.description.slice(0, 120) + "..." : work.description}
        </div>
      )}

      {/* Comment count */}
      {commentCount > 0 && (
        <div
          onClick={() => onOpenComment(work, creator, (delta) => setCommentCount(c => c + delta))}
          style={{ padding: "6px 16px 0", fontFamily: F, fontSize: 13, color: "#999999", cursor: "pointer" }}
        >
          {commentCount} сэтгэгдлийг харах
        </div>
      )}

      {/* Price + detail */}
      <div style={{ padding: "8px 16px 4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: "#111111" }}>{fmtP(work)}</div>
        <button type="button" onClick={() => nav("work", { workId: work.id })} style={{ background: "none", border: "1px solid #111111", borderRadius: 20, padding: "6px 16px", fontFamily: F, fontSize: 12, fontWeight: 600, color: "#111111", cursor: "pointer" }}>
          Дэлгэрэнгүй
        </button>
      </div>

      {/* Tags */}
      {work.tags?.length > 0 && (
        <div style={{ padding: "8px 16px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
          {work.cat && (
            <span style={{ fontFamily: F, fontSize: 11, color: "#666666", background: "#F7F7F7", padding: "3px 10px", borderRadius: 20 }}>
              #{work.cat}
            </span>
          )}
          {work.tags.slice(0, 3).map(t => (
            <span key={t} style={{ fontFamily: F, fontSize: 11, color: "#666666", background: "#F7F7F7", padding: "3px 10px", borderRadius: 20 }}>
              #{t}
            </span>
          ))}
        </div>
      )}

      <div style={{ height: 14 }} />
    </article>
  );
}

export default function Home({ nav, refresh }) {
  const allW = getAllWorks();
  const creators = getCreators();
  const [commentTarget, setCommentTarget] = useState(null);

  const openComment = (work, creator, onChange) => {
    setCommentTarget({ work, creator, onChange });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#EFEFEF" }}>
      {/* Header — mobile only */}
      <div className="toono-mobile-nav" style={{ padding: "12px 16px", justifyContent: "space-between", alignItems: "center", background: "#FFFFFF", flexShrink: 0, zIndex: 10, paddingTop: "max(12px, env(safe-area-inset-top, 12px))", borderBottom: "1px solid #F0F0F0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Toono size={22} color="#111111" />
          <div style={{ fontFamily: STARDOM, fontSize: 20, fontWeight: 400, color: "#111111", letterSpacing: "0.02em" }}>The TOONO</div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button type="button" onClick={() => nav("cart")} style={{ position: "relative", width: 32, height: 32, borderRadius: 8, background: "transparent", border: "1px solid #E5E5E5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111111" }}>
            <IcCart />
            {GS.cart.length > 0 && <div style={{ position: "absolute", top: -3, right: -3, minWidth: 14, height: 14, borderRadius: 7, background: "#D32F2F", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontFamily: F, fontSize: 8, fontWeight: 600, color: "#fff" }}>{GS.cart.length}</span></div>}
          </button>
          <button type="button" onClick={() => nav("notifications")} style={{ position: "relative", width: 32, height: 32, borderRadius: 8, background: "transparent", border: "1px solid #E5E5E5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111111" }}>
            <IcBell />
            {GS.unreadNotif > 0 && <div style={{ position: "absolute", top: -3, right: -3, width: 6, height: 6, borderRadius: 3, background: "#D32F2F" }} />}
          </button>
        </div>
      </div>

      {/* Feed */}
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        {allW.length === 0 ? (
          <div style={{ padding: "60px 16px", textAlign: "center", background: "#FFFFFF" }}>
            <div style={{ fontFamily: F, fontSize: 16, fontWeight: 600, color: "#111111", marginBottom: 8 }}>Бүтээл байхгүй байна</div>
            <div style={{ fontFamily: F, fontSize: 13, color: "#666666" }}>Шинэ бүтээл удахгүй нэмэгдэнэ</div>
          </div>
        ) : (
          allW.map((w, idx) => {
            const creator = creators.find(c => c.id === w.creator_id) || null;
            return (
              <div key={w.id || idx} style={{ marginBottom: 8 }}>
                <FeedPost
                  work={w}
                  creator={creator}
                  nav={nav}
                  refresh={refresh}
                  onOpenComment={openComment}
                />
              </div>
            );
          })
        )}
        <div style={{ height: 90, background: "#EFEFEF" }} />
      </div>

      {commentTarget && (
        <CommentSheet
          work={commentTarget.work}
          creator={commentTarget.creator}
          onClose={() => setCommentTarget(null)}
          onCountChange={commentTarget.onChange}
        />
      )}
    </div>
  );
}
