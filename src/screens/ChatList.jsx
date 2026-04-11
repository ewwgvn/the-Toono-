"use client";

import React, { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { IcSearch, IcX, IcMsg } from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Crd from "@/components/atoms/Crd";
import Avt from "@/components/atoms/Avt";
import { toast } from "@/components/layout/Toast";

export default function ChatList({ nav, refresh, goBack }) {
  const [q,setQ]=useState("");
  const convos = GS.conversations;
  const [showNewChat,setShowNewChat]=useState(false);

  const startNewChat = (name, accent) => {
    const newConvo = {
      id: Date.now(),
      name: name,
      accent: accent || T.accent,
      online: false,
      unread: 0,
      msgs: [],
    };
    GS.conversations.unshift(newConvo);
    GS.activeChatId = newConvo.id;
    setShowNewChat(false);
    refresh();
    nav("chatroom");
  };
  const fl=q?convos.filter(c=>c.name.toLowerCase().includes(q.toLowerCase())):convos;
  const total=convos.reduce((s,c)=>s+c.unread,0);

  const openChat = (c) => {
    // Mark all messages as read
    c.msgs.forEach(m=>{ if(!m.mine) m.read=true; });
    const wasUnread = c.unread;
    c.unread = 0;
    GS.unreadChat = Math.max(0, GS.unreadChat - wasUnread);
    GS.activeChatId = c.id;
    refresh();
    nav("chatroom");
  };

  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg}}>
    <div style={{padding:"20px 20px 14px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:24,fontWeight:800,color:T.textH}}>Зурвас</div>
          {total>0&&<div style={{minWidth:22,height:22,borderRadius:11,background:T.red,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px"}}><span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:700,color:"#fff"}}>{total}</span></div>}
        </div>
        <button type="button" onClick={()=>setShowNewChat(!showNewChat)} style={{width:38,height:38,borderRadius:"50%",background:T.s1,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.textSub}}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 3V15M3 9H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        </button>
      </div>
      <div style={{background:T.s1,border:`1px solid ${T.border}`,borderRadius:14,padding:"11px 14px",display:"flex",alignItems:"center",gap:10}}>
        <span style={{color:T.textSub,display:"flex"}}><IcSearch/></span>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Хайх..." style={{background:"none",border:"none",outline:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,flex:1}}/>
        {q&&<button type="button" onClick={()=>setQ("")} style={{background:"none",border:"none",color:T.textSub,cursor:"pointer",display:"flex"}}><IcX/></button>}
      </div>
    </div>
    {/* New chat panel */}
    {showNewChat&&<div style={{padding:"0 20px 14px"}}>
      <Crd style={{padding:"14px 16px"}}>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,fontWeight:700,color:T.textH,marginBottom:10}}>Шинэ харилцаа эхлэх</div>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub,marginBottom:12}}>Бүтээлчийн нэрийг бичнэ үү</div>
        <div style={{display:"flex",gap:8}}>
          <input id="newChatName" placeholder="Нэр..." style={{flex:1,background:T.s2,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,outline:"none"}}/>
          <button type="button" onClick={()=>{const inp=document.getElementById("newChatName");if(inp?.value.trim())startNewChat(inp.value.trim());else toast("Нэр оруулна уу","error");}} style={{background:T.accent,border:"none",borderRadius:10,padding:"10px 18px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:"#fff",cursor:"pointer"}}>Эхлэх</button>
        </div>
      </Crd>
    </div>}
    <div style={{flex:1,overflowY:"auto",scrollbarWidth:"none"}}>
      {fl.length===0&&!showNewChat
        ?<div style={{textAlign:"center",padding:"60px 20px"}}>
          <div style={{width:72,height:72,borderRadius:22,background:T.accentSub,border:`1px solid ${T.accentGlow}`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><IcMsg/></div>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:17,fontWeight:700,color:T.textH,marginBottom:8}}>Зурвас байхгүй</div>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub,lineHeight:1.6,marginBottom:20}}>Бүтээлчтэй холбогдож харилцаа эхлээрэй</div>
          <PBtn onClick={()=>setShowNewChat(true)}>Шинэ харилцаа</PBtn>
        </div>
        :fl.map(c=>{
          const lastMsg = c.msgs[c.msgs.length-1];
          const lastText = lastMsg?.img?"📷 Зураг":lastMsg?.text||"";
          const lastTime = lastMsg?.time||"";
          return <div key={c.id} onClick={()=>openChat(c)} style={{padding:"13px 20px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",borderBottom:`1px solid ${T.border}`,background:c.unread>0?T.s1+"80":"transparent"}}>
          <div style={{position:"relative",flexShrink:0}}>
            <Avt size={52} color={c.accent} photo={c.photo}/>
            {c.online&&<div style={{position:"absolute",bottom:1,right:1,width:11,height:11,borderRadius:"50%",background:T.green,border:`2px solid ${T.bg}`}}/>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:c.unread>0?700:600,color:T.textH}}>{c.name}</div>
              <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:c.unread>0?T.accent:T.textSub}}>{lastTime}</div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:c.unread>0?T.textB:T.textSub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"80%",display:"flex",alignItems:"center",gap:4}}>
                {lastMsg?.mine&&<span style={{color:lastMsg.status==="read"?T.accent:T.textSub,fontSize:12,flexShrink:0}}>{lastMsg.status==="read"?"✓✓":"✓"}</span>}
                {lastText}
              </div>
              {c.unread>0&&<div style={{minWidth:20,height:20,borderRadius:10,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,fontWeight:700,color:"#fff"}}>{c.unread}</span></div>}
            </div>
          </div>
        </div>;
      })}
    </div>
  </div>;
}
