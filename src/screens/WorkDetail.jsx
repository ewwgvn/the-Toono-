"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { getAllWorks, fmtP } from "@/lib/utils";
import {
  IcBack, IcHeart, IcBookmark, IcShare, IcReport, IcX,
  IcChevron, IcMsg, IcCart, IcBell, IcCommission,
} from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Crd from "@/components/atoms/Crd";
import Avt from "@/components/atoms/Avt";
import Pill from "@/components/atoms/Pill";
import Toono from "@/components/atoms/Toono";
import BottomSheet from "@/components/layout/BottomSheet";
import { toast } from "@/components/layout/Toast";

export default function WorkDetail({ nav, refresh, goBack, workId }) {
  const w=getAllWorks().find(x=>x.id===workId)||GS.myWorks.find(x=>x.id===workId)||{id:0,title:"—",creator:"—",creator_id:null,price:0,accent:T.textH,likes:0,description:"",desc:"",sizes:[],colors:[],stock:0,images:[],tags:[],cat:"",medium:"",digital:false,badge:null,video:null,profiles:{photo:null,name:""}};
  const [offerOpen,setOfferOpen]=useState(false);
  const [zoomOpen,setZoomOpen]=useState(false);
  const [touchStart,setTouchStart]=useState(null);
  const [offerPrice,setOfferPrice]=useState("");
  const [offerMsg,setOfferMsg]=useState("");
  // Track recently viewed
  React.useEffect(()=>{
    if(w?.id && !GS.recentlyViewed.includes(w.id)){
      GS.recentlyViewed = [w.id, ...GS.recentlyViewed.filter(id=>id!==w.id)].slice(0,20);
      saveGS();
    }
  },[w?.id]);
  const [selSize,setSelSize]=useState(w.sizes?.[0]||null);
  const [selColor,setSelColor]=useState(w.colors?.[0]||null);
  const [qty,setQty]=useState(1);
  const [liked,setLiked]=useState(GS.liked.has(w.id));
  const [saved,setSaved]=useState(GS.saved.has(w.id));
  const [imgIdx,setImgIdx]=useState(0);
  const [comments,setComments]=useState([]);
  const [commentInput,setCommentInput]=useState("");
  const tLike=()=>{const v=!liked;if(v)GS.liked.add(w.id);else GS.liked.delete(w.id);setLiked(v);saveGS();refresh();if(GS.user.id)DB.toggleLike(GS.user.id,w.id);};
  const tSave=()=>{const v=!saved;if(v)GS.saved.add(w.id);else GS.saved.delete(w.id);setSaved(v);saveGS();refresh();if(GS.user.id)DB.toggleSave(GS.user.id,w.id);};

  // Load comments
  React.useEffect(()=>{
    if(w?.id && isSupabaseReady()){
      DB.getComments(w.id).then(list=>setComments(list||[]));
    }
  },[w?.id]);

  // ESC key closes zoom modal
  React.useEffect(()=>{
    if(!zoomOpen) return;
    const handleKey=(e)=>{
      if(e.key==="Escape") setZoomOpen(false);
      if(e.key==="ArrowLeft"&&imgIdx>0) setImgIdx(i=>Math.max(0,i-1));
      if(e.key==="ArrowRight"&&(w.images?.length||0)>1) setImgIdx(i=>Math.min((w.images?.length||1)-1,i+1));
    };
    window.addEventListener("keydown",handleKey);
    return ()=>window.removeEventListener("keydown",handleKey);
  },[zoomOpen,imgIdx,w.images]);

  const submitComment = async () => {
    if(!commentInput.trim()||!GS.user.id) return;
    const added = await DB.addComment(w.id, GS.user.id, commentInput.trim());
    if(added) setComments(prev=>[added,...prev]);
    setCommentInput("");
  };

  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg}}>
    {/* 플로팅 헤더 */}
    <div style={{padding:"16px 16px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:`1px solid ${T.s2}`}}>
      <button type="button" onClick={()=>goBack?goBack():nav("home")} className="toono-pressable" style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",color:T.textH,padding:"4px 0"}}>
        <IcBack/>
        <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:600,color:T.textH}}>Буцах</span>
      </button>
      <div style={{display:"flex",gap:4}}>
        {[
          {fn:tLike,  Icon:()=><IcHeart filled={liked}/>,  color:liked?T.red:T.textSub},
          {fn:tSave,  Icon:()=><IcBookmark filled={saved}/>,color:saved?T.textH:T.textSub},
          {fn:()=>{navigator.clipboard?.writeText(`${location.origin}?work=${w.id}`).catch(()=>{});toast("Холбоос хуулагдлаа","success");}, Icon:()=><IcShare/>, color:T.textSub},
        ].map(({fn,Icon,color},i)=>(
          <button key={i} type="button" onClick={fn} className="toono-pressable" style={{width:36,height:36,borderRadius:10,background:T.s2,border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color}}><Icon/></button>
        ))}
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none"}}>
      {/* Fullscreen zoom modal */}
      {zoomOpen&&<div onClick={()=>setZoomOpen(false)} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.95)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
        <button type="button" onClick={()=>setZoomOpen(false)} style={{position:"absolute",top:20,right:20,background:"rgba(255,255,255,0.15)",border:"none",borderRadius:12,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",zIndex:1001}}><IcX/></button>
        <img src={w.images[imgIdx||0]} alt="" style={{maxWidth:"95vw",maxHeight:"85vh",objectFit:"contain",borderRadius:8}}
          onTouchStart={e=>setTouchStart(e.touches[0].clientX)}
          onTouchEnd={e=>{if(!touchStart)return;const diff=e.changedTouches[0].clientX-touchStart;if(Math.abs(diff)>50){if(diff<0&&imgIdx<w.images.length-1)setImgIdx(imgIdx+1);if(diff>0&&imgIdx>0)setImgIdx(imgIdx-1);}setTouchStart(null);}}
        />
        {w.images.length>1&&<div style={{display:"flex",gap:8,marginTop:16}}>
          {w.images.map((_,i)=><button type="button" key={i} onClick={e=>{e.stopPropagation();setImgIdx(i);}} style={{width:i===(imgIdx||0)?24:10,height:10,borderRadius:5,background:i===(imgIdx||0)?"#fff":"rgba(255,255,255,0.3)",border:"none",cursor:"pointer",transition:"all .2s"}}/>)}
        </div>}
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:10}}>{(imgIdx||0)+1} / {w.images.length} · Зүүн баруун шудрах</div>
      </div>}
      {/* Hero image / gallery */}
      {w.images?.length>0
        ?<div style={{margin:"0 20px",borderRadius:20,overflow:"hidden",position:"relative",cursor:"zoom-in",background:T.s2}} onClick={()=>setZoomOpen(true)}
          onTouchStart={e=>setTouchStart(e.touches[0].clientX)}
          onTouchEnd={e=>{if(!touchStart)return;const diff=e.changedTouches[0].clientX-touchStart;if(Math.abs(diff)>50){e.stopPropagation();if(diff<0&&imgIdx<w.images.length-1)setImgIdx(imgIdx+1);if(diff>0&&imgIdx>0)setImgIdx(imgIdx-1);setZoomOpen(false);}setTouchStart(null);}}>
          <img
            src={w.images[imgIdx||0]}
            alt={w.title}
            loading="eager"
            style={{width:"100%",height:"auto",display:"block",maxHeight:"60vh",objectFit:"contain",background:T.s2}}
          />
          {w.images.length>1&&<div style={{position:"absolute",bottom:12,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6}}>
            {w.images.map((_,i)=><button type="button" key={i} onClick={e=>{e.stopPropagation();setImgIdx(i);}} style={{width:i===(imgIdx||0)?20:8,height:8,borderRadius:4,background:i===(imgIdx||0)?"#fff":"rgba(255,255,255,0.4)",border:"none",cursor:"pointer",transition:"all .2s"}}/>)}
          </div>}
          {w.badge&&<span style={{position:"absolute",top:14,left:14,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:700,color:"#fff",background:"#2681DA",padding:"5px 12px",borderRadius:10}}>{w.badge}</span>}
          {w.images.length>1&&<div style={{position:"absolute",bottom:14,right:14,background:"rgba(0,0,0,0.5)",borderRadius:10,padding:"6px 12px",display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:"#fff"}}>{(imgIdx||0)+1}/{w.images.length}</span>
          </div>}
        </div>
        :<div style={{height:260,background:`linear-gradient(135deg,#1A2A5A,${w.accent},#1A2A5A)`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",margin:"0 20px",borderRadius:20}}>
          <div style={{opacity:.25}}><Toono size={200} color="#fff"/></div>
          {w.badge&&<span style={{position:"absolute",top:14,left:14,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:700,color:"#fff",background:"#2681DA",padding:"5px 12px",borderRadius:10}}>{w.badge}</span>}
          <div style={{position:"absolute",bottom:14,right:14,background:"rgba(0,0,0,0.5)",borderRadius:10,padding:"6px 12px"}}>
            <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textB}}><IcHeart/> {(w.likes||0).toLocaleString()}</span>
          </div>
        </div>}
      {/* Video if available */}
      {w.video&&<div style={{margin:"10px 20px 0",borderRadius:14,overflow:"hidden"}}>
        <video src={w.video} controls style={{width:"100%",maxHeight:200,objectFit:"cover",display:"block",background:T.s2}}/>
      </div>}
      <div style={{padding:"18px 20px 0"}}>
        <div style={{marginBottom:12}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:22,fontWeight:800,color:T.textH,lineHeight:1.2,letterSpacing:"-0.02em",marginBottom:6}}>{w.title}</div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{display:"inline-block",width:7,height:7,background:T.accent,transform:"rotate(45deg)"}}/>
            <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:24,fontWeight:800,color:T.accent,letterSpacing:"-0.01em"}}>{fmtP(w)}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          {[w.cat,...(w.tags||[])].filter(Boolean).map(t=><Pill key={t}>{t}</Pill>)}
        </div>
        <Crd onClick={()=>nav("profile",{creatorId:w.creator_id})} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
          <Avt size={44} color={w.accent||T.accent} photo={w.profiles?.photo}/>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:700,color:T.textH}}>{w.creator||GS.user.name}</div>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub}}>{w.cat||"Бүтээлч"}</div>
          </div>
          <span style={{color:T.textSub}}><IcChevron/></span>
        </Crd>
        <div style={{height:1,background:T.border}}/>
        <div style={{padding:"16px 0"}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:700,letterSpacing:'0.22em',textTransform:'uppercase',color:T.accent,marginBottom:10}}>ТАЙЛБАР</div>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textB,lineHeight:1.8}}>{w.description||w.desc||""}</div>
        </div>
        {/* ── 스펙 칩 인라인 미리보기 ── */}
        {(w.medium||w.sizes?.length>0||w.duration)&&<div style={{marginBottom:8}}>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {w.medium&&w.medium!=="—"&&<span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:500,color:"#555",background:T.s2,padding:"4px 10px",borderRadius:20,border:`1px solid ${T.border}`}}>{w.medium}</span>}
            {w.sizes?.map(s=><span key={s} style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:500,color:"#555",background:T.s2,padding:"4px 10px",borderRadius:20,border:`1px solid ${T.border}`}}>{s}</span>)}
            {w.duration&&<span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:500,color:"#555",background:T.s2,padding:"4px 10px",borderRadius:20,border:`1px solid ${T.border}`}}>{w.duration}</span>}
            {w.stock>0&&<span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:500,color:"#555",background:T.s2,padding:"4px 10px",borderRadius:20,border:`1px solid ${T.border}`}}>{w.stock}ш</span>}
          </div>
        </div>}
        {/* Comments section */}
        <div style={{marginTop:4,marginBottom:24,borderTop:`1px solid ${T.borderLight}`,paddingTop:16}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:30,fontWeight:700,color:T.textH,marginBottom:12,lineHeight:1}}>Сэтгэгдэл {comments.length>0?`(${comments.length})`:""}</div>
          {GS.user.id && <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center"}}>
            <Avt size={32} photo={GS.user.photo}/>
            <input value={commentInput} onChange={e=>setCommentInput(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&commentInput.trim())submitComment();}}
              placeholder="Сэтгэгдэл бичих..." className="feed-comment-input"
              style={{flex:1,background:T.s2,border:`1px solid ${T.border}`,borderRadius:20,padding:"10px 14px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textH,outline:"none"}}/>
            {commentInput.trim() && <PBtn small onClick={submitComment}>Илгээх</PBtn>}
          </div>}
          {comments.length===0
            ?<div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub,textAlign:"center",padding:"12px 0"}}>Сэтгэгдэл байхгүй</div>
            :comments.map(c=><div key={c.id} style={{display:"flex",gap:10,padding:"10px 0",borderBottom:`1px solid ${T.borderLight}`}}>
              <Avt size={32} photo={c.profiles?.photo}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:600,color:T.textH,marginBottom:2}}>{c.profiles?.name||"User"}</div>
                <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textB,lineHeight:1.5}}>{c.text}</div>
              </div>
            </div>)}
        </div>
        {(()=>{
          const more=getAllWorks().filter(ww=>ww.id!==w.id&&(ww.creator_id===w.creator_id||ww.cid===w.cid)).slice(0,6);
          if(more.length===0) return null;
          return <div style={{marginTop:4}}>
            <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:30,fontWeight:700,color:T.textH,marginBottom:12,lineHeight:1}}>Бүтээлчийн бусад бүтээл</div>
            <div style={{display:"flex",gap:12,overflowX:"auto",scrollbarWidth:"none"}}>
              {more.map(ww=><div key={ww.id} onClick={()=>nav("work",{workId:ww.id})} className="toono-card-tap" style={{flexShrink:0,width:130,cursor:"pointer"}}>
                <div style={{width:130,height:160,borderRadius:14,background:T.s2,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:7,overflow:"hidden"}}>
                  {ww.images?.[0] ? <img src={ww.images[0]} alt={ww.title} loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <Toono size={40} color="#DADADA"/>}
                </div>
                <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:600,color:T.textH,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ww.title}</div>
                <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textH,fontWeight:700}}>{fmtP(ww)}</div>
              </div>)}
            </div>
          </div>;
        })()}
        <div style={{height:20}}/>
      </div>
    </div>
    {/* Offer Bottom Sheet */}
    <BottomSheet open={offerOpen} onClose={()=>setOfferOpen(false)} title="Үнийн санал илгээх" height="50%">
      <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub,marginBottom:14}}>Бүтээлчид хүссэн үнэ санал болгоно. Хариуг хүлээнэ үү.</div>
      <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:600,color:T.textSub,marginBottom:6}}>Анхны үнэ: {fmtP(w)}</div>
      <input type="number" value={offerPrice} onChange={e=>setOfferPrice(e.target.value)} placeholder="Санал болгох үнэ (₮)" style={{width:"100%",background:T.s2,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 16px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:16,fontWeight:700,color:T.textH,outline:"none",marginBottom:12,boxSizing:"border-box"}}/>
      <textarea value={offerMsg} onChange={e=>setOfferMsg(e.target.value)} placeholder="Зурвас (заавал биш)" rows={3} style={{width:"100%",background:T.s2,border:`1px solid ${T.border}`,borderRadius:13,padding:"12px 16px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,outline:"none",resize:"none",marginBottom:16,boxSizing:"border-box"}}/>
      <PBtn full disabled={!offerPrice || Number(offerPrice) <= 0} onClick={async ()=>{
        const price = Number(offerPrice);
        if(price<=0){toast("Үнэ зөв оруулна уу","error");return;}
        const newOffer = {id:Date.now(),workId:w.id,workTitle:w.title,price,msg:offerMsg,status:"pending",date:new Date().toLocaleDateString()};
        if(isSupabaseReady()&&GS.user.id&&w.id){
          const saved = await DB.createOffer({buyer_id:GS.user.id,work_id:w.id,price,message:offerMsg,status:"pending"});
          if(saved) newOffer.id = saved.id;
        }
        GS.offers.push(newOffer);
        GS.notifications.unshift({id:Date.now(),icon:"comm",title:"Үнийн санал илгээлээ",desc:`${w.title} — ₮${price.toLocaleString()}`,time:"Сая",read:true,to:"me"});
        setOfferOpen(false);setOfferPrice("");setOfferMsg("");
        refresh();toast("Үнийн санал илгээлээ","success");
      }}>Санал илгээх</PBtn>
    </BottomSheet>
    {/* 사이즈/색상 선택 */}
    {(w.sizes?.length>0||w.colors?.length>0)&&<div style={{padding:"8px 20px 0",background:T.bg}}>
      {w.sizes?.length>0&&<div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
        <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.textSub,width:"100%",marginBottom:2}}>Хэмжээ</span>
        {w.sizes.map(s=><button type="button" key={s} onClick={()=>setSelSize(s)} style={{padding:"5px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:600,background:selSize===s?T.accent:T.s1,border:`1px solid ${selSize===s?T.accent:T.border}`,color:selSize===s?"#fff":T.textSub}}>{s}</button>)}
      </div>}
      {w.colors?.length>0&&<div style={{display:"flex",gap:7,marginBottom:8,alignItems:"center"}}>
        <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.textSub}}>Өнгө</span>
        {w.colors.map(cl=><button type="button" key={cl} onClick={()=>setSelColor(cl)} style={{width:26,height:26,borderRadius:13,background:cl,border:selColor===cl?`3px solid ${T.accent}`:`2px solid ${T.border}`,cursor:"pointer"}}/>)}
      </div>}
    </div>}

    {/* 액션 바 — 수량 + 버튼 한 줄 */}
    <div style={{padding:"10px 16px calc(14px + env(safe-area-inset-bottom,0px))",background:T.bg,borderTop:`1px solid ${T.border}`,display:"flex",gap:8,alignItems:"center"}}>

      {/* 수량 (구매 가능할 때만) */}
      {w.price>0&&(w.stock===undefined||w.stock>0)&&!(w.creator_id===GS.user.id||w.cid===GS.user.id)&&<div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
        <button type="button" onClick={()=>setQty(Math.max(1,qty-1))} style={{width:28,height:28,borderRadius:8,background:T.s2,border:`1px solid ${T.border}`,color:T.textH,cursor:"pointer",fontWeight:700,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
        <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:700,color:T.textH,minWidth:20,textAlign:"center"}}>{qty}</span>
        <button type="button" onClick={()=>setQty(Math.min(w.stock||99,qty+1))} style={{width:28,height:28,borderRadius:8,background:T.s2,border:`1px solid ${T.border}`,color:T.textH,cursor:"pointer",fontWeight:700,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
      </div>}

      {/* 채팅 아이콘 버튼 */}
      <button type="button" aria-label="Зурвас" className="toono-pressable" onClick={async ()=>{
        if(!w.creator_id&&!w.creator){toast("Бүтээлч мэдээлэл байхгүй","error");return;}
        let convo = GS.conversations.find(cv=>(w.creator_id&&cv.creatorId===w.creator_id)||cv.name===(w.creator||GS.user.name));
        if(!convo){convo={id:Date.now(),creatorId:w.creator_id||null,name:w.creator||"Бүтээлч",accent:w.accent||T.accent,online:false,unread:0,msgs:[]};GS.conversations.unshift(convo);saveGS();}
        if(isSupabaseReady()&&GS.user.id&&w.creator_id&&GS.user.id!==w.creator_id){
          const dbConvo=await DB.getOrCreateConversation(GS.user.id,w.creator_id);
          if(dbConvo){convo.dbId=dbConvo.id;saveGS();}
        }
        GS.activeChatId=convo.id;refresh();nav("chatroom");
      }} style={{width:42,height:42,background:T.s2,border:`1px solid ${T.border}`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,color:T.textH}}><IcMsg/></button>

      {/* 내 작품 표시 */}
      {(w.creator_id===GS.user.id||w.cid===GS.user.id) ? (
        <div style={{flex:1,textAlign:"center",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub}}>Энэ таны бүтээл</div>

      /* 판매 가능한 작품 */
      ) : w.price>0&&(w.stock===undefined||w.stock>0) ? (
        <>
          <button type="button" className="toono-pressable" onClick={()=>{
            const cartItem={...w,size:selSize,color:selColor,qty};
            const exists=GS.cart.find(c=>c.id===w.id&&c.size===selSize&&c.color===selColor);
            if(!exists){GS.cart.push(cartItem);saveGS();}
            toast(exists?"Сагсанд байна":"Сагсанд нэмэгдлээ",exists?"info":"success");refresh();
          }} style={{width:42,height:42,background:T.s2,border:`1px solid ${T.border}`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,color:T.textH}}><IcCart/></button>
          <button type="button" className="toono-pressable" onClick={()=>{
            GS.directBuyItem={...w,size:selSize,color:selColor,qty};
            nav("checkout");
          }} style={{flex:1,background:T.accent,border:"none",borderRadius:14,height:42,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:700,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,whiteSpace:"nowrap",overflow:"hidden",minWidth:0}}>
            <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Авах · {fmtP(w)}</span>
          </button>
        </>

      /* 품절 */
      ) : w.price>0 ? (
        <button type="button" className="toono-pressable" onClick={()=>{toast("Нөөц ирэхэд мэдэгдэл илгээнэ","success");}} style={{flex:1,background:T.s2,border:`1px solid ${T.border}`,borderRadius:14,height:42,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:600,color:T.textSub,cursor:"pointer"}}>Нөөц ирэхэд мэдэгдэх</button>

      /* 커미션 전용 */
      ) : (
        <button type="button" className="toono-pressable" onClick={()=>nav("commission",{creatorId:w.creator_id})} style={{flex:1,background:T.accent,border:"none",borderRadius:14,height:42,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:700,color:"#fff",cursor:"pointer"}}>Захиалга өгөх</button>
      )}
    </div>
  </div>;
}
