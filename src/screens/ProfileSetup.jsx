"use client";
import { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { toast } from "@/components/layout/Toast";
import Toono from "@/components/atoms/Toono";
import PBtn from "@/components/atoms/PBtn";
import Inp from "@/components/atoms/Inp";
import ImageCropper from "@/components/shared/ImageCropper";
import { IcBack, IcProfile, IcCamera, IcCommission, IcCheck } from "@/components/icons";

export default function ProfileSetup({ nav, refresh, goBack }) {
  const [step, setStep] = useState(0);
  const [field, setField] = useState(GS.user.field);
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [cropSrc, setCropSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const isCreator = GS.currentRole === "creator";

  const suggestedTags = isCreator
    ? ["Fashion Design","Textile Design","Fine Art","Graphic Design","3D Design","Photography","Jewelry Design","Industrial Design","Interior Design"]
    : ["Fashion","Art","Design","Mongolian Culture","Collector"];

  const handlePhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setCropSrc(ev.target.result);
    reader.readAsDataURL(f);
  };

  const finish = () => {
    setLoading(true);
    setTimeout(async () => {
      GS.user.field = field.trim();
      GS.user.bio = bio.trim();
      GS.user.tags = tags;
      GS.user.commOpen = isCreator;
      GS.needsProfileSetup = false;
      // Upload photo to Storage, get URL
      let photoUrl = GS.user.photo || null;
      if (photo && photo.startsWith("data:")) {
        if (isSupabaseReady() && GS.user.id) {
          const uploaded = await DB.uploadFile("avatars", `${GS.user.id}/avatar.jpg`, photo);
          if (uploaded) photoUrl = uploaded;
          else { photoUrl = photo; toast("Storage-д хадгалах боломжгүй — орон нутгийн зурагтай үргэлжлэнэ","info"); }
        } else {
          photoUrl = photo;
        }
      } else if (photo && !photo.startsWith("data:")) {
        photoUrl = photo;
      }
      if (photoUrl) GS.user.photo = photoUrl;
      // Sync to Supabase
      if (isSupabaseReady() && GS.user.id) {
        await DB.updateProfile(GS.user.id, {
          name: GS.user.name,
          field: field.trim(),
          bio: bio.trim(),
          tags: tags,
          photo: photoUrl,
          role: GS.currentRole,
          comm_open: isCreator,
        });
      }
      setLoading(false);
      refresh();
      nav("home");
      toast("Профайл бэлэн боллоо!","success");
    }, 600);
  };

  const skip = () => {
    GS.needsProfileSetup = false;
    saveGS();
    nav("home");
  };

  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg}}>
    {cropSrc&&<ImageCropper src={cropSrc} aspect="circle" onDone={(cropped) => {setPhoto(cropped);setCropSrc(null);}} onCancel={() => setCropSrc(null)}/>}
    <div style={{padding:"20px 20px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={() => goBack?goBack():nav("login")} style={{width:36,height:36,borderRadius:10,background:T.s1,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.textH,flexShrink:0}}><IcBack/></button>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:22,fontWeight:800,color:T.textH}}>Профайл тохируулах</div>
        </div>
        <button onClick={skip} style={{background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub,cursor:"pointer"}}>Алгасах →</button>
      </div>
      <div style={{display:"flex",gap:5,marginBottom:6}}>
        {[0,1,2].map(i => <div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?T.accent:T.border}}/>)}
      </div>
      <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub}}>{step+1}/3 — {["Зураг · Нэр","Чиглэл · Танилцуулга","Таг сонгох"][step]}</div>
    </div>

    <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none",padding:"16px 20px 0"}}>
      {step===0&&<>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24}}>
          <div style={{position:"relative",marginBottom:12}}>
            <div style={{width:100,height:100,borderRadius:30,background:T.accentSub,border:`2px solid ${T.accentGlow}`,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
              {photo ? <img src={photo} alt="" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                     : <div style={{color:T.accent}}><IcProfile/></div>}
            </div>
            <label style={{position:"absolute",bottom:-4,right:-4,width:32,height:32,borderRadius:"50%",background:T.accent,border:`2px solid ${T.bg}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff"}}>
              <IcCamera/>
              <input type="file" accept="image/*" onChange={handlePhoto} style={{display:"none"}}/>
            </label>
          </div>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub}}>Профайл зураг нэмэх</div>
        </div>
        <Inp label="Нэр / Хочоо *" placeholder="Таны нэр эсвэл хочоо" value={GS.user.name} onChange={e => {GS.user.name=e.target.value;refresh();}}/>
        {isCreator&&<Inp label="Мэргэжил / Чиглэл" placeholder="Загварын дизайнер · Урлагч" value={field} onChange={e => setField(e.target.value)}/>}
      </>}

      {step===1&&<>
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:7}}>Биеийн танилцуулга</div>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={5} placeholder={isCreator?"Таны бүтээлч замналыг товч танилцуулна уу...":"Өөрийгөө товч танилцуулна уу..."} style={{width:"100%",background:T.s1,border:`1px solid ${T.border}`,borderRadius:13,padding:"13px 16px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,outline:"none",resize:"none",lineHeight:1.7,boxSizing:"border-box"}}/>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.textSub,marginTop:4,textAlign:"right"}}>{bio.length} тэмдэгт</div>
        </div>
        {isCreator&&<div style={{background:T.accentSub,border:`1px solid ${T.accentGlow}`,borderRadius:14,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
            <div style={{color:T.accent,display:"flex"}}><IcCommission/></div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:700,color:T.textH}}>Захиалга авах уу?</div>
          </div>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub,lineHeight:1.6}}>Идэвхжүүлбэл бусад хүмүүс танд захиалга илгээх боломжтой болно. Дараа тохиргооноос өөрчилж болно.</div>
        </div>}
      </>}

      {step===2&&<>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:700,color:T.textH,marginBottom:14}}>Сонирхлын чиглэл сонгох</div>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub,marginBottom:16}}>2-оос дээш сонгоно уу. Энэ нь таны Feed-д нөлөөлнө.</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
          {suggestedTags.map(t => {
            const sel = tags.includes(t);
            return <button key={t} onClick={() => setTags(sel?tags.filter(x => x!==t):[...tags,t])} style={{padding:"10px 18px",borderRadius:20,cursor:"pointer",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,background:sel?T.accent:T.s1,border:`1.5px solid ${sel?T.accent:T.border}`,color:sel?"#fff":T.textSub,transition:"all .12s"}}>{t}</button>;
          })}
        </div>
        {tags.length>0&&<div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.accent,marginTop:12}}>{tags.length} сонгогдлоо</div>}
      </>}

      <div style={{height:20}}/>
    </div>

    <div style={{padding:"12px 20px 32px",borderTop:`1px solid ${T.border}`,display:"flex",gap:10}}>
      {step>0&&<PBtn full secondary onClick={() => setStep(step-1)}>Буцах</PBtn>}
      <PBtn full loading={loading} onClick={() => {
        if(step===0&&!GS.user.name.trim()){toast("Нэр оруулна уу","error");return;}
        if(step<2) setStep(step+1);
        else finish();
      }}>{step<2?"Дараах":"Дуусгах"}</PBtn>
    </div>
  </div>;
}
