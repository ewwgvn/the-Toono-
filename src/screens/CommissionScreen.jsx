"use client";

import React, { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady, supabase, SQ } from "@/lib/supabase";
import { getCreators } from "@/lib/utils";
import { toast } from "@/components/layout/Toast";
import {
  IcBack, IcCheck, IcCamera, IcX,
} from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Crd from "@/components/atoms/Crd";
import Avt from "@/components/atoms/Avt";

export default function CommissionScreen({ nav, goBack, refresh, creatorId }) {
  const [step,setStep]=useState(0);
  const [form,setForm]=useState({type:"",budget:"",desc:"",date:""});
  const [loading,setLoading]=useState(false);
  const [attachments,setAttachments]=useState([]);
  const steps=["Ажлын төрөл","Төсөв · Хугацаа","Агуулга бичих","Баталгаажуулах"];
  const types=[["Загварын дизайн","Хувцас, загварын хөгжүүлэлт"],["Нэхмэлийн загвар","Даавуу, угалзын дизайн"],["Загварын зөвлөгөө","Концепц, дүр санал"],["График материал","Лого, савлагаа г.м."]];

  const budgets=["₮50,000~100,000","₮100,000~300,000","₮300,000~500,000","₮500,000 дээш тэмдэгт"];
  const targetCreator = getCreators().find(c => c.id === creatorId) || { name: "Creator", field: "", photo: null };
  const next=()=>{
    if(step===0&&!form.type){toast("Захиалгын төрлийг сонгоно уу","error");return;}
    if(step===1&&!form.budget){toast("Төсвийг сонгоно уу","error");return;}
    if(step===2&&form.desc.length<10){toast("Захиалгын тайлбарыг 10-аас дээш тэмдэгтээр бичнэ үү","error");return;}
    if(step<3){setStep(step+1);}
    else{setLoading(true);(async()=>{
      try{
        const newComm = {
          id: Date.now(),
          buyer: GS.user.name,
          type: form.type || "—",
          budget: form.budget || "—",
          date: new Date().toISOString().slice(0,10).replace(/-/g,"."),
          deliveryDate: form.date || "—",
          msg: form.desc,
          status: "pending",
        };
        if (GS.user.id && creatorId) {
          const commPayload = {
            buyer_id: GS.user.id,
            seller_id: creatorId,
            type: form.type || "",
            budget: form.budget || "",
            delivery_date: form.date || "",
            description: form.desc || "",
            attachments: attachments.map(a => a.url),
            status: "pending",
          };
          if (isSupabaseReady()) {
            const {data, error} = await supabase.from('commissions').insert(commPayload).select().single();
            if (data) newComm.id = data.id;
            else { SQ.push('createCommission', commPayload); if(error) console.error('[Comm]', error.message); }
          } else {
            SQ.push('createCommission', commPayload);
          }
        }
        GS.myCommissions.unshift(newComm);
        GS.notifications.unshift({id:Date.now()+1,icon:"comm",title:"Захиалга илгээгдлээ",desc:`${form.type||"Загварын дизайн"} захиалга амжилттай илгээгдлээ.`,time:"Сая",read:true,to:"comm-manage"});
        saveGS();nav("me");toast("Захиалга илгээгдлээ","success");
      }catch(e){toast("Алдаа гарлаа","error");}
      finally{setLoading(false);}
    })();}
  };

  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg}}>
    <div style={{padding:"20px 20px 14px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <button type="button" onClick={()=>step===0?(goBack?goBack():nav("home")):setStep(step-1)} style={{background:"none",border:"none",color:T.textH,cursor:"pointer",display:"flex"}}><IcBack/></button>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:20,fontWeight:800,color:T.textH}}>Захиалга өгөх</div>
      </div>
      <div style={{display:"flex",gap:5}}>
        {steps.map((_,i)=><div key={i} style={{flex:1,height:4,borderRadius:2,background:i<=step?T.accent:T.border,transition:"all .3s"}}/>)}
      </div>
      <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub,marginTop:8}}>{step+1}/{steps.length} — {steps[step]}</div>
    </div>
    <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none",padding:"0 20px"}}>
      <Crd onClick={() => creatorId && nav("profile", {creatorId})} style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:20,cursor:"pointer"}}>
        <Avt size={40} photo={targetCreator.photo}/>
        <div>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:700,color:T.textH}}>{targetCreator.name}</div>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:"#666666"}}>{targetCreator.field || "Creator"}</div>
        </div>
      </Crd>
      {step===0&&<>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:700,color:T.textH,marginBottom:12}}>Захиалгын төрөл</div>
        {types.map(t=><button type="button" key={t[0]} onClick={()=>setForm({...form,type:t[0]})} style={{width:"100%",background:form.type===t[0]?T.accentSub:T.s1,border:`1.5px solid ${form.type===t[0]?T.accent:T.border}`,borderRadius:16,padding:"15px 18px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",textAlign:"left",marginBottom:10}}>
          <div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:600,color:T.textH}}>{t[0]}</div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub,marginTop:3}}>{t[1]}</div>
          </div>
          {form.type===t[0]&&<span style={{color:T.accent}}><IcCheck/></span>}
        </button>)}
      </>}
      {step===1&&<>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:16,fontWeight:700,color:T.textH,marginBottom:14}}>Төсвийн хэмжээгээ сонгоно уу</div>
        {budgets.map(b=><button type="button" key={b} onClick={()=>setForm({...form,budget:b})} style={{width:"100%",background:form.budget===b?T.accentSub:T.s1,border:`1.5px solid ${form.budget===b?T.accent:T.border}`,borderRadius:14,padding:"14px 18px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:600,color:T.textH}}>{b}</span>
          {form.budget===b&&<span style={{color:T.accent}}><IcCheck/></span>}
        </button>)}
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:700,color:T.textH,marginTop:20,marginBottom:10}}>Хүссэн дуусгах огноо</div>
        <div style={{display:"flex",gap:8}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.textSub,marginBottom:6}}>Жил</div>
            <select value={(form.date||"").split("-")[0]||new Date().getFullYear()} onChange={e=>{const p=(form.date||`${new Date().getFullYear()}-01-01`).split("-");setForm({...form,date:`${e.target.value}-${p[1]||"01"}-${p[2]||"01"}`});}} style={{width:"100%",background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 12px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,outline:"none",appearance:"none",cursor:"pointer"}}>
              {[2026,2027,2028].map(y=><option key={y} value={y} style={{background:T.s1}}>{y}</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.textSub,marginBottom:6}}>Сар</div>
            <select value={parseInt((form.date||"").split("-")[1])||1} onChange={e=>{const p=(form.date||`${new Date().getFullYear()}-01-01`).split("-");setForm({...form,date:`${p[0]}-${String(e.target.value).padStart(2,"0")}-${p[2]||"01"}`});}} style={{width:"100%",background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 12px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,outline:"none",appearance:"none",cursor:"pointer"}}>
              {Array.from({length:12},(_,i)=>i+1).map(m=><option key={m} value={m} style={{background:T.s1}}>{m} сар</option>)}
            </select>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.textSub,marginBottom:6}}>Өдөр</div>
            <select value={parseInt((form.date||"").split("-")[2])||1} onChange={e=>{const p=(form.date||`${new Date().getFullYear()}-01-01`).split("-");setForm({...form,date:`${p[0]}-${p[1]||"01"}-${String(e.target.value).padStart(2,"0")}`});}} style={{width:"100%",background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,padding:"13px 12px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,outline:"none",appearance:"none",cursor:"pointer"}}>
              {Array.from({length:31},(_,i)=>i+1).map(d=><option key={d} value={d} style={{background:T.s1}}>{d}</option>)}
            </select>
          </div>
        </div>
      </>}
      {step===2&&<>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:16,fontWeight:700,color:T.textH,marginBottom:14}}>Захиалгын тайлбар бичнэ үү</div>
        <textarea value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} placeholder="Хүссэн загвар, зориулалт, онцгой хүсэлтийг дэлгэрэнгүй бичнэ үү. (хамгийн багадаа 10 тэмдэгт)" style={{width:"100%",minHeight:150,background:T.s1,border:`1px solid ${T.border}`,borderRadius:14,padding:16,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,outline:"none",resize:"none",lineHeight:1.7,boxSizing:"border-box"}}/>
        <div style={{textAlign:"right",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.textSub,marginTop:4,marginBottom:12}}>{form.desc.length} тэмдэгт</div>
        <label style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",background:T.s1,border:`1px solid ${T.border}`,borderRadius:14,padding:"13px 16px"}}>
          <span style={{color:T.textSub,display:"flex"}}><IcCamera/></span>
          <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textSub}}>Лавлах зураг хавсаргах (заавал биш)</span>
          <input type="file" accept="image/*,video/*" multiple onChange={async e=>{
            const files = Array.from(e.target.files||[]);
            for(const f of files){
              const reader = new FileReader();
              reader.onload = async ev => {
                let url = ev.target.result;
                if(isSupabaseReady()&&GS.user.id){
                  const ext = f.name.split(".").pop() || "jpg";
                  const path = `commissions/${GS.user.id}/${Date.now()}-${Math.random().toString(36).slice(2,6)}.${ext}`;
                  const publicUrl = await DB.uploadFile("works", path, ev.target.result);
                  if(publicUrl) url = publicUrl;
                }
                setAttachments(prev=>[...prev,{url,name:f.name,type:f.type}]);
              };
              reader.readAsDataURL(f);
            }
            if(files.length>0) toast(files.length+" файл нэмэгдлээ","success");
          }} style={{display:"none"}}/>
        </label>
        {attachments.length>0&&<div style={{display:"flex",gap:8,marginTop:10,overflowX:"auto",scrollbarWidth:"none"}}>
          {attachments.map((att,i)=><div key={i} style={{position:"relative",flexShrink:0}}>
            {att.type.startsWith("video/")
              ?<video src={att.url} style={{width:80,height:80,borderRadius:10,objectFit:"cover",display:"block",background:T.s2}}/>
              :<img src={att.url} alt="" style={{width:80,height:80,borderRadius:10,objectFit:"cover",display:"block"}}/>}
            <button type="button" onClick={()=>setAttachments(a=>a.filter((_,j)=>j!==i))} style={{position:"absolute",top:2,right:2,width:18,height:18,borderRadius:"50%",background:"rgba(0,0,0,0.6)",border:"none",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:9}}><IcX/></button>
          </div>)}
        </div>}
      </>}
      {step===3&&<>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:16,fontWeight:700,color:T.textH,marginBottom:14}}>Захиалгыг шалгах</div>
        <Crd style={{padding:"16px",marginBottom:16}}>
          {[["Ажлын төрөл",form.type||"Загварын дизайн"],["Төсөв",form.budget||"₮100,000~300,000"],["Хүссэн дуусгах",form.date?form.date.replace(/-/g,"."):"Зохицуулах боломжтой"],["Агуулга",form.desc||"Дэлгэрэнгүй агуулга бичих"],["Хавсралт",attachments.length>0?attachments.length+" файл":"Байхгүй"]].map(r=><div key={r[0]} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub}}>{r[0]}</span>
            <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textH,maxWidth:"60%",textAlign:"right"}}>{r[1]}</span>
          </div>)}
        </Crd>
        {attachments.length>0&&<div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",scrollbarWidth:"none"}}>
          {attachments.map((att,i)=><div key={i} style={{flexShrink:0}}>
            {att.type.startsWith("video/")
              ?<video src={att.url} style={{width:72,height:72,borderRadius:10,objectFit:"cover",display:"block",background:T.s2}}/>
              :<img src={att.url} alt="" style={{width:72,height:72,borderRadius:10,objectFit:"cover",display:"block"}}/>}
          </div>)}
        </div>}
        <Crd style={{padding:"13px 16px",background:T.accentSub,border:`1px solid ${T.accentGlow}`,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textB,lineHeight:1.7}}>Захиалга илгээсний дараа бүтээлчтэй шууд холбогдож, нөхцлийг тохирно.</Crd>
      </>}
      <div style={{height:20}}/>
    </div>
    <div style={{padding:"12px 20px 32px",borderTop:`1px solid ${T.border}`}}>
      <PBtn full loading={loading} onClick={next}>{step<3?"Дараах":"Захиалга илгээх"}</PBtn>
    </div>
  </div>;
}
