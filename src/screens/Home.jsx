"use client";
import { useState } from "react";
import { T } from "@/theme/colors";
import { GS } from "@/lib/store";
import { DB } from "@/lib/supabase";
import { getAllWorks, getCreators, fmtP } from "@/lib/utils";
import Toono from "@/components/atoms/Toono";
import Crd from "@/components/atoms/Crd";
import PBtn from "@/components/atoms/PBtn";
import WorkCard from "@/components/shared/WorkCard";
import {
  IcCart, IcBell, IcSearch, IcHeart, IcBookmark,
  IcCommission, IcChevron, IcOrder
} from "@/components/icons";

export default function Home({ nav, refresh }) {
  const [cat, setCat] = useState("all");
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const cats = ["all","Загвар","Нэхмэл","Урлаг","График"];
  const allW = getAllWorks();
  const filtered = cat==="all" ? allW : allW.filter(w => w.cat===cat);
  const tLike = id => {GS.liked.has(id)?GS.liked.delete(id):GS.liked.add(id);refresh();if(GS.user.id)DB.toggleLike(GS.user.id,id);};
  const tSave = id => {GS.saved.has(id)?GS.saved.delete(id):GS.saved.add(id);refresh();if(GS.user.id)DB.toggleSave(GS.user.id,id);};

  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg}}>

    {/* Header — mobile only (desktop has top nav) */}
    <div className="toono-mobile-nav" style={{padding:"10px 20px 12px",justifyContent:"space-between",alignItems:"center",background:T.bg,flexShrink:0,zIndex:10,paddingTop:"max(10px, env(safe-area-inset-top, 10px))"}}>
      <div style={{display:"flex",alignItems:"center",gap:9}}>
        <Toono size={28} color={T.accent}/>
        <div style={{fontFamily:"Georgia,serif",fontSize:21,fontWeight:600,color:T.textH,letterSpacing:".03em"}}>The TOONO</div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <button onClick={() => nav("cart")} style={{position:"relative",width:36,height:36,borderRadius:"50%",background:T.s1,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.textSub}}>
          <IcCart/>
          {GS.cart.length>0&&<div style={{position:"absolute",top:-2,right:-2,minWidth:16,height:16,borderRadius:8,background:T.red,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}><span style={{fontFamily:"system-ui",fontSize:9,fontWeight:700,color:"#fff"}}>{GS.cart.length}</span></div>}
        </button>
        <button onClick={() => nav("notifications")} style={{position:"relative",width:36,height:36,borderRadius:"50%",background:T.s1,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.textSub}}>
          <IcBell/>
          {GS.unreadNotif>0&&<div style={{position:"absolute",top:0,right:0,width:8,height:8,borderRadius:"50%",background:T.red}}/>}
        </button>
      </div>
    </div>

    {/* Welcome banner for new users */}
    {GS.myWorks.length===0&&GS.orders.length===0&&<div style={{margin:"0 20px 12px",background:`linear-gradient(135deg,${T.accent}18,${T.accent}08)`,border:`1px solid ${T.accent}30`,borderRadius:16,padding:"16px 18px"}}>
      <div style={{fontFamily:"system-ui",fontSize:15,fontWeight:700,color:T.textH}}>Сайн байна уу, {GS.user.name||""}!</div>
    </div>}
    {/* Search bar */}
    <div style={{padding:"0 20px 14px"}}>
      <button onClick={() => nav("explore")} style={{width:"100%",background:T.s1,border:`1px solid ${T.border}`,borderRadius:14,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,cursor:"pointer",textAlign:"left"}}>
        <span style={{color:T.textSub,display:"flex"}}><IcSearch/></span>
        <span style={{fontFamily:"system-ui",fontSize:14,color:T.textSub}}>Хайлт...</span>
      </button>
    </div>

    <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none"}}>

      {/* Category filter */}
      <div style={{padding:"0 20px 16px",display:"flex",gap:7,overflowX:"auto",scrollbarWidth:"none"}}>
        {cats.map(c => <button key={c} onClick={() => setCat(c)} style={{flexShrink:0,padding:"7px 16px",borderRadius:20,cursor:"pointer",fontFamily:"system-ui",fontSize:13,fontWeight:500,background:cat===c?T.accent:T.s1,border:`1px solid ${cat===c?T.accent:T.border}`,color:cat===c?"#fff":T.textSub,transition:"all .12s"}}>{c==="all"?"Бүгд":c}</button>)}
      </div>

      {/* Editor pick */}
      {filtered[0]&&<div style={{padding:"0 20px 4px"}}>
        <Crd onClick={() => nav("work",{workId:filtered[0].id})} style={{marginBottom:16,overflow:"hidden"}}>
          <div style={{height:180,background:filtered[0].images?.[0]?T.s2:`linear-gradient(145deg,${filtered[0].accent}28 0%,${filtered[0].accent}08 100%)`,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
            {filtered[0].images?.[0]
              ?<img src={filtered[0].images[0]} alt="" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              :<div style={{opacity:.22}}><Toono size={160} color={filtered[0].accent}/></div>}
            {filtered[0].badge&&<span style={{position:"absolute",top:12,left:14,fontFamily:"system-ui",fontSize:10,fontWeight:700,color:"#fff",background:filtered[0].accent,padding:"4px 10px",borderRadius:8}}>{filtered[0].badge}</span>}
            <div style={{position:"absolute",bottom:12,right:12,display:"flex",gap:6}}>
              <button onClick={e => {e.stopPropagation();tLike(filtered[0].id);}} style={{width:32,height:32,borderRadius:"50%",background:"rgba(0,0,0,0.4)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:GS.liked.has(filtered[0].id)?T.red:"rgba(255,255,255,0.7)"}}><IcHeart filled={GS.liked.has(filtered[0].id)}/></button>
              <button onClick={e => {e.stopPropagation();tSave(filtered[0].id);}} style={{width:32,height:32,borderRadius:"50%",background:"rgba(0,0,0,0.4)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:GS.saved.has(filtered[0].id)?T.accent:"rgba(255,255,255,0.7)"}}><IcBookmark filled={GS.saved.has(filtered[0].id)}/></button>
            </div>
          </div>
          <div style={{padding:"14px 16px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <div style={{fontFamily:"system-ui",fontSize:16,fontWeight:700,color:T.textH,marginBottom:2}}>{filtered[0].title}</div>
              <div style={{fontFamily:"system-ui",fontSize:13,color:T.textSub}}>{filtered[0].creator}</div>
            </div>
            <div style={{fontFamily:"system-ui",fontSize:17,fontWeight:700,color:T.accent}}>{fmtP(filtered[0])}</div>
          </div>
        </Crd>
      </div>}

      {/* Recently Viewed */}
      {GS.recentlyViewed.length>0&&<div style={{padding:"0 20px",marginBottom:16}}>
        <div style={{fontFamily:"system-ui",fontSize:15,fontWeight:700,color:T.textH,marginBottom:10}}>Саяхан үзсэн</div>
        <div style={{display:"flex",gap:10,overflowX:"auto",scrollbarWidth:"none"}}>
          {GS.recentlyViewed.slice(0,6).map(id => {const w=getAllWorks().find(x => x.id===id);if(!w)return null;return <div key={id} onClick={() => nav("work",{workId:w.id})} style={{flexShrink:0,width:100,cursor:"pointer"}}>
            <div style={{height:72,borderRadius:12,background:w.images?.[0]?T.s2:w.accent+"18",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",marginBottom:6}}>
              {w.images?.[0]?<img src={w.images[0]} alt="" loading="lazy" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<Toono size={32} color={w.accent}/>}
            </div>
            <div style={{fontFamily:"system-ui",fontSize:11,fontWeight:600,color:T.textH,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.title}</div>
            <div style={{fontFamily:"system-ui",fontSize:11,color:T.accent,fontWeight:700}}>{fmtP(w)}</div>
          </div>;})}
        </div>
      </div>}

      {/* Active Orders Section */}
      {GS.orders.length>0&&<div style={{padding:"0 20px",marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontFamily:"system-ui",fontSize:15,fontWeight:700,color:T.textH}}>Миний захиалга</div>
          <button onClick={() => nav("order-list")} style={{background:"none",border:"none",fontFamily:"system-ui",fontSize:13,color:T.accent,cursor:"pointer"}}>Бүгд ({GS.orders.length}) →</button>
        </div>
        <div style={{display:"flex",gap:10,overflowX:"auto",scrollbarWidth:"none",paddingBottom:4}}>
          {GS.orders.slice(0,5).map(o => {
            const statusMap={"pending":"Хүлээгдэж","making":"Хийж байна","shipped":"Хүргэгдэж","delivered":"Ирсэн","done":"Дууссан","confirmed":"Баталсан"};
            const statusColor={"pending":T.yellow,"making":T.accent,"shipped":T.accent,"delivered":T.green,"done":T.textSub,"confirmed":T.accent};
            const statusIcon={"pending":"\u23F3","making":"\uD83D\uDD28","shipped":"\uD83D\uDE9A","delivered":"\uD83D\uDCE6","done":"\u2713","confirmed":"\u2713"};
            const stepIdx={"pending":0,"confirmed":1,"making":1,"shipped":2,"delivered":3,"done":4}[o.status]||0;
            return <div key={o.id} onClick={() => {GS.selectedOrderId=o.id;nav("order-detail");}} style={{flexShrink:0,width:220,cursor:"pointer"}}>
              <Crd style={{padding:"14px 16px"}}>
                {/* Status badge */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontFamily:"system-ui",fontSize:11,fontWeight:700,color:statusColor[o.status]||T.textSub,background:(statusColor[o.status]||T.textSub)+"18",padding:"3px 10px",borderRadius:8,display:"flex",alignItems:"center",gap:4}}>
                    <span>{statusIcon[o.status]||"\u2022"}</span>{statusMap[o.status]||o.status}
                  </span>
                  <span style={{fontFamily:"system-ui",fontSize:10,color:T.textSub}}>{o.date}</span>
                </div>
                {/* Title */}
                <div style={{fontFamily:"system-ui",fontSize:13,fontWeight:700,color:T.textH,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.title}</div>
                <div style={{fontFamily:"system-ui",fontSize:11,color:T.textSub,marginBottom:10}}>{o.creator}</div>
                {/* Progress bar */}
                <div style={{display:"flex",gap:2,marginBottom:8}}>
                  {[0,1,2,3,4].map(i => <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=stepIdx?T.accent:T.border,transition:"all .3s"}}/>)}
                </div>
                {/* Price + action */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontFamily:"system-ui",fontSize:15,fontWeight:800,color:T.accent}}>{"\u20AE"}{(o.price||0).toLocaleString()}</div>
                  {o.tracking&&<span style={{fontFamily:"system-ui",fontSize:9,color:T.green,background:T.greenSub,padding:"2px 7px",borderRadius:6}}>{"\uD83D\uDE9A"} Хянах</span>}
                </div>
              </Crd>
            </div>;
          })}
        </div>
      </div>}

      {/* Order proposal — minimal */}
      <div style={{padding:"0 20px",marginBottom:20}}>
        <div onClick={() => nav("explore")} style={{display:"flex",alignItems:"center",gap:14,padding:"16px 18px",background:T.s1,border:`1px solid ${T.border}`,borderRadius:16,cursor:"pointer",transition:"all .15s"}} onMouseEnter={e => e.currentTarget.style.borderColor=T.accent+"60"} onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
          <div style={{width:42,height:42,borderRadius:12,background:T.accentSub,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:T.accent}}><IcCommission/></div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:"system-ui",fontSize:14,fontWeight:700,color:T.textH}}>Бүтээлчид захиалга илгээх</div>
            <div style={{fontFamily:"system-ui",fontSize:12,color:T.textSub}}>Дуртай бүтээлчээ олж, хүссэн зүйлээ захиалаарай</div>
          </div>
          <span style={{color:T.accent,flexShrink:0,opacity:.6}}><IcChevron/></span>
        </div>
        {/* Quick access row */}
        {(GS.orders.length>0||GS.cart.length>0)&&<div style={{display:"flex",gap:8,marginTop:8}}>
          {GS.cart.length>0&&<button onClick={() => nav("cart")} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px",background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",fontFamily:"system-ui",fontSize:12,fontWeight:600,color:T.textSub}}>
            <IcCart/> Сагс <span style={{minWidth:16,height:16,borderRadius:8,background:T.red,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff"}}>{GS.cart.length}</span>
          </button>}
          {GS.orders.length>0&&<button onClick={() => nav("order-list")} style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px",background:T.s1,border:`1px solid ${T.border}`,borderRadius:12,cursor:"pointer",fontFamily:"system-ui",fontSize:12,fontWeight:600,color:T.textSub}}>
            <IcOrder/> Захиалга <span style={{minWidth:16,height:16,borderRadius:8,background:T.accent,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff"}}>{GS.orders.length}</span>
          </button>}
        </div>}
      </div>

      {/* Grid */}
      {filtered.length>0?<div className="toono-grid-2" style={{padding:"0 20px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
        {filtered.slice(1,5).map(w => <WorkCard key={w.id} work={w} onClick={() => nav("work",{workId:w.id})} onToggleLike={tLike} onToggleSave={tSave}/>)}
      </div>
      :<div style={{padding:"40px 20px",textAlign:"center"}}>
        <div style={{width:72,height:72,borderRadius:22,background:T.accentSub,border:`1px solid ${T.accentGlow}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><Toono size={40} color={T.accent}/></div>
        <div style={{fontFamily:"system-ui",fontSize:17,fontWeight:700,color:T.textH,marginBottom:8}}>{GS.currentRole==="creator"?"Бүтээлээ байршуулаарай":"Бүтээлч нарыг олж нээрэй"}</div>
        <div style={{fontFamily:"system-ui",fontSize:13,color:T.textSub,marginBottom:20,lineHeight:1.6}}>{GS.currentRole==="creator"?"Эхний бүтээлээ байршуулж, The TOONO-д таниулаарай":"Монгол бүтээлчдийн бүтээлийг нээн илрүүлээрэй"}</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          {GS.currentRole==="creator"&&<PBtn onClick={() => nav("upload")}>Бүтээл байршуулах</PBtn>}
          <PBtn secondary onClick={() => nav("explore")}>Бүтээлч хайх</PBtn>
        </div>
      </div>}

      {/* Creators row */}
      <div style={{padding:"0 20px 8px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontFamily:"system-ui",fontSize:17,fontWeight:700,color:T.textH}}>Бүтээлчид</div>
          <button onClick={() => nav("explore")} style={{background:"none",border:"none",fontFamily:"system-ui",fontSize:13,color:T.accent,cursor:"pointer"}}>Бүгдийг харах</button>
        </div>
        <div style={{display:"flex",gap:14,overflowX:"auto",scrollbarWidth:"none",paddingBottom:4}}>
          {getCreators().slice(0,5).map(c => <div key={c.id} onClick={() => nav("profile",{creatorId:c.id})} style={{flexShrink:0,textAlign:"center",cursor:"pointer",width:76}}>
            <div style={{width:56,height:56,borderRadius:18,background:c.accent+"20",border:`1.5px solid ${c.accent}35`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px",overflow:"hidden"}}>
              {c.photo?<img src={c.photo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<Toono size={32} color={c.accent}/>}
            </div>
            <div style={{fontFamily:"system-ui",fontSize:11,fontWeight:600,color:T.textH,marginBottom:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name.split(" ")[0]}</div>
            <div style={{fontFamily:"system-ui",fontSize:10,color:T.textSub}}>{c.field.split(" \u00B7 ")[0]}</div>
          </div>)}
        </div>
      </div>

      <div style={{height:90}}/>
    </div>
  </div>;
}
