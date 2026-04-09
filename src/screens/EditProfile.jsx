"use client";
import { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { toast } from "@/components/layout/Toast";
import { IcBack, IcProfile, IcCamera, IcX } from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import ImageCropper from "@/components/shared/ImageCropper";

export default function EditProfile({ nav, refresh, goBack }) {
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(GS.user.name);
  const [field, setField] = useState(GS.user.field);
  // Dynamic follower count
  GS.user.followers = String(GS.following?.size || 0);
  const [bio, setBio] = useState(GS.user.bio);
  const [tags, setTags] = useState([...GS.user.tags]);
  const [newTag, setNewTag] = useState("");
  const [photo, setPhoto] = useState(GS.user.photo); // base64 or null
  const [cropSrc, setCropSrc] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setCropSrc(ev.target.result);
    reader.readAsDataURL(f);
  };

  const save = async () => {
    if (!name.trim()) { toast("Нэр оруулна уу", "error"); return; }
    setLoading(true);
    try {
      // Upload photo to Storage if new base64 photo selected
      let photoUrl = GS.user.photo || null;
      if (photo && photo.startsWith("data:")) {
        if (isSupabaseReady() && GS.user.id) {
          const uploaded = await DB.uploadFile("avatars", `${GS.user.id}/avatar.jpg`, photo);
          if (uploaded) photoUrl = uploaded;
          else photoUrl = photo; // fallback: keep base64 locally
        } else {
          photoUrl = photo;
        }
      } else if (photo && !photo.startsWith("data:")) {
        photoUrl = photo;
      }
      GS.user.name = name.trim();
      GS.user.field = field.trim();
      GS.user.bio = bio.trim();
      GS.user.tags = tags.filter(t => t.length > 0);
      if (photoUrl) GS.user.photo = photoUrl;
      if (isSupabaseReady() && GS.user.id) {
        await DB.updateProfile(GS.user.id, {
          name: GS.user.name,
          field: GS.user.field,
          bio: GS.user.bio,
          tags: GS.user.tags,
          photo: photoUrl,
          comm_open: GS.user.commOpen,
        });
      }
      saveGS();
      refresh();
      nav("me");
      toast("Профайл хадгалагдлаа", "success");
    } catch (e) {
      toast("Хадгалах үед алдаа гарлаа", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg }}>
      {cropSrc && <ImageCropper src={cropSrc} aspect="circle" onDone={(cropped) => { setPhoto(cropped); setCropSrc(null); }} onCancel={() => setCropSrc(null)} />}
      <div style={{ padding: "20px 20px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button onClick={() => { goBack ? goBack() : nav("me"); }} style={{ background: "none", border: "none", color: T.textH, cursor: "pointer", display: "flex" }}><IcBack /></button>
        <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 18, fontWeight: 700, color: T.textH }}>Профайл засах</div>
        <PBtn small loading={loading} onClick={save}>Хадгалах</PBtn>
      </div>

      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", padding: "0 20px" }}>

        {/* Avatar */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 20, borderBottom: `1px solid ${T.border}`, marginBottom: 20 }}>
          <div style={{ position: "relative", marginBottom: 12 }}>
            <div style={{ width: 88, height: 88, borderRadius: 26, background: T.accentSub, border: `2px solid ${T.accentGlow}`, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {photo
                ? <img src={photo} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ color: T.accent, display: "flex" }}><IcProfile /></div>}
            </div>
            <label style={{ position: "absolute", bottom: -6, right: -6, width: 30, height: 30, borderRadius: "50%", background: T.accent, border: `2px solid ${T.bg}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
              <IcCamera />
              <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: "none" }} />
            </label>
          </div>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, color: T.textSub }}>Зураг дарж солих</div>
        </div>

        {/* Fields */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textSub, marginBottom: 7 }}>Нэр / Хочоо *</div>
          <input value={name} onChange={e => setName(e.target.value)} style={{ width: "100%", background: T.s1, border: `1.5px solid ${name ? T.green : T.border}`, borderRadius: 13, padding: "13px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 15, fontWeight: 600, color: T.textH, outline: "none", boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textSub, marginBottom: 7 }}>Мэргэжил / Чиглэл</div>
          <input value={field} onChange={e => setField(e.target.value)} placeholder="Загварын дизайнер · Урлагч" style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 13, padding: "13px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textH, outline: "none", boxSizing: "border-box" }} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textSub, marginBottom: 7 }}>Биеийн танилцуулга</div>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Өөрийгөө товч танилцуулна уу..." style={{ width: "100%", background: T.s1, border: `1px solid ${T.border}`, borderRadius: 13, padding: "13px 16px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 14, color: T.textH, outline: "none", resize: "none", lineHeight: 1.7, boxSizing: "border-box" }} />
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 11, color: T.textSub, marginTop: 4, textAlign: "right" }}>{bio.length} тэмдэгт</div>
        </div>

        {/* Tags */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, fontWeight: 600, color: T.textSub, marginBottom: 10 }}>Таг / Чиглэл</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {tags.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, background: T.accentSub, border: `1px solid ${T.accentGlow}`, borderRadius: 20, padding: "5px 12px" }}>
                <span style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 12, fontWeight: 600, color: T.accent }}>{t}</span>
                <button onClick={() => setTags(tags.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: T.accent, display: "flex", padding: 0, lineHeight: 1 }}><IcX /></button>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && newTag.trim()) { setTags([...tags, newTag.trim()]); setNewTag(""); } }} placeholder="Шинэ таг..." style={{ flex: 1, background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 14px", fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: 13, color: T.textH, outline: "none" }} />
            <PBtn small onClick={() => { if (newTag.trim()) { setTags([...tags, newTag.trim()]); setNewTag(""); } }} disabled={!newTag.trim()}>Нэмэх</PBtn>
          </div>
        </div>

        <div style={{ height: 30 }} />
      </div>
    </div>
  );
}
