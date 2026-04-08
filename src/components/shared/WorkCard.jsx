"use client";

import { useState, useRef, useCallback } from "react";
import { T } from "@/theme/colors";
import { fmtP } from "@/lib/utils";
import { IcHeart, IcBookmark, IcShare } from "@/components/icons";
import Crd from "@/components/atoms/Crd";
import Toono from "@/components/atoms/Toono";
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

export default function WorkCard({ work: w, onClick, onCreatorClick, onToggleLike, onToggleSave, onComment, horizontal, feed, liked, saved, commentCount, userPhoto }) {
  const thumb = w.images?.[0] || null;
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = w.images?.length ? w.images : [];
  const [showHeart, setShowHeart] = useState(false);
  const [commentText, setCommentText] = useState("");
  const lastTap = useRef(0);
  const touchStart = useRef(null);

  // Double-tap to like
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!liked && onToggleLike) onToggleLike(w.id);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    lastTap.current = now;
  }, [liked, onToggleLike, w.id]);

  // Swipe for multiple images
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

  // ── Feed mode (Instagram-style) ──
  if (feed) {
    return (
      <div style={{ marginBottom: 0, background: T.bg, borderBottom: `1px solid ${T.border}` }}>
        {/* Creator header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px" }}>
          <div onClick={onCreatorClick} style={{ cursor: onCreatorClick ? "pointer" : "default", display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            <Avt size={32} color={w.accent || T.accent} photo={w.creatorPhoto} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "system-ui", fontSize: 13, fontWeight: 700, color: T.textH }}>{w.creator}</div>
            </div>
          </div>
          {w.createdAt && <div style={{ fontFamily: "system-ui", fontSize: 11, color: T.textSub }}>{timeAgo(w.createdAt)}</div>}
        </div>

        {/* Image with swipe + double-tap */}
        <div
          onClick={handleDoubleTap}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            width: "100%", aspectRatio: "1", background: T.s2,
            cursor: "pointer", position: "relative", overflow: "hidden", userSelect: "none",
          }}
        >
          {imgs.length > 0 ? (
            <img src={imgs[imgIdx]} alt="" loading="lazy" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `linear-gradient(145deg,${w.accent || T.accent}20,${w.accent || T.accent}06)` }}>
              <Toono size={80} color={w.accent || T.accent} />
            </div>
          )}
          {w.badge && (
            <span style={{ position: "absolute", top: 12, left: 12, fontFamily: "system-ui", fontSize: 10, fontWeight: 700, color: "#fff", background: w.accent || T.accent, padding: "4px 10px", borderRadius: 8 }}>
              {w.badge}
            </span>
          )}
          {/* Image counter */}
          {imgs.length > 1 && (
            <div style={{ position: "absolute", top: 12, right: 12, fontFamily: "system-ui", fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(0,0,0,0.6)", padding: "3px 8px", borderRadius: 10 }}>
              {imgIdx + 1}/{imgs.length}
            </div>
          )}
          {/* Image dots */}
          {imgs.length > 1 && (
            <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 5 }}>
              {imgs.map((_, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: i === imgIdx ? "#fff" : "rgba(255,255,255,0.4)", transition: "all .2s" }} />
              ))}
            </div>
          )}
          {/* Double-tap heart animation */}
          {showHeart && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
              <svg width="80" height="80" viewBox="0 0 20 20" fill="#E04848" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.3))", animation: "feedHeartPop .8s ease forwards" }}>
                <path d="M10 17C10 17 2.5 12 2.5 7C2.5 4.5 4.5 2.5 7 2.5C8.5 2.5 9.5 3.2 10 4C10.5 3.2 11.5 2.5 13 2.5C15.5 2.5 17.5 4.5 17.5 7C17.5 12 10 17 10 17Z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ padding: "10px 14px 2px", display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flex: 1 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLike && onToggleLike(w.id); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: liked ? T.red : T.textSub, display: "flex", padding: 4 }}
            >
              <IcHeart filled={liked} />
            </button>
            <button
              onClick={onClick}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, display: "flex", padding: 4 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2.5 3H17.5V13.5H11L8 16.5V13.5H2.5V3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (navigator.share) navigator.share({ title: w.title, url: window.location.href }); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.textSub, display: "flex", padding: 4 }}
            >
              <IcShare />
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(w.id); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: saved ? T.accent : T.textSub, display: "flex", padding: 4 }}
          >
            <IcBookmark filled={saved} />
          </button>
        </div>

        {/* Like count */}
        {likeCount > 0 && (
          <div style={{ padding: "0 16px 2px", fontFamily: "system-ui", fontSize: 13, fontWeight: 700, color: T.textH }}>
            {likeCount.toLocaleString()} таалагдсан
          </div>
        )}

        {/* Caption */}
        <div style={{ padding: "2px 16px 0" }}>
          <span style={{ fontFamily: "system-ui", fontSize: 13, fontWeight: 700, color: T.textH }}>{w.creator}</span>
          <span style={{ fontFamily: "system-ui", fontSize: 13, color: T.textB, marginLeft: 6 }}>{w.title}</span>
        </div>

        {/* Comment count + view all */}
        {commentCount > 0 && (
          <div onClick={onClick} style={{ padding: "4px 16px 0", fontFamily: "system-ui", fontSize: 13, color: T.textSub, cursor: "pointer" }}>
            {commentCount}개 댓글 모두 보기
          </div>
        )}

        {/* Price */}
        <div style={{ padding: "4px 16px 0", fontFamily: "system-ui", fontSize: 14, fontWeight: 700, color: T.accent }}>
          {fmtP(w)}
        </div>

        {/* Comment input */}
        <div style={{ padding: "8px 16px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          {userPhoto !== undefined && <Avt size={24} color={T.accent} photo={userPhoto} />}
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && commentText.trim() && onComment) {
                onComment(w.id, commentText.trim());
                setCommentText("");
              }
            }}
            placeholder="Сэтгэгдэл бичих..."
            className="feed-comment-input"
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontFamily: "system-ui", fontSize: 13, color: T.textB, padding: 0,
            }}
          />
          {commentText.trim() && (
            <button
              onClick={() => { if (onComment) { onComment(w.id, commentText.trim()); setCommentText(""); } }}
              style={{ background: "none", border: "none", fontFamily: "system-ui", fontSize: 13, fontWeight: 700, color: T.accent, cursor: "pointer", padding: 0 }}
            >
              게시
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Horizontal mode ──
  if (horizontal) {
    return (
      <Crd onClick={onClick} style={{ display: "flex", marginBottom: 10 }}>
        <div
          style={{
            width: 90, height: 90,
            background: (w.accent || T.accent) + "18",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, overflow: "hidden",
          }}
        >
          {thumb ? (
            <img src={thumb} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Toono size={50} color={w.accent || T.accent} />
          )}
        </div>
        <div style={{ flex: 1, padding: "12px 14px", borderLeft: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: "system-ui", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 3 }}>{w.title}</div>
          <div style={{ fontFamily: "system-ui", fontSize: 12, color: T.textSub, marginBottom: 8 }}>{w.creator}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "system-ui", fontSize: 14, fontWeight: 700, color: T.accent }}>{fmtP(w)}</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(w.id); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: saved ? T.accent : T.textSub }}
              >
                <IcBookmark filled={saved} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggleLike && onToggleLike(w.id); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: liked ? T.red : T.textSub }}
              >
                <IcHeart filled={liked} />
              </button>
            </div>
          </div>
        </div>
      </Crd>
    );
  }

  // ── Default grid card ──
  return (
    <Crd onClick={onClick}>
      <div
        style={{
          height: 120,
          background: thumb ? T.s2 : `linear-gradient(145deg,${w.accent || T.accent}20,${w.accent || T.accent}06)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}
      >
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Toono size={64} color={w.accent || T.accent} />
        )}
        {w.badge && (
          <span style={{ position: "absolute", top: 8, left: 8, fontFamily: "system-ui", fontSize: 9, fontWeight: 700, color: "#fff", background: w.accent || T.accent, padding: "3px 8px", borderRadius: 6 }}>
            {w.badge}
          </span>
        )}
        {w.digital && (
          <span style={{ position: "absolute", top: 8, right: 8, fontFamily: "system-ui", fontSize: 8, fontWeight: 700, color: "#8850D4", background: "rgba(136,80,212,0.2)", padding: "2px 6px", borderRadius: 5 }}>
            &darr;
          </span>
        )}
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ fontFamily: "system-ui", fontSize: 12, fontWeight: 700, color: T.textH, lineHeight: 1.4, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {w.title}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "system-ui", fontSize: 13, fontWeight: 700, color: T.accent }}>{fmtP(w)}</div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(w.id); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: saved ? T.accent : T.textDim, display: "flex" }}
          >
            <IcBookmark filled={saved} />
          </button>
        </div>
      </div>
    </Crd>
  );
}
