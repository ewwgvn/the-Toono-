"use client";

import { GS } from "./store";

// Cache invalidates when array references or lengths change
let _worksCache = { result: null, pubRef: null, myRef: null, myLen: -1 };
export function getAllWorks() {
  if (
    _worksCache.result &&
    _worksCache.pubRef === GS.publicWorks &&
    _worksCache.myRef === GS.myWorks &&
    _worksCache.myLen === GS.myWorks.length
  ) return _worksCache.result;
  const combined = [...GS.publicWorks];
  GS.myWorks.forEach(w => {
    if (!combined.find(x => x.id === w.id)) combined.unshift(w);
  });
  _worksCache = { result: combined, pubRef: GS.publicWorks, myRef: GS.myWorks, myLen: GS.myWorks.length };
  return combined;
}

let _creatorsCache = { result: null, pubRef: null, myLen: -1, userId: null, userPhoto: null };
export function getCreators() {
  if (
    _creatorsCache.result &&
    _creatorsCache.pubRef === GS.publicCreators &&
    _creatorsCache.myLen === GS.myWorks.length &&
    _creatorsCache.userId === GS.user.id &&
    _creatorsCache.userPhoto === GS.user.photo
  ) return _creatorsCache.result;
  const allWorks = getAllWorks();
  const list = GS.publicCreators.map(c => ({
    ...c,
    works: allWorks.filter(w => w.creator_id === c.id || w.cid === c.id).length,
  }));
  if (GS.isLoggedIn && GS.currentRole === "creator") {
    const idx = list.findIndex(c => c.id === GS.user.id);
    const myData = {
      id: GS.user.id || 1,
      name: GS.user.name,
      field: GS.user.field || "Бүтээлч",
      followers: GS.user.followers || "0",
      works: GS.myWorks.length,
      comm: GS.user.commOpen,
      rating: GS.trustMetrics?.avgRating || 0,
      accent: "#111111",
      level: "verified",
      photo: GS.user.photo || null,
      bio: GS.user.bio || "",
      tags: GS.user.tags || [],
    };
    if (idx >= 0) list[idx] = { ...list[idx], ...myData };
    else list.unshift(myData);
  }
  _creatorsCache = { result: list, pubRef: GS.publicCreators, myLen: GS.myWorks.length, userId: GS.user.id, userPhoto: GS.user.photo };
  return list;
}

// Single source of truth for a creator's avatar across all screens.
// The current user always resolves to GS.user.photo (never a stale snapshot),
// so their avatar is identical everywhere (nav, feed, work cards, profile).
export function creatorPhotoOf(creatorId, ...fallbacks) {
  if (creatorId && GS.user.id && creatorId === GS.user.id) return GS.user.photo || fallbacks.find(Boolean) || null;
  const c = getCreators().find(x => x.id === creatorId);
  return c?.photo || fallbacks.find(Boolean) || null;
}

export const fmtP = (w) => w.price > 0 ? "₮" + w.price.toLocaleString() : "Захиалга";

export async function compressImage(dataUrl, maxPx = 1200, quality = 0.82) {
  return new Promise(resolve => {
    try {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxPx || h > maxPx) {
          if (w > h) { h = Math.round(h * maxPx / w); w = maxPx; }
          else { w = Math.round(w * maxPx / h); h = maxPx; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch (e) { resolve(dataUrl); }
  });
}
