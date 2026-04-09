"use client";

import React, { useState, useEffect } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { getAllWorks, getCreators, fmtP } from "@/lib/utils";
import {
  IcSearch, IcFilter, IcX, IcSearchEmpty, IcCheck,
} from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Crd from "@/components/atoms/Crd";
import Pill from "@/components/atoms/Pill";
import Toono from "@/components/atoms/Toono";
import Empty from "@/components/atoms/Empty";
import WorkCard from "@/components/shared/WorkCard";
import CreatorRow from "@/components/shared/CreatorRow";

const MATERIALS = ["Бүгд","Тэмээний ноос","Хонины ноос","Эсгий","Торго","Арьс","Мод","Шаазан","Мөнгө","Хүрэл","Цаас","Дижитал","3D Принт"];

export default function Explore({ nav, refresh, goBack }) {
  const [q,setQ]=useState("");
  const [debouncedQ,setDebouncedQ]=useState("");
  const debounceRef=React.useRef(null);
  const handleSearch=(val)=>{setQ(val);setVisibleCount(12);clearTimeout(debounceRef.current);debounceRef.current=setTimeout(()=>setDebouncedQ(val),300);};
  const [matFilter,setMatFilter]=useState("Бүгд");
  const [recentSearches]=useState([]);
  const [visibleCount,setVisibleCount]=useState(12);
  const [tab,setTab]=useState("creators");
  const [cat,setCat]=useState("all");
  const [sort,setSort]=useState("popular");
  const [filterOpen,setFilterOpen]=useState(false);
  const [commOnly,setCommOnly]=useState(false);
  const [price,setPrice]=useState("all");
  const [userResults,setUserResults]=useState([]);
  const [userLoading,setUserLoading]=useState(false);
  const cats=["all","Fashion Design","Interior Design","Jewelry Design","Industrial Design","Graphic Design","Textile Design","Fine Art","3D Design","Photography"];
  const af=(cat!=="all"?1:0)+(price!=="all"?1:0)+(commOnly?1:0);
  const fc=getCreators().filter(c=>{
    if(debouncedQ&&!c.name.toLowerCase().includes(debouncedQ.toLowerCase())&&!c.field.includes(debouncedQ))return false;
    if(cat!=="all"&&!c.field.includes(cat))return false;
    if(commOnly&&!c.comm)return false;
    return true;
  });
  const fw=getAllWorks().filter(w=>{
    if(debouncedQ&&!w.title.toLowerCase().includes(debouncedQ.toLowerCase())&&!w.creator.toLowerCase().includes(debouncedQ.toLowerCase()))return false;
    if(matFilter!=="Бүгд"&&w.material!==matFilter)return false;
    if(cat!=="all"&&w.cat!==cat)return false;
    if(price==="under100"&&w.price>=100000)return false;
    if(price==="100to300"&&(w.price<100000||w.price>300000))return false;
    if(price==="over300"&&w.price<300000)return false;
    return true;
  });
  // Search all users when on users tab
  useEffect(()=>{
    if(tab!=="users"||!debouncedQ.trim()){setUserResults([]);return;}
    setUserLoading(true);
    DB.searchProfiles(debouncedQ).then(res=>{setUserResults(res);setUserLoading(false);});
  },[debouncedQ,tab]);
  const tFollow=id=>{GS.following.has(id)?GS.following.delete(id):GS.following.add(id);refresh();if(GS.user.id)DB.toggleFollow(GS.user.id,id);};
  const tLike=id=>{GS.liked.has(id)?GS.liked.delete(id):GS.liked.add(id);refresh();if(GS.user.id)DB.toggleLike(GS.user.id,id);};
  const tSave=id=>{GS.saved.has(id)?GS.saved.delete(id):GS.saved.add(id);refresh();if(GS.user.id)DB.toggleSave(GS.user.id,id);};

  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg,position:"relative"}}>
    <div style={{padding:"20px 20px 12px",flexShrink:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:24,fontWeight:800,color:T.textH}}>Хайлт</div>
        <button onClick={()=>setFilterOpen(true)} style={{position:"relative",width:42,height:42,borderRadius:12,background:af>0?T.accent:T.s1,border:`1px solid ${af>0?T.accent:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:af>0?"#fff":T.textSub}}>
          <IcFilter/>
          {af>0&&<div style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",background:T.red,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:9,fontWeight:700,color:"#fff"}}>{af}</span></div>}
        </button>
      </div>
      <div style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:14,padding:"11px 14px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{color:T.textSub,display:"flex"}}><IcSearch/></span>
        <input value={q} onChange={e=>handleSearch(e.target.value)} placeholder="Хайлт..." style={{background:"none",border:"none",outline:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,flex:1}}/>
        {q&&<button onClick={()=>{setQ("");setDebouncedQ("");}} style={{background:"none",border:"none",color:T.textSub,cursor:"pointer",display:"flex"}}><IcX/></button>}
      </div>
    </div>
    <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
      {[["creators","Бүтээлч "+fc.length],["works","Бүтээл "+fw.length],["users","Хэрэглэгч"]].map(t=><button key={t[0]} onClick={()=>setTab(t[0])} style={{flex:1,padding:"11px 0",background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:tab===t[0]?700:500,color:tab===t[0]?T.accent:T.textSub,borderBottom:`2px solid ${tab===t[0]?T.accent:"transparent"}`,cursor:"pointer"}}>{t[1]}</button>)}
    </div>
    <div style={{padding:"10px 20px 0",display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none",flexShrink:0}}>
      {cats.map(c=><button key={c} onClick={()=>setCat(c)} style={{flexShrink:0,padding:"6px 14px",borderRadius:20,cursor:"pointer",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:600,background:cat===c?T.accent:T.s1,border:`1px solid ${cat===c?T.accent:T.border}`,color:cat===c?"#fff":T.textSub}}>{c==="all"?"Бүгд":c}</button>)}
    </div>
    {/* Material filter — Creema-style */}
    {tab==="works"&&<div style={{padding:"4px 20px 0",display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",flexShrink:0}}>
      {MATERIALS.map(m=><button key={m} onClick={()=>setMatFilter(m)} style={{flexShrink:0,padding:"4px 10px",borderRadius:8,cursor:"pointer",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:10,fontWeight:600,background:matFilter===m?T.greenSub:T.s2,border:`1px solid ${matFilter===m?T.green+"60":T.border}`,color:matFilter===m?T.green:T.textSub}}>{m}</button>)}
    </div>}
    <div style={{padding:"8px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
      <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub}}>{(tab==="creators"?fc.length:fw.length)} үр дүн</div>
      <div style={{display:"flex",gap:5}}>
        {[["popular","Алдартай"],["new","Шинэ"],["works","Бүтээл"]].map(s=><button key={s[0]} onClick={()=>setSort(s[0])} style={{padding:"4px 9px",borderRadius:8,cursor:"pointer",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,background:sort===s[0]?T.accentSub:T.s1,border:`1px solid ${sort===s[0]?T.accent:T.border}`,color:sort===s[0]?T.accent:T.textSub}}>{s[1]}</button>)}
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none",padding:"0 20px"}}>
      {tab==="creators"&&(fc.length===0
        ?<Empty icon={<IcSearchEmpty/>} title="Бүтээлч олдсонгүй"/>
        :fc.map(c=><CreatorRow key={c.id} creator={c} onClick={()=>nav("profile",{creatorId:c.id})} onFollow={tFollow} showFollow/>))}
      {tab==="works"&&(fw.length===0
        ?<Empty icon={<IcSearchEmpty/>} title="Бүтээл олдсонгүй"/>
        :<div>
          <div className="toono-grid-2" style={{paddingTop:8,paddingBottom:8,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {fw.slice(0,visibleCount).map(w=><WorkCard key={w.id} work={w} onClick={()=>nav("work",{workId:w.id})} onToggleLike={tLike} onToggleSave={tSave}/>)}
          </div>
          {fw.length>visibleCount&&<div style={{textAlign:"center",padding:"16px 0"}}>
            <button onClick={()=>setVisibleCount(v=>v+12)} style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 32px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.accent,cursor:"pointer"}}>Дараагийнхыг харах ({fw.length-visibleCount} үлдсэн)</button>
          </div>}
        </div>)}
      {tab==="users"&&<div>
        {!debouncedQ.trim()
          ?<div style={{textAlign:"center",padding:"48px 20px"}}>
            <div style={{fontSize:36,marginBottom:12}}>🔍</div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:600,color:T.textH,marginBottom:6}}>Хэрэглэгч хайх</div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub}}>Дээрх хайлтанд нэр бичнэ үү</div>
          </div>
          :userLoading
            ?<div style={{textAlign:"center",padding:"40px 0",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub}}>Хайж байна...</div>
            :userResults.length===0
              ?<div style={{textAlign:"center",padding:"40px 0",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub}}>"{debouncedQ}" — олдсонгүй</div>
              :userResults.map(u=><div key={u.id} onClick={()=>nav("profile",{creatorId:u.id})} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}>
                <div style={{width:48,height:48,borderRadius:16,background:T.accentSub,border:`1px solid ${T.accentGlow}`,overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {u.photo?<img src={u.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<Toono size={28} color={T.accent}/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:700,color:T.textH,marginBottom:2}}>{u.name}</div>
                  <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub}}>{u.field||"The TOONO хэрэглэгч"}</div>
                </div>
                <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:8,background:u.role==="creator"?T.accentSub:T.s2,color:u.role==="creator"?T.accent:T.textSub}}>{u.role==="creator"?"Бүтээлч":"Худалдан авагч"}</span>
              </div>)
        }
      </div>}
      <div style={{height:20}}/>
    </div>
    {filterOpen&&<div onClick={()=>setFilterOpen(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",zIndex:90}}>
      <div onClick={e=>e.stopPropagation()} style={{position:"absolute",bottom:0,left:0,right:0,background:T.s1,borderRadius:"22px 22px 0 0",padding:"20px 20px 36px"}}>
        <div style={{width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 20px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:17,fontWeight:700,color:T.textH}}>Шүүлт</div>
          <button onClick={()=>{setCat("all");setPrice("all");setCommOnly(false);}} style={{background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.accent,cursor:"pointer"}}>Цэвэрлэх</button>
        </div>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:10}}>Захиалга</div>
        <button onClick={()=>setCommOnly(!commOnly)} style={{display:"flex",alignItems:"center",gap:12,background:"none",border:"none",cursor:"pointer",marginBottom:20}}>
          <div style={{width:44,height:26,borderRadius:13,background:commOnly?T.accent:T.border,position:"relative",transition:"background .2s"}}>
            <div style={{position:"absolute",top:3,left:commOnly?21:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
          </div>
          <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH}}>Захиалга авах Бүтээлч</span>
        </button>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:10}}>Үнийн хэмжээ</div>
        <div style={{display:"flex",gap:8,marginBottom:24}}>
          {[["all","Бүгд"],["under100","~₮100K"],["100to300","₮100~300K"],["over300","₮300K~"]].map(pp=><button key={pp[0]} onClick={()=>setPrice(pp[0])} style={{flex:1,padding:"9px 4px",borderRadius:10,cursor:"pointer",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,background:price===pp[0]?T.accent:T.s2,border:`1px solid ${price===pp[0]?T.accent:T.border}`,color:price===pp[0]?"#fff":T.textSub}}>{pp[1]}</button>)}
        </div>
        <PBtn full onClick={()=>setFilterOpen(false)}>Хэрэглэх</PBtn>
      </div>
    </div>}
  </div>;
}
