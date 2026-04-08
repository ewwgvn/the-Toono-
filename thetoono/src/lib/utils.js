"use client";

import { GS } from "./store";

export function getAllWorks() {
  const combined = [...GS.publicWorks];
  GS.myWorks.forEach(w => {
    if (!combined.find(x => x.id === w.id)) combined.unshift(w);
  });
  return combined;
}

export function getCreators() {
  const list = [...GS.publicCreators];
  if (GS.isLoggedIn && GS.currentRole === "creator") {
    if (!list.find(c => c.id === GS.user.id)) {
      list.unshift({
        id: GS.user.id || 1,
        name: GS.user.name,
        field: GS.user.field || "Бүтээлч",
        followers: GS.user.followers || "0",
        works: GS.myWorks.length,
        comm: GS.user.commOpen,
        rating: GS.trustMetrics?.avgRating || 0,
        accent: "#5B8FE8",
        level: "verified",
        photo: GS.user.photo || null,
        bio: GS.user.bio || "",
        tags: GS.user.tags || [],
      });
    }
  }
  return list;
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
