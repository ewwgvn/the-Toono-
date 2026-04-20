"use client";

import { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS, WORKS } from "@/lib/store";
import { DB, SQ, isSupabaseReady, supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/utils";
import { IcBack, IcX, IcVideo, IcWarning, IcCheck } from "@/components/icons";
import { toast } from "@/components/layout/Toast";
import Crd from "@/components/atoms/Crd";
import PBtn from "@/components/atoms/PBtn";
import Pill from "@/components/atoms/Pill";
import Inp from "@/components/atoms/Inp";
import ImageCropper from "@/components/shared/ImageCropper";

export default function Upload({ nav, goBack }) {
  // Buyer guard
  if (GS.currentRole !== "creator") {
    return <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#FFFFFF",padding:32}}>
      <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:16,fontWeight:600,color:"#111111",marginBottom:8}}>Бүтээлч эрхээр нэвтэрнэ үү</div>
      <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:"#999999",marginBottom:20,textAlign:"center"}}>Бүтээл байршуулахын тулд бүтээлч бүртгэлтэй байх шаардлагатай</div>
      <PBtn onClick={() => goBack ? goBack() : nav("home")}>Буцах</PBtn>
    </div>;
  }
  const editingWork = GS.editingWorkId ? GS.myWorks.find(w => w.id === GS.editingWorkId) : null;
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState(editingWork?.cat || "");
  const [saleType, setSaleType] = useState(editingWork?.saleType || "sale");
  const [loading, setLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState(editingWork?.images?.map(img => ({ type: "image", url: img, name: "existing" })) || []);
  const [videoFile, setVideoFile] = useState(editingWork?.video ? { url: editingWork.video, name: "existing" } : null);
  const [cropWorkSrc, setCropWorkSrc] = useState(null);
  const [cropWorkIdx, setCropWorkIdx] = useState(-1);
  const [title, setTitle] = useState(editingWork?.title || "");
  const [desc, setDesc] = useState(editingWork?.desc || "");
  const [price, setPrice] = useState(editingWork?.price ? String(editingWork.price) : "");
  const [stock, setStock] = useState(editingWork?.stock ? String(editingWork.stock) : "1");
  const [duration, setDuration] = useState(editingWork?.duration || "");
  const [material, setMaterial] = useState(editingWork?.medium || editingWork?.material || "");
  const [tags, setTags] = useState(editingWork?.tags?.join(", ") || "");
  const cats = ["Fashion Design", "Interior Design", "Jewelry Design", "Industrial Design", "Graphic Design", "Textile Design", "Fine Art", "3D Design", "Photography"];
  const stepL = ["Зураг/Видео", "Мэдээлэл", "Үнэ·Борлуулалт"];

  // Image picker
  const handleImagePick = (e) => {
    const files = Array.from(e.target.files || []);
    const valid = files.filter(f => f.type.startsWith("image/")).slice(0, 10 - mediaFiles.length);
    valid.forEach(f => {
      const reader = new FileReader();
      reader.onload = async ev => {
        const compressed = await compressImage(ev.target.result, 1200, 0.82);
        setMediaFiles(prev => [...prev, { type: "image", url: compressed, name: f.name }]);
      };
      reader.readAsDataURL(f);
    });
  };

  // Video picker
  const handleVideoPick = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith("video/")) return;
    if (f.size > 50 * 1024 * 1024) { toast("Видео 50MB-аас бага байх ёстой", "error"); return; }
    // For videos, upload to Storage directly (don't use base64 for large files)
    if (isSupabaseReady() && GS.user.id) {
      const reader = new FileReader();
      reader.onload = async ev => {
        const ext = f.name.split(".").pop() || "mp4";
        const path = `videos/${GS.user.id}/${Date.now()}.${ext}`;
        const publicUrl = await DB.uploadFile("works", path, ev.target.result);
        if (publicUrl) setVideoFile({ url: publicUrl, name: f.name, size: (f.size / 1024 / 1024).toFixed(1) });
        else setVideoFile({ url: ev.target.result, name: f.name, size: (f.size / 1024 / 1024).toFixed(1) });
      };
      reader.readAsDataURL(f);
    } else {
      const reader = new FileReader();
      reader.onload = ev => setVideoFile({ url: ev.target.result, name: f.name, size: (f.size / 1024 / 1024).toFixed(1) });
      reader.readAsDataURL(f);
    }
  };

  const removeMedia = (idx) => setMediaFiles(prev => prev.filter((_, i) => i !== idx));

  return <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
    {cropWorkSrc && <ImageCropper src={cropWorkSrc} aspect="square" allowRatioChange={true} onDone={(cropped) => {
      if (cropWorkIdx >= 0) setMediaFiles(prev => prev.map((f, i) => i === cropWorkIdx ? { ...f, url: cropped } : f));
      else setMediaFiles(prev => [...prev, { type: "image", url: cropped, name: "cropped.jpg" }]);
      setCropWorkSrc(null); setCropWorkIdx(-1);
    }} onCancel={() => { setCropWorkSrc(null); setCropWorkIdx(-1); }} />}
    <div style={{ padding: "20px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <button type="button" aria-label="Back" onClick={() => {
        if (step > 0) setStep(step - 1);
        else if (!editingWork && (title || desc || mediaFiles.length > 0)) {
          if (window.confirm("Хадгалаагүй мэдээлэл байна. Гарах уу?")) { GS.editingWorkId = null; goBack ? goBack() : nav("me"); }
        } else { GS.editingWorkId = null; goBack ? goBack() : nav("me"); }
      }} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
      <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 18, fontWeight: 700, color: T.textH }}>{editingWork ? "Бүтээл засах" : "Бүтээл байршуулах"}</div>
      <PBtn small secondary onClick={() => { /* toast placeholder */ }}>Түр хадгалах</PBtn>
    </div>

    {/* Step indicator */}
    <div style={{ display: "flex", borderBottom: `1px solid ${T.border}` }}>
      {stepL.map((s, i) => <button type="button" key={i} onClick={() => setStep(i)} style={{ flex: 1, padding: "11px 0", background: "none", border: "none", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: step === i ? 700 : 500, color: step === i ? T.accent : T.textSub, borderBottom: `2px solid ${step === i ? T.accent : "transparent"}`, cursor: "pointer" }}>{s}</button>)}
    </div>

    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "16px 20px 0" }}>

      {/* STEP 0: Media upload */}
      {step === 0 && <>
        {/* Images */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.textH }}>Зураг</div>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>{mediaFiles.length}/10</div>
          </div>

          {/* Media grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {mediaFiles.map((f, idx) => <div key={idx} style={{ position: "relative", aspectRatio: "1", borderRadius: 12, overflow: "hidden", background: T.s2 }}>
              <img src={f.url} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} onClick={() => { setCropWorkIdx(idx); setCropWorkSrc(f.url); }} />
              <button type="button" onClick={() => removeMedia(idx)} style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}><IcX /></button>
              <button type="button" onClick={() => { setCropWorkIdx(idx); setCropWorkSrc(f.url); }} style={{ position: "absolute", bottom: 4, right: 4, padding: "3px 8px", borderRadius: 6, background: "rgba(0,0,0,0.6)", border: "none", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 9, fontWeight: 600, color: "#fff", cursor: "pointer" }}>Тайрах</button>
              {idx === 0 && <div style={{ position: "absolute", bottom: 4, left: 4, background: T.accent, borderRadius: 4, padding: "2px 6px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 9, fontWeight: 700, color: "#fff" }}>Гол</div>}
            </div>)}

            {/* Add button */}
            {mediaFiles.length < 10 && <label style={{ aspectRatio: "1", borderRadius: 12, background: T.s1, border: `2px dashed ${T.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentSub, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, fontSize: 22 }}>+</div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub }}>Зураг нэмэх</div>
              <input type="file" accept="image/*" multiple onChange={handleImagePick} style={{ display: "none" }} />
            </label>}
          </div>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub, marginTop: 8 }}>JPG, PNG, WEBP · Хамгийн ихдээ 10 зураг · Эхний зураг гол зураг болно</div>
        </div>

        {/* Video */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 700, color: T.textH, marginBottom: 12 }}>Видео <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 400, color: T.textSub }}>(заавал биш)</span></div>
          {videoFile
            ? <div style={{ borderRadius: 14, overflow: "hidden", background: T.s2, position: "relative" }}>
              <video src={videoFile.url} controls style={{ width: "100%", maxHeight: 200, objectFit: "cover", display: "block" }} />
              <div style={{ padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textH }}>{videoFile.name}</div>
                  <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub }}>{videoFile.size} MB</div>
                </div>
                <button type="button" onClick={() => setVideoFile(null)} style={{ background: T.redSub, border: `1px solid ${T.red}40`, borderRadius: 8, padding: "6px 12px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.red, cursor: "pointer" }}>Устгах</button>
              </div>
            </div>
            : <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "24px", borderRadius: 14, background: T.s1, border: `2px dashed ${T.border}`, cursor: "pointer" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(224,80,80,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: T.red }}><IcVideo /></div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 600, color: T.textH }}>Видео нэмэх</div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub, textAlign: "center" }}>MP4, MOV · Хамгийн ихдээ 200MB</div>
              <input type="file" accept="video/*" onChange={handleVideoPick} style={{ display: "none" }} />
            </label>}
        </div>

        {/* Warning: no media */}
        {mediaFiles.length === 0 && <div style={{ background: "rgba(240,160,48,0.1)", border: "1px solid rgba(240,160,48,0.3)", borderRadius: 12, padding: "12px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.yellow, marginBottom: 16 }}><span style={{ display: "flex", marginRight: 4 }}><IcWarning /></span>Дор хаяж 1 зураг оруулна уу</div>}

        <PBtn full onClick={() => { if (mediaFiles.length === 0) { toast("Дор хаяж 1 зураг оруулна уу", "error"); return; } setStep(1); }}>Дараах → Мэдээлэл</PBtn>
      </>}

      {/* STEP 1: Details */}
      {step === 1 && <>
        <Inp label="Бүтээлийн нэр *" placeholder="Гарчиг оруулна уу" value={title} onChange={e => setTitle(e.target.value)} />
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textSub, marginBottom: 7 }}>Тайлбар *</div>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Тайлбар, урам зориг, хийх арга..." style={{ width: "100%", minHeight: 100, background: T.s1, border: `1px solid ${T.border}`, borderRadius: 13, padding: "12px 14px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textH, outline: "none", resize: "none", lineHeight: 1.7, boxSizing: "border-box" }} />
          <div style={{ textAlign: "right", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub, marginTop: 3 }}>{desc.length} тэмдэгт</div>
        </div>
        <Inp label="Материал" placeholder="Тэмээний ноос 60%, хонины ноос 40%" value={material} onChange={e => setMaterial(e.target.value)} />
        <Inp label="Таг" placeholder="Загвар, гар урлал, график..." value={tags} onChange={e => setTags(e.target.value)} />
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textSub, marginBottom: 8 }}>Ангилал *</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {cats.map(c => <button type="button" key={c} onClick={() => setCat(c)} style={{ padding: "7px 15px", borderRadius: 20, cursor: "pointer", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 600, background: cat === c ? T.accent : T.s1, border: `1px solid ${cat === c ? T.accent : T.border}`, color: cat === c ? "#fff" : T.textSub }}>{c}</button>)}
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textSub, marginBottom: 10 }}>Нийтлэлийн төрөл</div>
          {[["sale", "Борлуулалт боломжтой", "Үнэ тохируулсны дараа зарах"], ["portfolio", "Зөвхөн портфолио", "Зарахгүй нийтэлх"], ["sample", "Захиалгын жишээ", "Захиалгын лавлагаа"]].map(t => <button type="button" key={t[0]} onClick={() => setSaleType(t[0])} style={{ width: "100%", background: saleType === t[0] ? T.accentSub : T.s1, border: `1.5px solid ${saleType === t[0] ? T.accent : T.border}`, borderRadius: 13, padding: "13px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 600, color: T.textH }}>{t[1]}</div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub, marginTop: 2 }}>{t[2]}</div>
            </div>
            {saleType === t[0] && <span style={{ color: T.accent }}><IcCheck /></span>}
          </button>)}
        </div>
        <PBtn full onClick={() => { if (!title || !desc || !cat) { toast("Нэр, тайлбар, ангилал бөглөнө үү", "error"); return; } setStep(2); }}>Дараах → Үнэ·Борлуулалт</PBtn>
      </>}

      {/* STEP 2: Price */}
      {step === 2 && <>
        {saleType === "sale" && <>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textSub, marginBottom: 7 }}>Борлуулалтын үнэ (₮) *</div>
            <input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9]/g, ""))} placeholder="0" inputMode="numeric" style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 13, padding: "12px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 26, fontWeight: 700, color: T.accent, outline: "none", boxSizing: "border-box" }} />
            {price && <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textSub, marginTop: 4 }}>₮{Number(price).toLocaleString()}</div>}
          </div>
          <Inp label="Нөөцийн тоо" placeholder="1" value={stock} onChange={e => setStock(e.target.value)} />
          <Inp label="Хийх хугацаа" placeholder="Захиалгын дараа 3~4 долоо хоног" value={duration} onChange={e => setDuration(e.target.value)} />
        </>}

        {/* Preview summary */}
        <div style={{ background: T.accentSub, border: `1px solid ${T.accentGlow}`, borderRadius: 14, padding: "16px", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: 12 }}>Байршуулах бүтээлийн тойм</div>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            {mediaFiles[0] && <img src={mediaFiles[0].url} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, fontWeight: 700, color: T.textH, marginBottom: 2 }}>{title || "Бүтээлийн нэр"}</div>
              <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub, marginBottom: 6 }}>{cat || "Ангилал"}</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {price && saleType === "sale" && <Pill>₮{Number(price).toLocaleString()}</Pill>}
                {videoFile && <Pill color={T.green}><span style={{ display: "flex", marginRight: 3 }}><IcCheck /></span>Видео</Pill>}
                <Pill>{mediaFiles.length} зураг</Pill>
              </div>
            </div>
          </div>
        </div>

        <PBtn full loading={loading} onClick={async () => {
          if (saleType === "sale" && !price) { toast("Үнэ оруулна уу", "error"); return; }
          setLoading(true);
          try {
            let imageUrls = mediaFiles.map(f => f.url);
            let videoUrl = videoFile ? videoFile.url : null;
            if (isSupabaseReady() && GS.user.id) {
              const prefix = `${GS.user.id}/${Date.now()}`;
              // Only upload new (base64) images, keep existing HTTP URLs as-is
              const uploaded = await Promise.all(
                mediaFiles.map((f, i) => {
                  if (!f.url.startsWith("data:")) return Promise.resolve(f.url);
                  return DB.uploadFile('works', `${prefix}_${i}.jpg`, f.url);
                })
              );
              const storageOk = uploaded.some(u => u !== null);
              if (!storageOk && uploaded.length > 0) {
                console.warn('[Upload] Storage failed — using compressed base64 fallback.');
              }
              imageUrls = uploaded.map((url, i) => url || mediaFiles[i].url);
              if (videoFile && videoFile.url.startsWith("data:")) {
                const vUrl = await DB.uploadFile('works', `${prefix}_video.mp4`, videoFile.url);
                if (vUrl) videoUrl = vUrl;
              }
            }
            const accentPalette = ["#3A6FD8", "#666666", "#3A9A60", "#D45A30", "#1A7AB0", "#C05090"];
            const accent = accentPalette[(title || "").split("").reduce((s, c) => s + c.charCodeAt(0), 0) % accentPalette.length];
            const tagList = tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [];
            const newWork = {
              id: Date.now(),
              title, cat,
              year: new Date().getFullYear(),
              status: "published",
              price: saleType === "sale" ? Number(price) : 0,
              sales: 0, views: 0, likes: 0,
              digital: saleType === "sale" && !stock,
              medium: material || "",
              material: material || "",
              dims: "",
              tags: tagList,
              accent,
              desc,
              badge: saleType === "sample" ? "Захиалга" : null,
              sizes: [], colors: [],
              stock: Number(stock) || 1,
              duration: duration || "",
              creator: GS.user.name,
              creator_id: GS.user.id,
              cid: GS.user.id,
              images: imageUrls,
              video: videoUrl,
            };
            if (GS.user.id) {
              const workPayload = {
                creator_id: GS.user.id,
                title: newWork.title,
                description: newWork.desc || "",
                category: newWork.cat || "",
                price: newWork.price || 0,
                material: newWork.material || "",
                medium: newWork.medium || "",
                dimensions: newWork.duration || "",
                tags: newWork.tags || [],
                sizes: [], colors: [],
                images: newWork.images || [],
                video: newWork.video || null,
                digital: newWork.digital || false,
                stock: newWork.stock || 1,
                badge: newWork.badge || null,
                status: "published",
                accent: newWork.accent || "#111111",
              };
              if (isSupabaseReady()) {
                const { data, error } = await supabase.from('works').insert(workPayload).select().single();
                if (data) {
                  newWork.id = data.id;
                } else {
                  const sqId = SQ.push('createWork', workPayload);
                  newWork._sqId = sqId;
                  if (error) console.error('[Upload] createWork:', error.message, error.code);
                }
              } else {
                const sqId = SQ.push('createWork', workPayload);
                newWork._sqId = sqId;
              }
            }
            if (editingWork) {
              // Update existing work
              GS.myWorks = GS.myWorks.map(w => w.id === editingWork.id ? { ...w, ...newWork, id: editingWork.id } : w);
              GS.notifications.unshift({ id: Date.now(), icon: "upload", title: "Бүтээл шинэчлэгдлээ", desc: `"${title}" амжилттай шинэчлэгдлээ.`, time: "Сая", read: true, to: "portfolio" });
            } else {
              GS.myWorks.unshift(newWork);
              if (typeof WORKS !== "undefined") WORKS.unshift(newWork);
              GS.notifications.unshift({ id: Date.now(), icon: "upload", title: "Бүтээл байршлаа", desc: `"${title}" амжилттай нийтлэгдлээ.`, time: "Сая", read: true, to: "portfolio" });
            }
            GS.user.works = GS.myWorks.length;
            GS.editingWorkId = null;
            saveGS();
            nav("me");
          } catch (e) {
            console.error(e);
          } finally {
            setLoading(false);
          }
        }}>Бүтээл байршуулах</PBtn>
      </>}

      <div style={{ height: 30 }} />
    </div>
  </div>;
}
