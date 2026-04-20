"use client";

import { useState, useRef, useCallback } from "react";
import { T } from "@/theme/colors";
import { fmtP } from "@/lib/utils";
import { IcHeart, IcBookmark, IcShare } from "@/components/icons";
import Avt from "@/components/atoms/Avt";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const sec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (sec < 60) return "Сая";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}м`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}ц`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}ө`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk}д`;
  const mo = Math.floor(day / 30);
  return `${mo}сар`;
}

const F = "'Helvetica Neue', Arial, sans-serif";

export default function WorkCard({ work: w, onClick, onCreatorClick, onToggleLike, onToggleSave, onComment, horizontal, feed, liked, saved, commentCount, userPhoto }) {
  const thumb = w.images?.[0] || null;
  const [imgIdx, setImgIdx] = useState(0);
  const imgs = w.images?.length ? w.images : [];
  const [showHeart, setShowHeart] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [imgRatio, setImgRatio] = useState(null);
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
          style={{ width: "100%", aspectRatio: imgs.length > 0 ? (imgRatio || "1") : "4/5", background: "#F7F7F7", cursor: "pointer", position: "relative", overflow: "hidden", userSelect: "none" }}>
          {imgs.length > 0 ? (
            <img
              src={imgs[imgIdx]}
              alt=""
              loading="lazy"
              draggable={false}
              onLoad={(e) => {
                const { naturalWidth: nw, naturalHeight: nh } = e.currentTarget;
                if (nw && nh) setImgRatio(`${nw}/${nh}`);
              }}
              style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
            />
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
              <svg width="80" height="69" viewBox="0 0 82.08 70.55" fill="#E24B4A" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.2))", animation: "feedHeartPop .8s ease forwards" }}>
                <path d="M65.09,24.15c.43,1.12-.87,1.71-1.71,1.8-7.09.75-13.96-.07-19.52-4.67-6.34-5.25-10.51-2.2-11.37-4.33s6.45-3.13,12.4,1.12c2.22,1.59,4.3,3.15,6.92,4.02,3.6,1.2,7.24,1.52,11.08,1.38.6-.02,2,.15,2.2.67Z"/>
                <path d="M53.86,67.23c4.63-.49,8.43-2.96,14.36-3.31,2.38-.14,4.73-.52,6.73-1.85,4.58-3.04,4.08-10.41,1.99-14.71l-3.08-6.41c-.34-.7-1.08-2.87-.44-3.19s1-1.7,3.34,1.78c1.37,2.02,2.46,4.5,3.43,6.78,1.41,3.31,2.08,6.81,1.55,10.41-.91,6.12-5.27,9.69-11.4,10.2-3.17.26-6.03.61-9.05,1.71-7.02,2.55-14.63,2.53-21.65-.06s-13.44-8.54-14.03-16.37c-.16-2.12.01-4.21.33-6.28.97-6.3-3.15-9.66-8.84-11.55-2.67-.89-5.06-2.04-7.52-3.43-4.82,3.16-6.76,10.11-5.73,15.45,1.38,7.2,14.5,4.1,23.25,7.33.77.28,1.16,1.29.97,1.83-.29.83-1.04,1.1-1.91.87-3.64-.95-10.91-1.16-14.66-1.59-2.08-.24-4.06-.54-5.95-1.35-2.85-1.23-4.76-3.57-5.29-6.71-.93-5.51.61-11.21,4.04-15.6.8-1.02,1.75-1.72,2.98-2.41C.7,23.49.2,14.03,5.98,7.95,12.29,1.33,21.69-.37,30.71.06c3.12.15,5.97.66,8.93,1.57,2.46.76,4.99,1.39,7.58,1.26,3.4-.16,6.61-3.58,8.74-1.49l2.33,2.29c1.15,1.13,2.39,2.34,3.98,2.82,1.85.55,3.76.62,5.7.59,6.47-.1,11.13,2.32,13.2,8.54,1.08,3.24,1.18,6.58.39,10.02-2.7,11.76-16.62,22.32-28.09,18.66-.52-.16-1.07-.81-.99-1.19.08-.41.8-1.1,1.25-1.06,4.15.33,8.25.1,12.07-1.84,8.64-4.38,15.16-15.1,11.57-24.66-1.89-5.05-6.25-5.38-11.35-5.34-4.35.04-8.17-1.74-10.85-5.18-.53-.68-1.24-1.11-2.13-.66-3.81,1.93-7.86,2.21-12,.89-10-3.19-22.73-3.14-31,3.57-4.77,3.87-5.89,10.19-2.46,15.36,2.32,3.5,5.87,5.76,9.88,7.11,3.16,1.07,6.12,2.33,8.64,4.51,3.34,2.9,4.26,7.23,3.41,11.49-.81,4.01-.15,7.9,2.11,11.27,4.73,7.03,13.95,9.51,22.21,8.64Z"/>
              </svg>
            </div>
          )}
        </div>
        <div style={{ padding: "10px 16px 2px", display: "flex", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flex: 1 }}>
            <button type="button" onClick={(e) => { e.stopPropagation(); onToggleLike && onToggleLike(w.id); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: liked ? "#D32F2F" : "#111111", display: "flex", padding: 2 }}>
              <IcHeart filled={liked} />
            </button>
            <button type="button" onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer", color: "#111111", display: "flex", padding: 2 }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M2.5 3H17.5V13.5H11L8 16.5V13.5H2.5V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); const url = `${window.location.origin}?work=${w.id}`; if (navigator.share) navigator.share({ title: w.title, url }); else if (navigator.clipboard) navigator.clipboard.writeText(url); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#111111", display: "flex", padding: 2 }}>
              <IcShare />
            </button>
          </div>
          <button type="button" onClick={(e) => { e.stopPropagation(); onToggleSave && onToggleSave(w.id); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: saved ? "#111111" : "#999999", display: "flex", padding: 2 }}>
            <IcBookmark filled={saved} />
          </button>
        </div>
        {likeCount > 0 && <div style={{ padding: "2px 16px", fontFamily: F, fontSize: 13, fontWeight: 600, color: "#111111" }}>{likeCount.toLocaleString()} таалагдсан</div>}
        <div style={{ padding: "2px 16px 0" }}>
          <span style={{ fontFamily: F, fontSize: 13, fontWeight: 600, color: "#111111" }}>{w.creator}</span>
          <span style={{ fontFamily: F, fontSize: 13, color: "#333333", marginLeft: 6 }}>{w.title}</span>
        </div>
        {commentCount > 0 && <div onClick={onClick} style={{ padding: "4px 16px 0", fontFamily: F, fontSize: 13, color: "#999999", cursor: "pointer" }}>{commentCount} сэтгэгдэл бүгдийг харах</div>}
        <div style={{ padding: "4px 16px 0", fontFamily: F, fontSize: 14, fontWeight: 600, color: "#111111" }}>{fmtP(w)}</div>
        <div style={{ padding: "8px 16px 12px", display: "flex", alignItems: "center", gap: 10 }}>
          {userPhoto !== undefined && <Avt size={24} photo={userPhoto} />}
          <input value={commentText} onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && commentText.trim() && onComment) { onComment(w.id, commentText.trim()); setCommentText(""); } }}
            placeholder="Сэтгэгдэл бичих..." className="feed-comment-input"
            style={{ flex: 1, background: "none", border: "none", outline: "none", fontFamily: F, fontSize: 13, color: "#333333", padding: 0 }}
          />
          {commentText.trim() && (
            <button type="button" onClick={() => { if (onComment) { onComment(w.id, commentText.trim()); setCommentText(""); } }}
              style={{ background: "none", border: "none", fontFamily: F, fontSize: 13, fontWeight: 600, color: "#111111", cursor: "pointer", padding: 0 }}>Post</button>
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

  // ── Default grid card (FruitsFamily style) ──
  const likeNum = w.likes || 0;
  return (
    <div onClick={onClick} style={{ cursor: "pointer" }}>
      <div style={{ aspectRatio: "3/4", background: "#F7F7F7", overflow: "hidden", marginBottom: 8 }}>
        {thumb ? (
          <img src={thumb} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#999999", fontSize: 12, fontFamily: F }}>No image</div>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 1 }}>
        <div style={{ fontFamily: F, fontSize: 13, fontWeight: 700, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{w.creator}</div>
        {w.cat && <div style={{ fontFamily: F, fontSize: 11, color: "#999999", flexShrink: 0, marginLeft: 4 }}>{w.cat.split(" ")[0]}</div>}
      </div>
      <div style={{ fontFamily: F, fontSize: 12, color: "#666666", lineHeight: 1.4, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {w.title}
      </div>
      <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: "#111111", marginBottom: 4 }}>{fmtP(w)}</div>
      {likeNum > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <IcHeart />
          <span style={{ fontFamily: F, fontSize: 11, color: "#999999" }}>{likeNum}</span>
        </div>
      )}
    </div>
  );
}
