"use client";

import React, { useState, useEffect } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { getCreators } from "@/lib/utils";
import { toast } from "@/components/layout/Toast";
import {
  IcBack, IcShare, IcDots, IcMsg, IcCheck,
} from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Crd from "@/components/atoms/Crd";
import Avt from "@/components/atoms/Avt";
import Pill from "@/components/atoms/Pill";
import Toono from "@/components/atoms/Toono";

// ── Inline badge components (from original index.html) ──
function StarSellerBadge({size="sm"}) {
  const met = GS.trustMetrics;
  const isStarSeller = met.responseRate>=95 && met.onTimeRate>=95 && met.avgRating>=4.8;
  if(!isStarSeller) return null;
  const sz = size==="sm" ? {fs:10,p:"3px 8px",gap:4} : {fs:12,p:"5px 12px",gap:6};
  return <div style={{display:"inline-flex",alignItems:"center",gap:sz.gap,background:"linear-gradient(135deg,#E8960C,#F0C040)",borderRadius:20,padding:sz.p}}>
    <svg width={sz.fs} height={sz.fs} viewBox="0 0 12 12" fill="#fff"><path d="M6 1L7.4 4.2H10.8L8 6.4L9.2 9.6L6 7.6L2.8 9.6L4 6.4L1.2 4.2H4.6Z"/></svg>
    <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:sz.fs,fontWeight:700,color:"#fff"}}>Star Seller</span>
  </div>;
}

function TrustBadges({creator}) {
  const c = creator || {};
  return <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
    {c.level==="top"&&<span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,color:"#111111",background:"#F7F7F7",padding:"3px 8px",borderRadius:20}}>Top Creator</span>}
    {c.level==="verified"&&<span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:500,color:"#666666",background:"#F7F7F7",padding:"3px 8px",borderRadius:20}}>Verified</span>}
    {c.comm&&<span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:500,color:"#666666",background:"#F7F7F7",padding:"3px 8px",borderRadius:20}}>Захиалга авна</span>}
  </div>;
}

function ResponseBadge() {
  return null;
}

export default function CreatorProfile({ nav, refresh, goBack, creatorId }) {
  const localCreator = getCreators().find(x=>x.id===creatorId)||null;
  const [creator, setCreator] = useState(localCreator || {id:creatorId,name:"...",field:"",followers:"0",works:0,comm:false,rating:0,accent:"#111111",bio:"",tags:[]});
  const [creatorWorks, setCreatorWorks] = useState(null);
  const [tab,setTab]=useState("works");
  React.useEffect(()=>{
    if(!creatorId) return;
    // If it's the current user's own profile
    if(creatorId===GS.user.id) {
      setCreator({id:GS.user.id||1,name:GS.user.name,field:GS.user.field||"Бүтээлч",followers:GS.user.followers||"0",works:GS.myWorks.length,comm:GS.user.commOpen,rating:GS.trustMetrics?.avgRating||0,accent:"#111111",bio:GS.user.bio,tags:GS.user.tags||[]});
      setCreatorWorks(GS.myWorks);
      return;
    }
    // Fetch from Supabase
    if(isSupabaseReady()) {
      DB.getProfile(creatorId).then(async p=>{
        if(p) {
          const fc = await DB.getFollowerCount(creatorId);
          setCreator({id:p.id,name:p.name||"—",field:p.field||"Бүтээлч",photo:p.photo||null,followers:String(fc),works:0,comm:p.comm_open||false,rating:p.rating||0,accent:"#111111",bio:p.bio||"",tags:p.tags||[]});
        }
      });
      DB.getWorks({creator_id:creatorId}).then(ws=>{
        setCreatorWorks(ws.map(w=>({...w,creator:w.profiles?.name||w.creator||"—"})));
        setCreator(prev=>({...prev,works:ws.length}));
      });
    }
  },[creatorId]);
  const c=creator;
  const [followerCount, setFollowerCount] = useState(parseInt(c.followers)||0);
  const [followingCount, setFollowingCount] = useState(0);
  const isFollowing=GS.following.has(c.id);
  const tFollow=()=>{
    if(isFollowing){GS.following.delete(c.id);setFollowerCount(p=>Math.max(0,p-1));}
    else{GS.following.add(c.id);setFollowerCount(p=>p+1);}
    saveGS();refresh();if(GS.user.id&&c.id)DB.toggleFollow(GS.user.id,c.id);
  };
  React.useEffect(()=>{
    if(creatorId&&isSupabaseReady()){
      DB.getFollowerCount(creatorId).then(n=>setFollowerCount(n));
      DB.getFollowingCount(creatorId).then(n=>setFollowingCount(n));
    }
  },[creatorId]);

  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg}}>
    <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <button type="button" onClick={()=>goBack?goBack():nav("home")} style={{background:"none",border:"none",color:T.textH,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><IcBack/><span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:16,fontWeight:600}}>Буцах</span></button>
      <div style={{display:"flex",gap:8}}>
        <button type="button" onClick={()=>{const url=`${location.origin}?creator=${c.id}`;navigator.clipboard?.writeText(url).catch(()=>{});toast("Профайлын холбоос хуулагдлаа","success");}} style={{background:"none",border:"none",cursor:"pointer",color:T.textSub,display:"flex"}}><IcShare/></button>
        <button type="button" style={{background:"none",border:"none",cursor:"pointer",color:T.textSub,display:"flex"}}><IcDots/></button>
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none"}}>
      <div style={{padding:"16px 20px 0",display:"flex",alignItems:"center",gap:16}}>
        <div style={{width:72,height:72,borderRadius:22,background:c.accent+"22",border:`2px solid ${c.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",flexShrink:0}}>
          {c.photo?<img src={c.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<Toono size={44} color={c.accent}/>}
        </div>
        <div style={{flex:1}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:22,fontWeight:800,color:T.textH}}>{c.name}</div>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub,marginTop:2}}>{c.field}</div>
          <TrustBadges creator={c}/>
        </div>
        <div style={{display:"flex",gap:8,flexShrink:0}}>
          {creatorId===GS.user.id
            ?<PBtn small onClick={()=>nav("edit-profile")}>Профайл засах</PBtn>
            :<>
              <button type="button" onClick={async ()=>{
                let convo = GS.conversations.find(cv=>cv.name===c.name);
                if(!convo){convo={id:Date.now(),creatorId:c.id||null,name:c.name,accent:c.accent||T.accent,online:false,unread:0,msgs:[]};GS.conversations.unshift(convo);}
                if(isSupabaseReady()&&GS.user.id&&c.id&&GS.user.id!==c.id){
                  const dbConvo=await DB.getOrCreateConversation(GS.user.id,c.id);
                  if(dbConvo)convo.dbId=dbConvo.id;
                }
                GS.activeChatId=convo.id;refresh();nav("chatroom");
              }} style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:10,padding:"8px 12px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textSub,cursor:"pointer"}}><IcMsg/></button>
              <PBtn small secondary={isFollowing} onClick={tFollow}>{isFollowing?"Дагаж байна":"Дагах"}</PBtn>
            </>}
        </div>
      </div>
      <div style={{padding:"12px 20px 0"}}>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          {c.id===GS.user.id&&GS.trustMetrics?.responseRate>=80&&<ResponseBadge hours={GS.trustMetrics.responseRate>=95?1:GS.trustMetrics.responseRate>=80?2:24}/>}
          {c.rating>=4.8&&<StarSellerBadge/>}
        </div>
        {(c.tags||GS.user.tags||[]).length>0&&<div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          {(c.tags||GS.user.tags||[]).map(t=><Pill key={t}>{t}</Pill>)}
        </div>}
        <div style={{display:"flex",marginBottom:16,border:`1px solid ${T.borderLight}`,borderRadius:8}}>
          {[[String(creatorWorks?.length||c.works||0),"Бүтээл"],[String(followerCount),"Дагагч"],[String(followingCount),"Дагаж байна"]].map((s,i)=><div key={s[1]} onClick={()=>(i===1||i===2)&&nav("follows")} style={{flex:1,textAlign:"center",padding:"12px 0",borderRight:i<2?`1px solid ${T.borderLight}`:"none",cursor:(i===1||i===2)?"pointer":"default"}}>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:16,fontWeight:700,color:"#111111"}}>{s[0]}</div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:"#999999",marginTop:2}}>{s[1]}</div>
          </div>)}
        </div>
        {(c.bio||GS.user.bio)&&<div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textB,lineHeight:1.8,marginBottom:16}}>{c.bio||GS.user.bio}</div>}
      </div>
      <div style={{height:1,background:T.border}}/>
      <div style={{display:"flex",borderBottom:`1px solid ${T.border}`}}>
        {[["works","Бүтээл"],["commission","Захиалга"],["about","Тухай"]].map(t=><button type="button" key={t[0]} onClick={()=>setTab(t[0])} style={{flex:1,padding:"13px 0",background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:tab===t[0]?700:500,color:tab===t[0]?T.accent:T.textSub,borderBottom:`2px solid ${tab===t[0]?T.accent:"transparent"}`,cursor:"pointer"}}>{t[1]}</button>)}
      </div>
      {tab==="works"&&<div style={{padding:"14px 20px 0"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub}}>{c.works||0} бүтээл</div>
        {c.id===GS.user.id&&<button type="button" onClick={()=>nav("portfolio")} style={{background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:600,color:T.accent,cursor:"pointer"}}>Бүгдийг харах →</button>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {creatorWorks===null
          ?<div style={{gridColumn:"span 3",padding:"20px 0",textAlign:"center",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub}}>Уншиж байна...</div>
          :(creatorWorks).slice(0,6).map((w,i)=><div key={w.id||i} onClick={()=>nav("work",{workId:w.id})} style={{aspectRatio:"1",borderRadius:14,background:(w.accent||T.accent)+"18",border:`1px solid ${(w.accent||T.accent)}25`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",overflow:"hidden"}}>
            {w.images?.[0] ? <img src={w.images[0]} alt="" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <Toono size={36} color={w.accent}/>}
          </div>)}
      </div></div>}
      {tab==="commission"&&<div style={{padding:"14px 20px 0"}}>
        {(c.comm?[["Захиалга өгөх","Бүтээлчтэй шууд холбогдож нөхцлийг тохирно",""]]:[]
        ).map((cc,i)=><Crd key={i} onClick={()=>nav("commission",{creatorId:c.id})} style={{padding:"14px 16px",marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:700,color:T.textH,marginBottom:3}}>{cc[0]}</div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub}}>Хугацаа {cc[2]}</div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:700,color:T.accent}}>{cc[1]}</div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.green,marginTop:2}}>Авч байна</div>
          </div>
        </Crd>)}
      </div>}
      {tab==="about"&&<div style={{padding:"14px 20px 0"}}>
        {[["Мэргэшил",c.field||GS.user.field||"—"],["Бүтээл",String(c.works||GS.myWorks.length)],["Үнэлгээ",c.rating>0?c.rating+"★":"—"]].map(r=><div key={r[0]} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
          <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub}}>{r[0]}</span>
          <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:500,color:T.textH}}>{r[1]}</span>
        </div>)}
      </div>}
      <div style={{height:40}}/>
    </div>
    {c.comm&&<div style={{padding:"12px 20px 32px",background:T.bg,borderTop:`1px solid ${T.border}`}}>
      <PBtn full onClick={()=>nav("commission",{creatorId:c.id})}>Захиалга өгөх</PBtn>
    </div>}
  </div>;
}
