"use client";

import { useState, useEffect, useRef } from "react";
import { T } from "@/theme/colors";
import PBtn from "@/components/atoms/PBtn";

export default function ImageCropper({ src, onDone, onCancel, aspect = "square", allowRatioChange = false }) {
  const containerRef = useRef(null);
  const loadedImg = useRef(null);
  const [imgNat, setImgNat] = useState({ w: 1, h: 1 });
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [ratio, setRatio] = useState(aspect);
  const [customW, setCustomW] = useState("4");
  const [customH, setCustomH] = useState("5");
  const dragRef = useRef({ active: false, sx: 0, sy: 0, px: 0, py: 0 });
  const pinchRef = useRef({ active: false, d0: 0, s0: 1 });

  const maxW = Math.min(320, typeof window !== "undefined" ? window.innerWidth - 48 : 320);
  const customRatio = ratio === "custom" ? (parseInt(customW) || 1) / (parseInt(customH) || 1) : null;
  const ratioVal = customRatio || { circle: 1, square: 1, "16:9": 16 / 9, "4:3": 4 / 3, "3:4": 3 / 4, "9:16": 9 / 16 }[ratio] || 1;
  const cW = ratioVal >= 1 ? maxW : Math.round(maxW * ratioVal);
  const cH = ratioVal >= 1 ? Math.round(maxW / ratioVal) : maxW;

  const fitImage = (iw, ih, cw, ch) => {
    const s = Math.max(cw / iw, ch / ih) * 1.01;
    return { s, x: (cw - iw * s) / 2, y: (ch - ih * s) / 2 };
  };

  const clampPos = (px, py, s, cw, ch, iw, ih) => ({
    x: Math.min(0, Math.max(cw - iw * s, px)),
    y: Math.min(0, Math.max(ch - ih * s, py)),
  });

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      loadedImg.current = img;
      setImgNat({ w: img.naturalWidth, h: img.naturalHeight });
      const f = fitImage(img.naturalWidth, img.naturalHeight, cW, cH);
      setScale(f.s);
      setPos({ x: f.x, y: f.y });
    };
    img.src = src;
  }, [src]);

  // Re-fit when ratio changes
  useEffect(() => {
    if (imgNat.w <= 1) return;
    const f = fitImage(imgNat.w, imgNat.h, cW, cH);
    setScale(f.s);
    setPos({ x: f.x, y: f.y });
  }, [ratio, cW, cH, imgNat.w, imgNat.h, customW, customH]);

  // Drag
  const onDown = (e) => {
    e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    dragRef.current = { active: true, sx: pt.clientX, sy: pt.clientY, px: pos.x, py: pos.y };
    if (e.touches?.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = { active: true, d0: Math.hypot(dx, dy), s0: scale };
    }
  };

  const onMove = (e) => {
    e.preventDefault();
    if (e.touches?.length === 2 && pinchRef.current.active) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const ns = Math.max(0.2, Math.min(8, pinchRef.current.s0 * (Math.hypot(dx, dy) / pinchRef.current.d0)));
      setScale(ns);
      setPos((p) => clampPos(p.x, p.y, ns, cW, cH, imgNat.w, imgNat.h));
      return;
    }
    if (!dragRef.current.active) return;
    const pt = e.touches ? e.touches[0] : e;
    const np = clampPos(
      dragRef.current.px + (pt.clientX - dragRef.current.sx),
      dragRef.current.py + (pt.clientY - dragRef.current.sy),
      scale, cW, cH, imgNat.w, imgNat.h
    );
    setPos(np);
  };

  const onUp = () => {
    dragRef.current.active = false;
    pinchRef.current.active = false;
  };

  const onWheel = (e) => {
    e.preventDefault();
    const ns = Math.max(0.2, Math.min(8, scale * (e.deltaY > 0 ? 0.93 : 1.07)));
    setScale(ns);
    setPos((p) => clampPos(p.x, p.y, ns, cW, cH, imgNat.w, imgNat.h));
  };

  const doZoom = (delta) => {
    const ns = Math.max(0.2, Math.min(8, scale + delta));
    setScale(ns);
    setPos((p) => clampPos(p.x, p.y, ns, cW, cH, imgNat.w, imgNat.h));
  };

  // Export
  const doCrop = () => {
    if (!loadedImg.current || imgNat.w <= 1) return;
    const maxOut = 1200;
    const outW = cW >= cH ? maxOut : Math.round(maxOut * (cW / cH));
    const outH = cW >= cH ? Math.round(maxOut * (cH / cW)) : maxOut;
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (ratio === "circle") {
      ctx.beginPath();
      ctx.arc(outW / 2, outH / 2, Math.min(outW, outH) / 2, 0, Math.PI * 2);
      ctx.clip();
    }
    const rx = outW / cW, ry = outH / cH;
    ctx.drawImage(loadedImg.current, pos.x * rx, pos.y * ry, imgNat.w * scale * rx, imgNat.h * scale * ry);
    onDone(canvas.toDataURL("image/jpeg", 0.92));
  };

  const ratioOptions = allowRatioChange
    ? [
        ["square", "1:1", "\u25A1"],
        ["16:9", "16:9", "\u25AC"],
        ["4:3", "4:3", "\u25AD"],
        ["3:4", "3:4", "\u25AF"],
        ["9:16", "9:16", "\u25AE"],
        ["custom", "Custom", "\u2699"],
      ]
    : [];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.96)", display: "flex", flexDirection: "column", touchAction: "none" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", flexShrink: 0 }}>
        <button type="button" onClick={onCancel} style={{ background: "none", border: "none", fontFamily: "system-ui", fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: "8px" }}>
          Цуцлах
        </button>
        <div style={{ fontFamily: "system-ui", fontSize: 16, fontWeight: 700, color: "#fff" }}>Зураг тайрах</div>
        <button type="button" onClick={doCrop} style={{ background: T.accent, border: "none", borderRadius: 10, padding: "8px 20px", fontFamily: "system-ui", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
          Хадгалах
        </button>
      </div>

      {/* Crop viewport */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 24px" }}>
        <div
          ref={containerRef}
          style={{
            position: "relative",
            width: cW,
            height: cH,
            overflow: "hidden",
            borderRadius: ratio === "circle" ? "50%" : 12,
            border: "2px solid rgba(255,255,255,0.25)",
            cursor: dragRef.current.active ? "grabbing" : "grab",
            userSelect: "none",
            background: "#111",
          }}
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
          onWheel={onWheel}
        >
          {imgNat.w > 1 && (
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                position: "absolute",
                left: pos.x,
                top: pos.y,
                width: imgNat.w * scale,
                height: imgNat.h * scale,
                maxWidth: "none",
                maxHeight: "none",
                pointerEvents: "none",
              }}
            />
          )}
          {/* Grid overlay */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            <div style={{ position: "absolute", left: "33.33%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.12)" }} />
            <div style={{ position: "absolute", left: "66.66%", top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.12)" }} />
            <div style={{ position: "absolute", top: "33.33%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.12)" }} />
            <div style={{ position: "absolute", top: "66.66%", left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.12)" }} />
          </div>
          {/* Size label */}
          <div style={{ position: "absolute", bottom: 8, right: 10, fontFamily: "system-ui", fontSize: 10, color: "rgba(255,255,255,0.35)", pointerEvents: "none" }}>
            {cW}&times;{cH}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ padding: "12px 24px 36px", flexShrink: 0 }}>
        {/* Ratio selector */}
        {ratioOptions.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: ratio === "custom" ? 10 : 16, flexWrap: "wrap" }}>
            {ratioOptions.map(([k, label, icon]) => (
              <button
                key={k}
                onClick={() => { setRatio(k); }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  padding: "8px 14px",
                  borderRadius: 12,
                  fontFamily: "system-ui",
                  fontSize: 11,
                  fontWeight: ratio === k ? 700 : 500,
                  background: ratio === k ? "rgba(91,143,232,0.2)" : "rgba(255,255,255,0.05)",
                  border: `1.5px solid ${ratio === k ? T.accent + "80" : "rgba(255,255,255,0.08)"}`,
                  color: ratio === k ? "#fff" : "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                  transition: "all .15s",
                  minWidth: 44,
                }}
              >
                <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Custom ratio input */}
        {ratio === "custom" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}>
            <input
              type="number"
              min="1"
              max="32"
              value={customW}
              onChange={(e) => setCustomW(e.target.value)}
              style={{
                width: 52,
                textAlign: "center",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 10,
                padding: "8px 4px",
                fontFamily: "system-ui",
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                outline: "none",
              }}
            />
            <span style={{ fontFamily: "system-ui", fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>:</span>
            <input
              type="number"
              min="1"
              max="32"
              value={customH}
              onChange={(e) => setCustomH(e.target.value)}
              style={{
                width: 52,
                textAlign: "center",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 10,
                padding: "8px 4px",
                fontFamily: "system-ui",
                fontSize: 16,
                fontWeight: 700,
                color: "#fff",
                outline: "none",
              }}
            />
            <span style={{ fontFamily: "system-ui", fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>
              {customW}:{customH}
            </span>
          </div>
        )}

        {/* Zoom */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => doZoom(-0.15)}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            &minus;
          </button>
          <input
            type="range"
            min="20"
            max="500"
            value={Math.round(scale * 100)}
            onChange={(e) => {
              const ns = Number(e.target.value) / 100;
              setScale(ns);
              setPos((p) => clampPos(p.x, p.y, ns, cW, cH, imgNat.w, imgNat.h));
            }}
            style={{ flex: 1, accentColor: T.accent, height: 4, cursor: "pointer" }}
          />
          <button
            onClick={() => doZoom(0.15)}
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </button>
        </div>
        <div style={{ textAlign: "center", fontFamily: "system-ui", fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>
          {Math.round(scale * 100)}%
        </div>
      </div>
    </div>
  );
}
