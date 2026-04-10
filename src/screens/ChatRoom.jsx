"use client";

import React, { useState, useEffect } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS } from "@/lib/store";
import { DB, isSupabaseReady } from "@/lib/supabase";
import { IcBack, IcSend, IcX } from "@/components/icons";
import PBtn from "@/components/atoms/PBtn";
import Avt from "@/components/atoms/Avt";
import Toono from "@/components/atoms/Toono";

export default function ChatRoom({ nav, refresh, goBack }) {
  const convo = GS.conversations.find(c=>c.id===GS.activeChatId) || GS.conversations[0];
  const [msg,setMsg]=useState("");
  const [msgs,setMsgs]=useState(convo?.msgs||[]);
  const scrollRef = React.useRef(null);
  const timersRef = React.useRef([]);
  // Subscribe to realtime messages
  React.useEffect(() => {
    if (!convo?.dbId || !isSupabaseReady()) return;
    const sub = DB.subscribeToMessages?.(convo.dbId, (newMsg) => {
      if (newMsg.sender_id !== GS.user.id) {
        const mapped = { id: newMsg.id, mine: false, text: newMsg.text, img: !!newMsg.image, imgSrc: newMsg.image || null, time: new Date(newMsg.created_at).getHours() + ":" + String(new Date(newMsg.created_at).getMinutes()).padStart(2, "0"), status: "read" };
        setMsgs(prev => [...prev, mapped]);
        if (convo) convo.msgs = [...(convo.msgs || []), mapped];
      }
    });
    return () => { sub?.unsubscribe?.(); };
  }, [convo?.dbId]);
  // Cleanup all timers on unmount
  React.useEffect(()=>()=>{timersRef.current.forEach(t=>clearTimeout(t));},[]);

  useEffect(()=>{
    if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  },[msgs]);

  // Clear unread when entering chatroom
  useEffect(()=>{
    if(convo&&convo.unread>0){convo.unread=0;saveGS();refresh();}
  },[convo?.id]);

  // Load messages from Supabase on open
  useEffect(()=>{
    if(!convo?.dbId||!isSupabaseReady()) return;
    DB.getMessages(convo.dbId).then(dbMsgs=>{
      if(!dbMsgs.length) return;
      const mapped = dbMsgs.map(m=>({
        id:m.id, mine:m.sender_id===GS.user.id,
        text:m.text, img:!!m.image, imgSrc:m.image||null,
        time:new Date(m.created_at).getHours()+":"+String(new Date(m.created_at).getMinutes()).padStart(2,"0"),
        status:"read",
      }));
      setMsgs(mapped);
      if(convo) convo.msgs = mapped;
    });
  },[convo?.dbId]);

  const send=()=>{
    if(!msg.trim())return;
    const now = new Date();
    const time = now.getHours()+":"+String(now.getMinutes()).padStart(2,"0");
    const newMsg = {id:Date.now(),mine:true,text:msg,time,status:"sent"};
    const updated = [...msgs, newMsg];
    setMsgs(updated);
    if(convo) convo.msgs = updated;
    setMsg("");
    saveGS();
    // Save to Supabase
    if(isSupabaseReady()&&GS.user.id&&convo?.dbId){
      DB.sendMessage(convo.dbId, GS.user.id, msg.trim()).then(()=>{
        newMsg.status="delivered";
        setMsgs(m=>[...m]);
      });
    }
  };

  const ReadReceipt = ({status}) => {
    if(!status) return null;
    const color = status==="read" ? T.accent : T.textSub;
    return <span style={{display:"inline-flex",alignItems:"center",gap:0,marginLeft:4}}>
      {status==="sent"&&<svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 5L5 9L13 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      {status==="delivered"&&<svg width="18" height="10" viewBox="0 0 18 10" fill="none"><path d="M1 5L5 9L13 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 5L9 9L17 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      {status==="read"&&<svg width="18" height="10" viewBox="0 0 18 10" fill="none"><path d="M1 5L5 9L13 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 5L9 9L17 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </span>;
  };

  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg}}>
    <div style={{padding:"20px 20px 12px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${T.border}`}}>
      <button type="button" onClick={()=>{GS.activeChatId=null;nav("chat");}} style={{background:"none",border:"none",color:T.textH,cursor:"pointer",display:"flex"}}><IcBack/></button>
      <Avt size={38} color={convo?.accent||T.accent} photo={convo?.photo} onClick={()=>convo?.creatorId&&nav("profile",{creatorId:convo.creatorId})}/>
      <div style={{flex:1}}>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:15,fontWeight:700,color:T.textH}}>{convo?.name||"The TOONO"}</div>
        <div style={{display:"flex",alignItems:"center",gap:5}}>
          {convo?.online
            ?<><div style={{width:7,height:7,borderRadius:"50%",background:T.green}}/><span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.green}}>Онлайн</span></>
            :<span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub}}>Сүүлд идэвхтэй</span>}
        </div>
      </div>
      <PBtn small secondary onClick={()=>convo?.creatorId&&nav("commission",{creatorId:convo.creatorId})}>Захиалга</PBtn>
    </div>
    <div ref={scrollRef} style={{flex:1,overflowY:"auto",scrollbarWidth:"none",padding:"16px 20px"}}>
      <div style={{textAlign:"center",marginBottom:16}}>
        <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.textSub,background:T.s1,padding:"4px 12px",borderRadius:20}}>Өнөөдөр</span>
      </div>
      {msgs.map(m=><div key={m.id} style={{display:"flex",justifyContent:m.mine?"flex-end":"flex-start",marginBottom:10,alignItems:"flex-end",gap:6}}>
        {!m.mine&&<Avt size={28} color={convo?.accent||T.accent} photo={convo?.photo}/>}
        <div style={{maxWidth:"72%"}}>
          {m.img
            ?m.imgSrc
              ?m.isVideo
                ?<video src={m.imgSrc} controls style={{width:200,maxHeight:160,borderRadius:14,display:"block",background:T.s2}}/>
                :<img src={m.imgSrc} alt="" style={{width:200,maxHeight:200,borderRadius:14,objectFit:"cover",display:"block"}}/>
              :<div style={{width:160,height:110,borderRadius:14,background:`linear-gradient(135deg,${T.accent}30,#66666620)`,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}><Toono size={50} color="rgba(91,143,232,0.3)"/></div>
            :<div style={{background:m.mine?T.accent:T.s1,borderRadius:m.mine?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px",border:m.mine?"none":`1px solid ${T.border}`}}>
              <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:m.mine?"#fff":T.textH,lineHeight:1.5}}>{m.text}</div>
            </div>}
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:10,color:T.textSub,marginTop:3,textAlign:m.mine?"right":"left",display:"flex",alignItems:"center",justifyContent:m.mine?"flex-end":"flex-start",gap:2}}>
            {m.time}
            {m.mine&&<ReadReceipt status={m.status}/>}
          </div>
        </div>
      </div>)}
    </div>
    <div style={{padding:"10px 16px 28px",borderTop:`1px solid ${T.border}`,display:"flex",gap:10,alignItems:"flex-end"}}>
      <label style={{width:38,height:38,borderRadius:"50%",background:T.s1,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:T.textSub,flexShrink:0}}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/><circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.3"/></svg>
        <input type="file" accept="image/*,video/*" onChange={e=>{
          const f=e.target.files?.[0]; if(!f) return;
          const reader=new FileReader();
          reader.onload=ev=>{
            const newMsg = {id:Date.now(),mine:true,text:"",time:new Date().getHours()+":"+String(new Date().getMinutes()).padStart(2,"0"),img:true,imgSrc:ev.target.result,isVideo:f.type.startsWith("video/"),status:"sent"};
            const updated = [...msgs,newMsg];
            setMsgs(updated);
            if(convo) convo.msgs = updated;
            timersRef.current.push(setTimeout(()=>{newMsg.status="delivered";setMsgs(m=>[...m]);},500));
            timersRef.current.push(setTimeout(()=>{newMsg.status="read";setMsgs(m=>[...m]);},1500));
            toast("Файл илгээлээ","success");
          };
          reader.readAsDataURL(f);
          e.target.value="";
        }} style={{display:"none"}}/>
      </label>
      <div style={{flex:1,background:T.s1,border:`1px solid ${T.border}`,borderRadius:20,padding:"10px 14px",display:"flex",alignItems:"center"}}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Зурвасийг оруулна уу..." style={{background:"none",border:"none",outline:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,flex:1}}/>
      </div>
      <button type="button" onClick={send} style={{width:42,height:42,borderRadius:"50%",background:msg.trim()?T.accent:T.s1,border:`1px solid ${msg.trim()?T.accent:T.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"background .15s",flexShrink:0,color:msg.trim()?"#fff":T.textSub}}><IcSend/></button>
    </div>
  </div>;
}
