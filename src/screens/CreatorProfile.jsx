"use client";

import React, { useState } from "react";
import Image from "next/image";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { getCreators } from "@/lib/utils";
import { toast } from "@/components/layout/Toast";
import {
  IcBack, IcShare, IcDots, IcMsg,
} from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Crd from "@/components/atoms/Crd";
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
    <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:sz.fs,fontWeight:700,color:"#fff"}}>Шилдэг худалдагч</span>
  </div>;
}

function TrustBadges({creator}) {
  const c = creator || {};
  return <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
    {c.level==="top"&&<span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,color:T.textH,background:T.s2,padding:"3px 8px",borderRadius:20}}>Шилдэг бүтээлч</span>}
    {c.level==="verified"&&<span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:500,color:T.textSub,background:T.s2,padding:"3px 8px",borderRadius:20}}>Баталгаажсан</span>}
    {c.comm&&<span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:500,color:T.textSub,background:T.s2,padding:"3px 8px",borderRadius:20}}>Захиалга авна</span>}
  </div>;
}

export default function CreatorProfile({ nav, refresh, goBack, creatorId }) {
  const localCreator = getCreators().find(x=>x.id===creatorId)||null;
  const [creator, setCreator] = useState(localCreator || {id:creatorId,name:"...",field:"",followers:"0",works:0,comm:false,rating:0,accent:T.textH,bio:"",tags:[]});
  const [creatorWorks, setCreatorWorks] = useState(null);
  const [tab,setTab]=useState("works");
  React.useEffect(()=>{
    if(!creatorId) return;
    // If it's the current user's own profile
    if(creatorId===GS.user.id) {
      setCreator({id:GS.user.id||1,name:GS.user.name,field:GS.user.field||"Бүтээлч",followers:GS.user.followers||"0",works:GS.myWorks.length,comm:GS.user.commOpen,rating:GS.trustMetrics?.avgRating||0,accent:T.textH,bio:GS.user.bio,tags:GS.user.tags||[],photo:GS.user.photo||null});
      setCreatorWorks(GS.myWorks);
      return;
    }
    // Fetch from Supabase
    if(isSupabaseReady()) {
      DB.getProfile(creatorId).then(async p=>{
        if(p) {
          const fc = await DB.getFollowerCount(creatorId).catch(()=>0);
          setCreator({id:p.id,name:p.name||"—",field:p.field||"Бүтээлч",photo:p.photo||null,followers:String(fc),works:0,comm:p.comm_open||false,rating:p.rating||0,accent:T.textH,bio:p.bio||"",tags:p.tags||[]});
        }
      }).catch(()=>{});
      DB.getWorks({creator_id:creatorId}).then(ws=>{
        setCreatorWorks(ws.map(w=>({...w,creator:w.profiles?.name||w.creator||"—"})));
        setCreator(prev=>({...prev,works:ws.length}));
      }).catch(()=>setCreatorWorks([]));
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

      {/* ── 프로필 헤더 ── */}
      <div style={{padding:"20px 20px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:72,height:72,borderRadius:22,background:T.s2,flexShrink:0,overflow:"hidden",position:"relative"}}>
            {c.photo
              ? (c.photo.startsWith("data:")
                  ? <img src={c.photo} alt={c.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  : <Image src={c.photo} fill alt={c.name} sizes="72px" style={{objectFit:"cover"}}/>)
              : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><Toono size={40} color={T.textDim}/></div>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:20,fontWeight:800,color:T.textH,lineHeight:1.2,marginBottom:3}}>{c.name||"..."}</div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:"#888888"}}>{c.field||""}</div>
            {c.rating>=4.8&&<div style={{marginTop:6}}><StarSellerBadge/></div>}
          </div>
        </div>

        {/* 바이오 (헤더 바로 아래) */}
        {(c.bio||GS.user.bio)&&<div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:"#444444",lineHeight:1.8,marginTop:14}}>{c.bio||GS.user.bio}</div>}

        {/* 태그 */}
        {(c.tags||GS.user.tags||[]).length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10}}>
          {(c.tags||GS.user.tags||[]).map(t=><Pill key={t}>{t}</Pill>)}
        </div>}

        {/* 통계 */}
        <div style={{display:"flex`,gap:0,marginTop:16,border:`1px solid ${T.border}`,borderRadius:12,overflow:`hidden"}}>
          {[[String(creatorWorks?.length||c.works||0),"бүтээл",null],[String(followerCount),"дагагч",()=>{GS.viewingFollowsUserId=creatorId;GS.viewingFollowsTab="followers";nav("follows");}],[String(followingCount),"дагаж байна",()=>{GS.viewingFollowsUserId=creatorId;GS.viewingFollowsTab="following";nav("follows");}]].map((s,i)=>(
            <div key={s[1]} onClick={s[2]||undefined} style={{flex:1,textAlign:"center",padding:"12px 8px",borderRight:i<2?`1px solid ${T.border}`:"none",cursor:s[2]?"pointer":"default"}}>
              <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:17,fontWeight:700,color:T.textH}}>{s[0]}</div>
              <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.textDim,marginTop:2}}>{s[1]}</div>
            </div>
          ))}
        </div>

        {/* 액션 버튼 */}
        <div style={{display:"flex",gap:8,marginTop:14}}>
          {creatorId===GS.user.id
            ? <PBtn full small onClick={()=>nav("edit-profile")}>Профайл засах</PBtn>
            : <>
                <button type="button" className="toono-pressable" onClick={async ()=>{
                  let convo = GS.conversations.find(cv=>(c.id&&cv.creatorId===c.id)||cv.name===c.name);
                  if(!convo){convo={id:Date.now(),creatorId:c.id||null,name:c.name,accent:c.accent||T.accent,online:false,unread:0,msgs:[]};GS.conversations.unshift(convo);saveGS();}
                  if(isSupabaseReady()&&GS.user.id&&c.id&&GS.user.id!==c.id){
                    const dbConvo=await DB.getOrCreateConversation(GS.user.id,c.id);
                    if(dbConvo)convo.dbId=dbConvo.id;
                  }
                  GS.activeChatId=convo.id;refresh();nav("chatroom");
                }} style={{width:42,height:40,borderRadius:12,background:T.s2,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.textH,flexShrink:0}}><IcMsg/></button>
                <PBtn small full secondary={isFollowing} onClick={tFollow}>{isFollowing?"Дагаж байна":"Дагах"}</PBtn>
              </>}
        </div>
      </div>

      {/* ── 탭 바 ── */}
      <div style={{display:"flex",borderTop:`1px solid #EBEBEB`,borderBottom:`1px solid #EBEBEB`}}>
        {[["works","Бүтээл"],["commission","Захиалга"],["about","Тухай"]].map(t=>(
          <button type="button" key={t[0]} onClick={()=>setTab(t[0])} style={{flex:1,padding:"13px 0",background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:tab===t[0]?700:400,color:tab===t[0]?T.textH:T.textDim,borderBottom:`2px solid ${tab===t[0]?T.textH:"transparent"}`,cursor:"pointer",letterSpacing:"0.01em"}}>
            {t[1]}
          </button>
        ))}
      </div>

      {/* ── 작품 탭 ── */}
      {tab==="works"&&<div style={{padding:"16px 16px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textDim}}>{creatorWorks?.length||c.works||0}개 작품</div>
          {c.id===GS.user.id&&<button type="button" onClick={()=>nav("portfolio")} style={{background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:600,color:T.accent,cursor:"pointer"}}>포트폴리오 →</button>}
        </div>
        {creatorWorks===null
          ? <div style={{padding:"40px 0",textAlign:"center",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textDim}}>Уншиж байна...</div>
          : creatorWorks.length===0
            ? <div style={{padding:"40px 0",textAlign:"center",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textDim}}>Бүтээл байхгүй байна</div>
            : <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,paddingBottom:20}}>
                {creatorWorks.map((w,i)=>(
                  <div key={w.id||i} onClick={()=>nav("work",{workId:w.id})} className="toono-card-tap" style={{cursor:"pointer"}}>
                    <div style={{aspectRatio:"1",borderRadius:12,overflow:"hidden",background:T.s2,marginBottom:7}}>
                      {w.images?.[0]
                        ? <img src={w.images[0]} alt={w.title} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}><Toono size={28} color={T.textDim}/></div>}
                    </div>
                    <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:600,color:T.textH,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.title}</div>
                    <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:"#888888"}}>{w.price>0?`₮${w.price.toLocaleString()}`:"Захиалга"}</div>
                  </div>
                ))}
              </div>}
      </div>}

      {/* ── 커미션 탭 ── */}
      {tab==="commission"&&<div style={{padding:"20px 20px 0"}}>
        {c.comm ? (
          <>
            <Crd onClick={()=>nav("commission",{creatorId:c.id})} style={{padding:"18px 16px",marginBottom:12,cursor:"pointer",borderRadius:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:700,color:T.textH}}>Захиалга өгөх</div>
                <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,color:T.green,background:T.greenSub,padding:"3px 10px",borderRadius:20}}>Нээлттэй</span>
              </div>
              <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub,lineHeight:1.6,marginBottom:12}}>Бүтээлчтэй шууд холбогдож захиалга нөхцлийг тохироорой. Загвар хийлгэх, нэхмэл, зураг г.м.</div>
              <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:700,color:T.accent}}>Захиалга илгээх →</div>
            </Crd>
            {/* 커미션 프로세스 안내 */}
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:600,color:T.textDim,marginBottom:10,letterSpacing:"0.03em"}}>ЗАХИАЛГЫН ЯВЦ</div>
            {[["1","Захиалга илгээх","Ажлын төрөл, төсөв, хугацааг тохируулна"],["2","Бүтээлч зөвшөөрнө","24 цагийн дотор хариу өгнө"],["3","Ажил эхэлнэ","Тохиролцсон нөхцлөөр хийгдэнэ"],["4","Хүлээлгэн өгнө","Эцсийн бүтээлийг хүргэж өгнө"]].map(s=>(
              <div key={s[0]} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.s2}`}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:700,color:"#fff"}}>{s[0]}</span>
                </div>
                <div>
                  <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textH,marginBottom:2}}>{s[1]}</div>
                  <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:"#888888"}}>{s[2]}</div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div style={{padding:"40px 0",textAlign:"center"}}>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:600,color:T.textH,marginBottom:8}}>Захиалга авдаггүй</div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textDim,marginBottom:16}}>Энэ бүтээлч одоогоор захиалга авахгүй байна</div>
            <button type="button" onClick={async ()=>{
              let convo = GS.conversations.find(cv=>(c.id&&cv.creatorId===c.id)||cv.name===c.name);
              if(!convo){convo={id:Date.now(),creatorId:c.id||null,name:c.name,accent:c.accent||T.accent,online:false,unread:0,msgs:[]};GS.conversations.unshift(convo);saveGS();}
              if(isSupabaseReady()&&GS.user.id&&c.id&&GS.user.id!==c.id){
                const dbConvo=await DB.getOrCreateConversation(GS.user.id,c.id);
                if(dbConvo)convo.dbId=dbConvo.id;
              }
              GS.activeChatId=convo.id;refresh();nav("chatroom");
            }} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:20,padding:"9px 20px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textH,cursor:"pointer"}}>
              직접 문의하기
            </button>
          </div>
        )}
      </div>}

      {/* ── 소개 탭 ── */}
      {tab==="about"&&<div style={{padding:"20px 20px 0"}}>
        {/* 소개 섹션 */}
        {(c.bio||GS.user.bio)&&<div style={{marginBottom:24}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,letterSpacing:"0.08em",color:"#BBBBBB",marginBottom:10,textTransform:"uppercase"}}>Танилцуулга</div>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textB,lineHeight:1.9}}>{c.bio||GS.user.bio}</div>
        </div>}
        {/* 스튜디오 정보 */}
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,letterSpacing:"0.08em",color:"#BBBBBB",marginBottom:12,textTransform:"uppercase"}}>Мэдээлэл</div>
          {[
            ["Мэргэшил", c.field||GS.user.field||"—"],
            ["Нийт бүтээл", String(creatorWorks?.length||c.works||GS.myWorks.length||0)+"ш"],
            ["Үнэлгээ", c.rating>0?(Number(c.rating).toFixed(1)+" ★"):"—"],
            ["Дагагч", String(followerCount)+"хн"],
          ].map(r=>(
            <div key={r[0]} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.s2}`}}>
              <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textDim}}>{r[0]}</span>
              <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:500,color:T.textH}}>{r[1]}</span>
            </div>
          ))}
        </div>
        {/* 태그/전문 분야 */}
        {(c.tags||GS.user.tags||[]).length>0&&<div style={{marginBottom:20}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,letterSpacing:"0.08em",color:"#BBBBBB",marginBottom:10,textTransform:"uppercase"}}>Чиглэл</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
            {(c.tags||GS.user.tags||[]).map(t=>(
              <span key={t} style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:500,color:"#444444",background:T.s2,border:`1px solid ${T.border}`,padding:"6px 14px",borderRadius:20}}>{t}</span>
            ))}
          </div>
        </div>}
      </div>}

      <div style={{height:60}}/>
    </div>

    {/* 하단 고정 CTA */}
    {tab==="commission"&&c.comm&&creatorId!==GS.user.id&&(
      <div style={{padding:"12px 20px calc(16px + env(safe-area-inset-bottom,0px))",background:"#FFFFFF",borderTop:`1px solid ${T.border}`}}>
        <PBtn full onClick={()=>nav("commission",{creatorId:c.id})}>Захиалга өгөх</PBtn>
      </div>
    )}
  </div>;
}
