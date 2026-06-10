"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
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
  const [inputFocused,setInputFocused]=useState(false);
  const [recentSearches,setRecentSearches]=useState([]);
  const [visibleCount,setVisibleCount]=useState(12);

  // Load recent searches from localStorage on mount
  useEffect(()=>{
    try{
      const saved=JSON.parse(localStorage.getItem("toono-recent-searches")||"[]");
      if(Array.isArray(saved)) setRecentSearches(saved);
    }catch{}
  },[]);

  // Save to recent searches when debounced query fires
  useEffect(()=>{
    if(!debouncedQ.trim()) return;
    setRecentSearches(prev=>{
      const updated=[debouncedQ.trim(),...prev.filter(s=>s!==debouncedQ.trim())].slice(0,10);
      try{localStorage.setItem("toono-recent-searches",JSON.stringify(updated));}catch{}
      return updated;
    });
  },[debouncedQ]);

  const removeRecent=(term)=>{
    setRecentSearches(prev=>{
      const updated=prev.filter(s=>s!==term);
      try{localStorage.setItem("toono-recent-searches",JSON.stringify(updated));}catch{}
      return updated;
    });
  };
  const clearRecent=()=>{
    setRecentSearches([]);
    try{localStorage.removeItem("toono-recent-searches");}catch{}
  };
  const applySearch=(term)=>{
    setQ(term);setDebouncedQ(term);setInputFocused(false);setVisibleCount(12);
  };
  const [tab,setTab]=useState("works");
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
  // Load users when on users tab — search if query, else load all
  const abortRef = React.useRef(null);
  useEffect(()=>{
    if(tab!=="users"){setUserResults([]);setUserLoading(false);return;}
    if(abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    setUserLoading(true);
    const fetch = debouncedQ.trim()
      ? DB.searchProfiles(debouncedQ)
      : DB.getAllProfiles(50); // 검색어 없으면 전체 유저 로드
    fetch.then(res=>{
      if(!signal.aborted){setUserResults(res||[]);setUserLoading(false);}
    }).catch(()=>{if(!signal.aborted) setUserLoading(false);});
    return ()=>{ abortRef.current?.abort(); };
  },[debouncedQ,tab]);
  const tFollow=id=>{GS.following.has(id)?GS.following.delete(id):GS.following.add(id);saveGS();refresh();if(GS.user.id)DB.toggleFollow(GS.user.id,id);};
  const tLike=id=>{GS.liked.has(id)?GS.liked.delete(id):GS.liked.add(id);saveGS();refresh();if(GS.user.id)DB.toggleLike(GS.user.id,id);};
  const tSave=id=>{GS.saved.has(id)?GS.saved.delete(id):GS.saved.add(id);saveGS();refresh();if(GS.user.id)DB.toggleSave(GS.user.id,id);};

  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg,position:"relative"}}>
    <div style={{padding:"20px 20px 12px",flexShrink:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:26,fontWeight:800,color:T.textH,lineHeight:1.05,letterSpacing:"-0.02em"}}>Хайлт</div>
        <button type="button" onClick={()=>setFilterOpen(true)} style={{position:"relative",width:42,height:42,borderRadius:12,background:af>0?T.accent:T.s1,border:`1px solid ${af>0?T.accent:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:af>0?"#fff":T.textSub}}>
          <IcFilter/>
          {af>0&&<div style={{position:"absolute",top:-4,right:-4,width:16,height:16,borderRadius:"50%",background:T.red,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:9,fontWeight:700,color:"#fff"}}>{af}</span></div>}
        </button>
      </div>
      <div style={{position:"relative"}}>
        <div style={{background:T.s1,border:`1px solid ${inputFocused?T.accent:T.border}`,borderRadius:14,padding:"11px 14px",display:"flex",alignItems:"center",gap:10,transition:"border-color .15s"}}>
          <span style={{color:T.textSub,display:"flex"}}><IcSearch/></span>
          <input
            value={q}
            onChange={e=>handleSearch(e.target.value)}
            onFocus={()=>setInputFocused(true)}
            onBlur={()=>setTimeout(()=>setInputFocused(false),150)}
            placeholder="Хайлт..."
            style={{background:"none",border:"none",outline:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,flex:1}}
          />
          {q&&<button type="button" onClick={()=>{setQ("");setDebouncedQ("");setInputFocused(false);}} style={{background:"none",border:"none",color:T.textSub,cursor:"pointer",display:"flex"}}><IcX/></button>}
        </div>
        {/* Recent searches dropdown — shown on focus when there are saved terms */}
        {inputFocused&&recentSearches.length>0&&(
          <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:T.s1,border:`1px solid ${T.border}`,borderRadius:14,zIndex:50,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",overflow:"hidden"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px 6px"}}>
              <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,color:T.textSub,letterSpacing:".04em"}}>СҮҮЛИЙН ХАЙЛТ</span>
              <button type="button" onClick={clearRecent} style={{background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,color:T.accent,cursor:"pointer"}}>Бүгдийг устгах</button>
            </div>
            {recentSearches.map(term=>(
              <div key={term} style={{display:"flex",alignItems:"center",padding:"9px 14px",cursor:"pointer"}} onClick={()=>applySearch(term)}>
                <span style={{color:T.textSub,display:"flex",marginRight:10,flexShrink:0}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M6.5 1C3.46 1 1 3.46 1 6.5S3.46 12 6.5 12 12 9.54 12 6.5 9.54 1 6.5 1z" stroke="currentColor" strokeWidth="1.3"/><path d="M13 13l-2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                </span>
                <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textH,flex:1}}>{term}</span>
                <button type="button" onClick={e=>{e.stopPropagation();removeRecent(term);}} style={{background:"none",border:"none",color:T.textSub,cursor:"pointer",display:"flex",padding:4}}>
                  <IcX/>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,flexShrink:0}}>
      {[["works","Бүтээл"],["creators","Бүтээлч"],["users","Хэрэглэгч"]].map(t=><button type="button" key={t[0]} onClick={()=>setTab(t[0])} style={{flex:1,padding:"11px 0",background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:tab===t[0]?700:500,color:tab===t[0]?T.accent:T.textSub,borderBottom:`2px solid ${tab===t[0]?T.accent:"transparent"}`,cursor:"pointer"}}>{t[1]}{(debouncedQ||cat!=="all")&&t[0]!=="users"?` ${t[0]==="works"?fw.length:fc.length}`:""}</button>)}
    </div>
    {/* 카테고리 칩 — 검색어가 없을 때만 표시 */}
    <div style={{padding:"8px 20px 8px",display:"flex",gap:7,overflowX:"auto",scrollbarWidth:"none",flexShrink:0,borderBottom:`1px solid ${T.border}`}}>
      {cats.map(c=><button type="button" key={c} onClick={()=>{
        setCat(c);
        // 특정 카테고리 선택 시 자동으로 작품 탭으로 전환
        if(c!=="all") setTab("works");
      }} style={{flexShrink:0,padding:"5px 12px",borderRadius:20,cursor:"pointer",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:cat===c?700:500,background:cat===c?T.accent:T.s1,border:`1px solid ${cat===c?T.accent:T.border}`,color:cat===c?"#fff":T.textSub,whiteSpace:"nowrap"}}>{c==="all"?"Бүгд":c}</button>)}
    </div>
    <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none",padding:"0 20px"}}>

      {/* ── Empty query: recent searches + popular categories ── */}
      {!debouncedQ.trim()&&<>
        {recentSearches.length>0&&<div style={{marginBottom:20,paddingTop:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:600,color:T.textSub,letterSpacing:".04em"}}>СҮҮЛИЙН ХАЙЛТ</div>
            <button type="button" onClick={clearRecent} style={{background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,color:T.accent,cursor:"pointer"}}>Бүгдийг устгах</button>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {recentSearches.map(term=>(
              <div key={term} style={{display:"inline-flex",alignItems:"center",gap:6,background:T.s2,border:`1px solid ${T.border}`,borderRadius:20,padding:"6px 12px",cursor:"pointer"}} onClick={()=>applySearch(term)}>
                <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textH}}>{term}</span>
                <button type="button" onClick={e=>{e.stopPropagation();removeRecent(term);}} style={{background:"none",border:"none",color:T.textSub,cursor:"pointer",display:"flex",padding:0,lineHeight:1}}><IcX/></button>
              </div>
            ))}
          </div>
        </div>}
      </>}

      {/* ── Results: always show on works/creators tabs ── */}
      {<>
        {tab==="creators"&&(fc.length===0
          ?<div style={{padding:"32px 0",textAlign:"center"}}>
            <div style={{marginBottom:8}}><IcSearchEmpty/></div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:600,color:T.textH,marginBottom:4}}>{debouncedQ ? `"${debouncedQ}" — бүтээлч олдсонгүй` : `${cat} — бүтээлч олдсонгүй`}</div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub,marginBottom:16}}>Өөр ангилал эсвэл түлхүүр үг оруулж үзнэ үү</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
              {cats.filter(c=>c!=="all").slice(0,4).map(c=><button type="button" key={c} onClick={()=>{setCat(c);setQ("");setDebouncedQ("");}} style={{padding:"6px 14px",borderRadius:20,background:T.s2,border:`1px solid ${T.border}`,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,color:T.textSub,cursor:"pointer"}}>{c}</button>)}
            </div>
          </div>
          :fc.map(c=><CreatorRow key={c.id} creator={c} onClick={()=>nav("profile",{creatorId:c.id})} onFollow={tFollow} showFollow following={GS.following.has(c.id)}/>))}
        {tab==="works"&&(fw.length===0
          ?<div style={{padding:"32px 0",textAlign:"center"}}>
            <div style={{marginBottom:8}}><IcSearchEmpty/></div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:600,color:T.textH,marginBottom:4}}>{debouncedQ ? `"${debouncedQ}" — бүтээл олдсонгүй` : `${cat} — бүтээл олдсонгүй`}</div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub,marginBottom:16}}>Өөр ангилал эсвэл түлхүүр үг оруулж үзнэ үү</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
              {cats.filter(c=>c!=="all").slice(0,4).map(c=><button type="button" key={c} onClick={()=>{setCat(c);setQ("");setDebouncedQ("");}} style={{padding:"6px 14px",borderRadius:20,background:T.s2,border:`1px solid ${T.border}`,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,color:T.textSub,cursor:"pointer"}}>{c}</button>)}
            </div>
          </div>
          :<div>
            <div className="toono-grid-2" style={{paddingTop:8,paddingBottom:8,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"26px 16px"}}>
              {fw.slice(0,visibleCount).map(w=><WorkCard key={w.id} work={w} onClick={()=>nav("work",{workId:w.id})} onToggleLike={tLike} onToggleSave={tSave}/>)}
            </div>
            {fw.length>visibleCount&&<div style={{textAlign:"center",padding:"16px 0"}}>
              <button type="button" onClick={()=>setVisibleCount(v=>v+12)} style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,padding:"12px 32px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.accent,cursor:"pointer"}}>Дараагийнхыг харах ({fw.length-visibleCount} үлдсэн)</button>
            </div>}
          </div>)}
      </>}

      {/* ── 유저 탭 ── */}
      {tab==="users"&&<div style={{paddingTop:8}}>
        {userLoading
            ?<div style={{textAlign:"center",padding:"40px 0",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub}}>Хайж байна...</div>
            :userResults.length===0
              ?<div style={{padding:"32px 0",textAlign:"center"}}>
                <div style={{marginBottom:8}}><IcSearchEmpty/></div>
                <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:600,color:T.textH,marginBottom:4}}>"{debouncedQ}" — хэрэглэгч олдсонгүй</div>
                <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub}}>Нэрийг зөв бичсэн эсэхийг шалгаарай</div>
              </div>
              :userResults.map(u=><div key={u.id} onClick={()=>nav("profile",{creatorId:u.id})} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}>
                <div style={{width:48,height:48,borderRadius:16,background:T.accentSub,border:`1px solid ${T.accentGlow}`,overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
                  {u.photo
                    ? (u.photo.startsWith("data:")
                        ? <img src={u.photo} alt={u.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        : <Image src={u.photo} fill alt={u.name} sizes="48px" style={{objectFit:"cover"}}/>)
                    : <Toono size={28} color={T.accent}/>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:700,color:T.textH,marginBottom:2}}>{u.name}</div>
                  <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub}}>{u.field||"Үлгэр хэрэглэгч"}</div>
                </div>
                <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:8,background:u.role==="creator"?T.accentSub:T.s2,color:u.role==="creator"?T.accent:T.textSub}}>{u.role==="creator"?"Бүтээлч":"Худалдан авагч"}</span>
              </div>)}
      </div>}

      <div style={{height:20}}/>
    </div>
    {filterOpen&&<div onClick={()=>setFilterOpen(false)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.6)",zIndex:90}}>
      <div onClick={e=>e.stopPropagation()} style={{position:"absolute",bottom:0,left:0,right:0,background:T.s1,borderRadius:"22px 22px 0 0",padding:"20px 20px 36px"}}>
        <div style={{width:36,height:4,borderRadius:2,background:T.border,margin:"0 auto 20px"}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:17,fontWeight:700,color:T.textH}}>Шүүлт</div>
          <button type="button" onClick={()=>{setCat("all");setPrice("all");setCommOnly(false);}} style={{background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.accent,cursor:"pointer"}}>Цэвэрлэх</button>
        </div>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:10}}>Захиалга авах</div>
        <button type="button" onClick={()=>setCommOnly(!commOnly)} style={{display:"flex",alignItems:"center",gap:12,background:"none",border:"none",cursor:"pointer",marginBottom:20}}>
          <div style={{width:44,height:26,borderRadius:13,background:commOnly?T.accent:T.border,position:"relative",transition:"background .2s"}}>
            <div style={{position:"absolute",top:3,left:commOnly?21:3,width:20,height:20,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
          </div>
          <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH}}>Захиалга авах бүтээлчид</span>
        </button>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:10}}>Үнийн хэмжээ</div>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {[["all","Бүгд"],["under100","~₮100K"],["100to300","₮100~300K"],["over300","₮300K~"]].map(pp=><button type="button" key={pp[0]} onClick={()=>setPrice(pp[0])} style={{flex:1,padding:"9px 4px",borderRadius:10,cursor:"pointer",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,background:price===pp[0]?T.accent:T.s2,border:`1px solid ${price===pp[0]?T.accent:T.border}`,color:price===pp[0]?"#fff":T.textSub}}>{pp[1]}</button>)}
        </div>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:10}}>Материал</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:24}}>
          {MATERIALS.map(m=><button type="button" key={m} onClick={()=>setMatFilter(m)} style={{padding:"6px 12px",borderRadius:20,cursor:"pointer",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,background:matFilter===m?T.greenSub:T.s2,border:`1px solid ${matFilter===m?T.green+"60":T.border}`,color:matFilter===m?T.green:T.textSub}}>{m}</button>)}
        </div>
        <PBtn full onClick={()=>setFilterOpen(false)}>Хэрэглэх</PBtn>
      </div>
    </div>}
  </div>;
}
