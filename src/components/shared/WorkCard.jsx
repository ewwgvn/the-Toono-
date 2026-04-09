"use client";

import { useState, useRef, useCallback } from "react";
import { T } from "@/theme/colors";
import { fmtP } from "@/lib/utils";
import { IcHeart, IcBookmark, IcShare } from "@/components/icons";
import Avt from "@/components/atoms/Avt";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const sec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (sec < 60) return "방금";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}일`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}주`;
  const mo = Math.floor(day / 30);
  return `${mo}개월`;
}

const F = "'Helvetica Neue', Arial, sans-serif";

export default function WorkCard({ work: w, onClick, onCreatorClick, onToggleLike, onToggleSave, onComment, horizontal, feed, liked, saved, commentCount, userPhoto }) {
  const thumb = w.images?.[0] || null;
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = w.images?.length ? w.images : [];
  const [showHeart, setShowHeart] = useState(false);
  const [commentText, setCommentText] = useState("");
  const lastTap = useRef(0);
  const touchStart = useRef(null);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked && onToggleLike) onToggleLike(w.id);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    lastTap.current = now;
  }, [liked, onToggleLike, w.id]);

  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStart.current === null || imgs.length <= 1) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && imgIdx < imgs.length - 1) setImgIdx(imgIdx + 1);
      if (diff < 0 && imgIdx > 0) setImgIdx(imgIdx - 1);
    }
    touchStart.current = null;
  };

  const likeCount = (w.likes || 0) + (liked && !(w._origLiked) ? 1 : 0) - (!liked && w._origLiked ? 1 : 0);

  // ── Feed mode (Instagram-style for Feed tab) ──
  if (feed) {
    return (
      <div style={{ marginBottom: 0, background: "#FFFFFF", borderBottom: `1px solid ${T.borderLight}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
          <div onClick={onCreatorClick} style={{ cursor: onCreatorClick ? "pointer" : "default", display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <Avt size={32} photo={w.creatorPhoto} />
            <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#111111" }}>{w.creator}</div>
          </div>
          {w.createdAt && <div style={{ fontFamily: F, fontSize: 11, color: "#999999" }}>{timeAgo(w.createdAt)}</div>}
        </div>
        <div onClick={handleDoubleTap} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
          style={{ width: "100%", aspectRatio: "1", background: "#F7F7F7", cursor: "pointer", position: "relative", overflow: "hidden", userSelect: "none" }}>
          {imgs.length > 0 ? (
            <img src={imgs[imgIdx]} alt="" loading="lazy" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999999", fontSize: 14, fontFamily: F }}>No image</div>
          )}
          {imgs.length > 1 && (
            <div style={{ position: "absolute", top: 12, right: 12, fontFamily: F, fontSize: 11, fontWeight: 500, color: "#FFFFFF", background: "rgba(0,0,0,0.5)", padding: "3px 8px", borderRadius: 10 }}>
              {imgIdx + 1}/{imgs.length}
            </div>
          )}
          {imgs.length > 1 && (
            <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
              {imgs.map((_, i) => <div key={i} style={{ width: 5, height: 5, borderRadius: 3, background: i === imgIdx ? "#FFFFFF" : "rgba(255,255,255,0.4)", transition: "all .2s" }} />)}
            </div>
          )}
          {showHeart && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <svg width="80" height="80" viewBox="0 0 20 20" fill="#D32F2F" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))", animation: "feedHeartPop .8s ease forwards" }}>
                <path d="M10 17C10 17 2.5 12 2.5 7C2.5 4.5 4.5 2.5 7 2.5C8.5 2.5 9.5 3.2 10 4C10.5 3.2 11.5 2.5 13 2.5C15.5 2.5 17.5 4.5 17.5 7C17.5 12 10 17 10 17Z"/>
              </svg>
            </div>
          )}
        </div>
        <div style={{ padding: "10px 16px 2px", display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flex: 1 }}>
            <button onClick={(e) => { e.stopPropagation(); onToggleLike && onToggleLike(w.id); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: liked ? "#D32F2F" : "#111111", display: "flex", padding: 2 }}>
              <IcHeart filled={liked} />
            </button>
            <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color: "#111111", display: "flex", padding: 2 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2.5 3H17.5V13.5H11L8 16.5V13.5H2.5V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </button>
            <button onClick={(e) => { e.stopPropagation(); if (navigator.share) navigator.share({ title: w.title, url: window.location.href }); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#111111", display: "flex", padding: 2 }}>
              <IcShare />
            </button>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(w.id); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: saved ? "#111111" : "#999999", display: "flex", padding: 2 }}>
            <IcBookmark filled={saved} />
          </button>
        </div>
        {likeCount > 0 && <div style={{ padding: "2px 16px", fontFamily: F, fontSize: 13, fontWeight: 600, color: "#111111" }}>{likeCount.toLocaleString()} таалагдсан</div>}
        <div style={{ padding: "2px 16px 0" }}>
          <span style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#111111" }}>{w.creator}</span>
          <span style={{ fontFamily: F, fontSize: 13, color: "#333333", marginLeft: 6 }}>{w.title}</span>
        </div>
        {commentCount > 0 && <div onClick={onClick} style={{ padding: "4px 16px 0", fontFamily: F, fontSize: 13, color: "#999999", cursor: "pointer" }}>{commentCount}개 댓글 모두 보기</div>}
        <div style={{ padding: "4px 16px 0", fontFamily: F, fontSize: 14, fontWeight: 600, color: "#111111" }}>{fmtP(w)}</div>
        <div style={{ padding: "8px 16px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          {userPhoto !== undefined && <Avt size={24} photo={userPhoto} />}
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && commentText.trim() && onComment) { onComment(w.id, commentText.trim()); setCommentText(""); } }}
            placeholder="Сэтгэгдэл бичих..." className="feed-comment-input"
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: F, fontSize: 13, color: "#333333", padding: 0 }}
          />
          {commentText.trim() && (
            <button onClick={() => { if (onComment) { onComment(w.id, commentText.trim()); setCommentText(""); } }}
              style={{ background: "none", border: "none", fontFamily: F, fontSize: 13, fontWeight: 600, color: "#111111", cursor: "pointer", padding: 0 }}>게시</button>
          )}
        </div>
      </div>
    );
  }

  // ── Horizontal mode ──
  if (horizontal) {
    return (
      <div onClick={onClick} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer" }}>
        <div style={{ width: 80, height: 80, background: "#F7F7F7", borderRadius: 8, flexShrink: 0, overflow: "hidden" }}>
          {thumb ? <img src={thumb} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: "#111111", marginBottom: 2 }}>{w.title}</div>
          <div style={{ fontFamily: F, fontSize: 12, color: "#666666", marginBottom: 4 }}>{w.creator}</div>
          <div style={{ fontFamily: F, fontSize: 14, fontWeight: 600, color: "#111111" }}>{fmtP(w)}</div>
        </div>
      </div>
    );
  }

  // ── Default grid card (2-col, FruitsFamily style) ──
  return (
    <div onClick={onClick} style={{ cursor: "pointer" }}>
      <div style={{ aspectRatio: "1", background: "#F7F7F7", borderRadius: 8, overflow: "hidden", marginBottom: 8, position: "relative" }}>
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999999", fontSize: 12, fontFamily: F }}>No image</div>
        )}
        {onToggleSave && (
          <button onClick={(e) => { e.stopPropagation(); onToggleSave(w.id); }}
            style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.9)", border: "none", borderRadius: "50%", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: saved ? "#111111" : "#999999" }}>
            <IcBookmark filled={saved} />
          </button>
        )}
      </div>
      <div style={{ fontFamily: F, fontSize: 13, fontWeight: 500, color: "#111111", lineHeight: 1.4, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {w.title}
      </div>
      <div style={{ fontFamily: F, fontSize: 12, color: "#666666", marginBottom: 2 }}>{w.creator}</div>
      <div style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#111111" }}>{fmtP(w)}</div>
    </div>
  );
}
