"use client";

import { useState, useEffect, useRef } from "react";
import { GS } from "@/lib/store";
import { T } from "@/theme/colors";
import { DB, isSupabaseReady } from "@/lib/supabase";
import Avt from "@/components/atoms/Avt";
import { IcX, IcHeart } from "@/components/icons";

const F = "'Helvetica Neue', Arial, sans-serif";

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return diff + "с";
  if (diff < 3600) return Math.floor(diff / 60) + "м";
  if (diff < 86400) return Math.floor(diff / 3600) + "ц";
  if (diff < 604800) return Math.floor(diff / 86400) + "ө";
  return Math.floor(diff / 604800) + " 7 хоног";
}

export default function CommentSheet({ work, creator, onClose, onCountChange }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [likedComments, setLikedComments] = useState(new Set());
  const inputRef = useRef(null);

  useEffect(() => {
    if (!work?.id) return;
    DB.getComments(work.id, 50).then(list => {
      setComments(list || []);
      setLoading(false);
    });
  }, [work?.id]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggleLikeComment = (commentId) => {
    setLikedComments(prev => {
      const next = new Set(prev);
      next.has(commentId) ? next.delete(commentId) : next.add(commentId);
      return next;
    });
    setComments(prev => prev.map(c =>
      c.id === commentId
        ? { ...c, likes_count: (c.likes_count || 0) + (likedComments.has(commentId) ? -1 : 1) }
        : c
    ));
  };

  const send = async () => {
    if (!text.trim() || sending) return;
    if (!GS.user.id || !isSupabaseReady()) return;
    setSending(true);
    const newC = await DB.addComment(work.id, GS.user.id, text.trim());
    if (newC) {
      setComments(prev => [newC, ...prev]);
      setText("");
      if (onCountChange) onCountChange(1);
    }
    setSending(false);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        animation: "fadeIn .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 640,
          background: "#FFFFFF",
          borderTopLeftRadius: 16, borderTopRightRadius: 16,
          display: "flex", flexDirection: "column",
          maxHeight: "85dvh", height: "75dvh",
          animation: "slideUp .25s ease",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
        }}
      >
        {/* Handle */}
        <div style={{ padding: "10px 0 4px", display: "flex", justifyContent: "center" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: T.border }} />
        </div>

        {/* Header */}
        <div style={{ padding: "10px 16px 14px", borderBottom: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: F, fontSize: 15, fontWeight: 700, color: T.textH }}>Сэтгэгдэл</div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, display: "flex", padding: 4 }}>
            <IcX />
          </button>
        </div>

        {/* Caption */}
        {work && (
          <div style={{ padding: "12px 16px", display: "flex", gap: 10, borderBottom: `1px solid ${T.borderLight}` }}>
            <Avt size={32} photo={creator?.photo} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: F, fontSize: 13, color: T.textH, lineHeight: 1.5 }}>
                <span style={{ fontWeight: 700 }}>{creator?.name || work.creator || "—"}</span>
                <span style={{ marginLeft: 6, color: T.textB }}>{work.description || work.title}</span>
              </div>
            </div>
          </div>
        )}

        {/* Comments list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {loading ? (
            <div style={{ padding: 30, textAlign: "center", fontFamily: F, fontSize: 13, color: T.textSub }}>Уншиж байна...</div>
          ) : comments.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center" }}>
              <div style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: T.textH, marginBottom: 6 }}>Сэтгэгдэл байхгүй</div>
              <div style={{ fontFamily: F, fontSize: 13, color: T.textSub }}>Эхний сэтгэгдлийг үлдээгээрэй</div>
            </div>
          ) : (
            comments.map(c => (
              <div key={c.id} style={{ padding: "10px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Avt size={32} photo={c.profiles?.photo} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: F, fontSize: 13, lineHeight: 1.5, color: T.textH }}>
                    <span style={{ fontWeight: 700 }}>{c.profiles?.name || "—"}</span>
                    <span style={{ marginLeft: 6, color: T.textB }}>{c.text}</span>
                  </div>
                  <div style={{ display: "flex", gap: 14, marginTop: 4 }}>
                    <span style={{ fontFamily: F, fontSize: 11, color: T.textSub }}>{timeAgo(c.created_at)}</span>
                    <button type="button" style={{ background: "none", border: "none", fontFamily: F, fontSize: 11, color: T.textSub, cursor: "pointer", padding: 0, fontWeight: 600 }}>Хариу</button>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                  <button type="button" onClick={() => toggleLikeComment(c.id)} style={{ background: "none", border: "none", cursor: "pointer", color: likedComments.has(c.id) ? T.red : T.textSub, padding: 4, display: "flex" }}>
                    <IcHeart filled={likedComments.has(c.id)} />
                  </button>
                  {(c.likes_count > 0) && <span style={{ fontFamily: F, fontSize: 9, color: T.textSub, lineHeight: 1 }}>{c.likes_count}</span>}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div style={{ padding: "10px 14px calc(10px + env(safe-area-inset-bottom, 0px))", borderTop: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", gap: 10, background: "#FFFFFF" }}>
          <Avt size={32} photo={GS.user?.photo} />
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") send(); }}
            placeholder={GS.user?.id ? "Сэтгэгдэл нэмэх..." : "Нэвтэрч сэтгэгдэл үлдээнэ үү"}
            disabled={!GS.user?.id || sending}
            className="feed-comment-input"
            style={{
              flex: 1, background: T.s2, border: `1px solid ${T.border}`, borderRadius: 20,
              padding: "9px 14px", fontFamily: F, fontSize: 14, color: T.textH, outline: "none",
            }}
          />
          {text.trim() && (
            <button
              type="button"
              onClick={send}
              disabled={sending}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: F, fontSize: 14, fontWeight: 700, color: "#0095F6", padding: "6px 4px",
              }}
            >
              Нийтлэх
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
