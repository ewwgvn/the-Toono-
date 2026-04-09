"use client";

import React, { useState, useEffect } from "react";
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

export default function WorkDetail({ nav, refresh, goBack, workId }) {
  const w=getAllWorks().find(x=>x.id===workId)||GS.myWorks[0]||{id:0,title:"—",creator:"—",price:0,accent:"#111111",likes:0,desc:"",sizes:[],colors:[],stock:0};
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
  const tLike=()=>{const v=!liked;if(v)GS.liked.add(w.id);else GS.liked.delete(w.id);setLiked(v);refresh();if(GS.user.id)DB.toggleLike(GS.user.id,w.id);};
  const tSave=()=>{const v=!saved;if(v)GS.saved.add(w.id);else GS.saved.delete(w.id);setSaved(v);refresh();if(GS.user.id)DB.toggleSave(GS.user.id,w.id);};

  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg}}>
    <div style={{padding:"20px 20px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <button onClick={()=>goBack?goBack():nav("home")} style={{background:"none",border:"none",color:T.textH,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><IcBack/><span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:16,fontWeight:600}}>Буцах</span></button>
      <div style={{display:"flex",gap:12,color:T.textSub}}>
        <button onClick={tLike} style={{background:"none",border:"none",cursor:"pointer",color:liked?T.red:T.textSub,display:"flex"}}><IcHeart filled={liked}/></button>
        <button onClick={tSave} style={{background:"none",border:"none",cursor:"pointer",color:saved?T.accent:T.textSub,display:"flex"}}><IcBookmark filled={saved}/></button>
        <button onClick={()=>{navigator.clipboard?.writeText(`${location.origin}?work=${w.id}`).catch(()=>{});if(typeof toast==="function")toast("Холбоос хуулагдлаа","success");}} style={{background:"none",border:"none",cursor:"pointer",color:T.textSub,display:"flex"}}><IcShare/></button>
        <button onClick={()=>nav("report")} style={{background:"none",border:"none",cursor:"pointer",fontSize:16}}><IcReport/></button>
      </div>
    </div>
    <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none"}}>
      {/* Fullscreen zoom modal */}
      {zoomOpen&&<div onClick={()=>setZoomOpen(false)} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(0,0,0,0.95)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
        <button onClick={()=>setZoomOpen(false)} style={{position:"absolute",top:20,right:20,background:"rgba(255,255,255,0.15)",border:"none",borderRadius:12,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",zIndex:1001}}><IcX/></button>
        <img src={w.images[imgIdx||0]} alt="" style={{maxWidth:"95vw",maxHeight:"85vh",objectFit:"contain",borderRadius:8}}
          onTouchStart={e=>setTouchStart(e.touches[0].clientX)}
          onTouchEnd={e=>{if(!touchStart)return;const diff=e.changedTouches[0].clientX-touchStart;if(Math.abs(diff)>50){if(diff<0&&imgIdx<w.images.length-1)setImgIdx(imgIdx+1);if(diff>0&&imgIdx>0)setImgIdx(imgIdx-1);}setTouchStart(null);}}
        />
        {w.images.length>1&&<div style={{display:"flex",gap:8,marginTop:16}}>
          {w.images.map((_,i)=><button key={i} onClick={e=>{e.stopPropagation();setImgIdx(i);}} style={{width:i===(imgIdx||0)?24:10,height:10,borderRadius:5,background:i===(imgIdx||0)?"#fff":"rgba(255,255,255,0.3)",border:"none",cursor:"pointer",transition:"all .2s"}}/>)}
        </div>}
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:"rgba(255,255,255,0.5)",marginTop:10}}>{(imgIdx||0)+1} / {w.images.length} · Зүүн баруун шудрах</div>
      </div>}
      {/* Hero image / gallery */}
      {w.images?.length>0
        ?<div style={{margin:"0 20px",borderRadius:20,overflow:"hidden",position:"relative",cursor:"zoom-in"}} onClick={()=>setZoomOpen(true)}
          onTouchStart={e=>setTouchStart(e.touches[0].clientX)}
          onTouchEnd={e=>{if(!touchStart)return;const diff=e.changedTouches[0].clientX-touchStart;if(Math.abs(diff)>50){e.stopPropagation();if(diff<0&&imgIdx<w.images.length-1)setImgIdx(imgIdx+1);if(diff>0&&imgIdx>0)setImgIdx(imgIdx-1);setZoomOpen(false);}setTouchStart(null);}}>
          <img src={w.images[imgIdx||0]} alt="" loading="lazy" style={{width:"100%",height:260,objectFit:"cover",display:"block",transition:"transform .3s"}}/>
          {w.images.length>1&&<div style={{position:"absolute",bottom:12,left:"50%",transform:"translateX(-50%)",display:"flex",gap:6}}>
            {w.images.map((_,i)=><button key={i} onClick={e=>{e.stopPropagation();setImgIdx(i);}} style={{width:i===(imgIdx||0)?20:8,height:8,borderRadius:4,background:i===(imgIdx||0)?"#fff":"rgba(255,255,255,0.4)",border:"none",cursor:"pointer",transition:"all .2s"}}/>)}
          </div>}
          {w.badge&&<span style={{position:"absolute",top:14,left:14,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:700,color:"#fff",background:"rgba(91,143,232,0.85)",padding:"5px 12px",borderRadius:10}}>{w.badge}</span>}
          {/* Swipe hint + count */}
          <div style={{position:"absolute",bottom:14,right:14,background:"rgba(0,0,0,0.5)",borderRadius:10,padding:"6px 12px",display:"flex",alignItems:"center",gap:6}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.6)" strokeWidth="1"/><path d="M5 7H9M7 5V9" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round"/></svg>
            <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textB}}>{(imgIdx||0)+1}/{w.images.length}</span>
          </div>
        </div>
        :<div style={{height:260,background:`linear-gradient(135deg,#1A2A5A,${w.accent},#1A2A5A)`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",margin:"0 20px",borderRadius:20}}>
          <div style={{opacity:.25}}><Toono size={200} color="#fff"/></div>
          {w.badge&&<span style={{position:"absolute",top:14,left:14,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:700,color:"#fff",background:"rgba(91,143,232,0.85)",padding:"5px 12px",borderRadius:10}}>{w.badge}</span>}
          <div style={{position:"absolute",bottom:14,right:14,background:"rgba(0,0,0,0.5)",borderRadius:10,padding:"6px 12px"}}>
            <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textB}}><IcHeart/> {(w.likes||0).toLocaleString()}</span>
          </div>
        </div>}
      {/* Video if available */}
      {w.video&&<div style={{margin:"10px 20px 0",borderRadius:14,overflow:"hidden"}}>
        <video src={w.video} controls style={{width:"100%",maxHeight:200,objectFit:"cover",display:"block",background:T.s2}}/>
      </div>}
      <div style={{padding:"18px 20px 0"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:22,fontWeight:800,color:T.textH,flex:1,lineHeight:1.2}}>{w.title}</div>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:22,fontWeight:800,color:T.accent,marginLeft:12,flexShrink:0}}>{fmtP(w)}</div>
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
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:16,fontWeight:700,color:T.textH,marginBottom:10}}>Бүтээлийн тайлбар</div>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textB,lineHeight:1.8}}>{w.desc}</div>
        </div>
        <div style={{height:1,background:T.border}}/>
        <div style={{padding:"16px 0"}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:16,fontWeight:700,color:T.textH,marginBottom:12}}>Барааны мэдээлэл</div>
          {(()=>{
            const rows=[];
            if(w.medium&&w.medium!=="—") rows.push(["Материал",w.medium]);
            if(w.sizes?.length>0) rows.push(["Хэмжээ",w.sizes.join(" / ")]);
            if(w.duration) rows.push(["Хийх хугацаа",w.duration]);
            if(w.stock>0) rows.push(["Дугаарлалт",w.stock+"ш"]);
            if(rows.length===0) return <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub,padding:"12px 0"}}>Бүтээлч мэдээлэл оруулаагүй байна</div>;
            return rows.map(r=><div key={r[0]} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub}}>{r[0]}</span>
              <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:500,color:T.textH}}>{r[1]}</span>
            </div>);
          })()}
        </div>
        <div style={{marginTop:4}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:16,fontWeight:700,color:T.textH,marginBottom:12}}>Мөн бүтээлчийн Бүтээл</div>
          <div style={{display:"flex",gap:10,overflowX:"auto",scrollbarWidth:"none"}}>
            {getAllWorks().filter(ww=>ww.id!==w.id).slice(0,3).map(ww=><div key={ww.id} onClick={()=>nav("work",{workId:ww.id})} style={{flexShrink:0,width:120,cursor:"pointer"}}>
              <div style={{height:80,borderRadius:12,background:ww.accent+"18",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:6,overflow:"hidden"}}>
                {ww.images?.[0] ? <img src={ww.images[0]} alt="" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <Toono size={44} color={ww.accent}/>}
              </div>
              <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:600,color:T.textH,marginBottom:2}}>{ww.title}</div>
              <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.accent,fontWeight:700}}>{fmtP(ww)}</div>
            </div>)}
          </div>
        </div>
        <div style={{height:20}}/>
      </div>
    </div>
    {/* Offer Bottom Sheet */}
    <BottomSheet open={offerOpen} onClose={()=>setOfferOpen(false)} title="Үнийн санал илгээх" height="50%">
      <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub,marginBottom:14}}>Бүтээлчид хүссэн үнэ санал болгоно. Хариуг хүлээнэ үү.</div>
      <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:600,color:T.textSub,marginBottom:6}}>Анхны үнэ: {fmtP(w)}</div>
      <input type="number" value={offerPrice} onChange={e=>setOfferPrice(e.target.value)} placeholder="Санал болгох үнэ (₮)" style={{width:"100%",background:T.s2,border:`1px solid ${T.border}`,borderRadius:13,padding:"14px 16px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:16,fontWeight:700,color:T.textH,outline:"none",marginBottom:12,boxSizing:"border-box"}}/>
      <textarea value={offerMsg} onChange={e=>setOfferMsg(e.target.value)} placeholder="Зурвас (заавал биш)" rows={3} style={{width:"100%",background:T.s2,border:`1px solid ${T.border}`,borderRadius:13,padding:"12px 16px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,outline:"none",resize:"none",marginBottom:16,boxSizing:"border-box"}}/>
      <PBtn full disabled={!offerPrice} onClick={async ()=>{
        const price = Number(offerPrice);
        const newOffer = {id:Date.now(),workId:w.id,workTitle:w.title,price,msg:offerMsg,status:"pending",date:new Date().toLocaleDateString()};
        if(isSupabaseReady()&&GS.user.id&&w.id){
          const saved = await DB.createOffer({buyer_id:GS.user.id,work_id:w.id,price,message:offerMsg,status:"pending"});
          if(saved) newOffer.id = saved.id;
        }
        GS.offers.push(newOffer);
        GS.notifications.unshift({id:Date.now(),icon:"comm",title:"Үнийн санал илгээлээ",desc:`${w.title} — ₮${price.toLocaleString()}`,time:"Сая",read:true,to:"me"});
        setOfferOpen(false);setOfferPrice("");setOfferMsg("");
        refresh();if(typeof toast==="function")toast("Үнийн санал илгээлээ","success");
      }}>Санал илгээх</PBtn>
    </BottomSheet>
    {/* Size / Color / Qty Selectors */}
    <div style={{padding:"0 20px 0",background:T.bg}}>
      {w.sizes?.length>0&&<div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub,width:"100%",marginBottom:2}}>Хэмжээ</span>
        {w.sizes.map(s=><button key={s} onClick={()=>setSelSize(s)} style={{padding:"6px 14px",borderRadius:10,cursor:"pointer",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,fontWeight:600,background:selSize===s?T.accent:T.s1,border:`1px solid ${selSize===s?T.accent:T.border}`,color:selSize===s?"#fff":T.textSub}}>{s}</button>)}
      </div>}
      {w.colors?.length>0&&<div style={{display:"flex",gap:8,marginBottom:10,alignItems:"center"}}>
        <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub}}>Өнгө</span>
        {w.colors.map(cl=><button key={cl} onClick={()=>setSelColor(cl)} style={{width:28,height:28,borderRadius:14,background:cl,border:selColor===cl?`3px solid ${T.accent}`:`2px solid ${T.border}`,cursor:"pointer"}}/>)}
      </div>}
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
        <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub}}>Тоо</span>
        <button onClick={()=>setQty(Math.max(1,qty-1))} style={{width:30,height:30,borderRadius:8,background:T.s1,border:`1px solid ${T.border}`,color:T.textH,cursor:"pointer",fontWeight:700}}>−</button>
        <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:700,color:T.textH,minWidth:24,textAlign:"center"}}>{qty}</span>
        <button onClick={()=>setQty(Math.min(w.stock||99,qty+1))} style={{width:30,height:30,borderRadius:8,background:T.s1,border:`1px solid ${T.border}`,color:T.textH,cursor:"pointer",fontWeight:700}}>+</button>
        {w.stock&&<span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.textSub,marginLeft:6}}>Үлдэгдэл {w.stock}ш</span>}
      </div>
    </div>
    <div style={{padding:"12px 20px 32px",background:T.bg,borderTop:`1px solid ${T.border}`,display:"flex",gap:8,alignItems:"center"}}>
      <button onClick={async ()=>{
        let convo = GS.conversations.find(cv=>cv.name===(w.creator||GS.user.name));
        if(!convo){convo={id:Date.now(),creatorId:w.creator_id||null,name:w.creator||"Бүтээлч",accent:w.accent||T.accent,online:false,unread:0,msgs:[]};GS.conversations.unshift(convo);}
        if(isSupabaseReady()&&GS.user.id&&w.creator_id&&GS.user.id!==w.creator_id){
          const dbConvo=await DB.getOrCreateConversation(GS.user.id,w.creator_id);
          if(dbConvo)convo.dbId=dbConvo.id;
        }
        GS.activeChatId=convo.id;refresh();nav("chatroom");
      }} style={{width:44,height:44,background:T.accentSub,border:`1px solid ${T.accentGlow}`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,color:T.accent}}><IcMsg/></button>
      {w.price>0&&<button onClick={()=>setOfferOpen(true)} style={{width:44,height:44,background:T.s1,border:`1px solid ${T.border}`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,color:T.yellow,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:700}}>₮?</button>}
      {w.price>0&&(w.stock===undefined||w.stock>0)
        ?<><button onClick={()=>{
          const cartItem={...w,size:selSize,color:selColor,qty};
          const exists=GS.cart.find(c=>c.id===w.id&&c.size===selSize&&c.color===selColor);
          if(!exists){GS.cart.push(cartItem);saveGS();}
          if(typeof toast==="function")toast(exists?"Сагсанд байна":"Сагсанд нэмэгдлээ",exists?"info":"success");refresh();
        }} style={{flex:1,background:T.s1,border:`1px solid ${T.border}`,borderRadius:14,padding:14,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:600,color:T.textH,cursor:"pointer"}}><span style={{display:"flex",marginRight:4}}><IcCart/></span>Сагс</button>
           <button onClick={()=>{
             GS.directBuyItem={...w,size:selSize,color:selColor,qty};
             nav("checkout");
           }} style={{flex:2,background:T.accent,border:"none",borderRadius:14,padding:14,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:700,color:"#fff",cursor:"pointer"}}>Шууд авах — {fmtP(w)}</button></>
        :w.price>0
          ?<button onClick={()=>{if(typeof toast==="function")toast("Нөөц ирэхэд мэдэгдэл илгээнэ","success");}} style={{flex:1,background:T.s2,border:`1px solid ${T.border}`,borderRadius:14,padding:14,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textSub,cursor:"pointer"}}><span style={{display:"flex",marginRight:4}}><IcBell/></span>Нөөц ирэхэд мэдэгдэх</button>
          :<button onClick={()=>nav("commission",{creatorId:w.creator_id})} style={{flex:1,background:T.accentSub,border:`1px solid ${T.accentGlow}`,borderRadius:14,padding:14,fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:600,color:T.accent,cursor:"pointer"}}>Захиалга өгөх</button>}
    </div>
  </div>;
}
