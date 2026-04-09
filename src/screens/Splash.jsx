"use client";
import { useState, useEffect } from "react";
import { T } from "@/theme/colors";
import Toono from "@/components/atoms/Toono";

export default function Splash() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setProgress(p => Math.min(p + Math.random() * 30, 100)), 200);
    return () => clearInterval(t);
  }, []);
  return <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:T.bg}}>
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
      <div style={{opacity:0,animation:"fadeUp .6s .2s ease forwards"}}>
        <Toono size={72} color={T.accent}/>
      </div>
      <div style={{opacity:0,animation:"fadeUp .6s .4s ease forwards",textAlign:"center"}}>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:30,fontWeight:600,color:T.textH,letterSpacing:".05em"}}>The TOONO</div>
        <div style={{fontFamily:"monospace",fontSize:9,color:T.textSub,letterSpacing:".28em",marginTop:4}}>БҮТЭЭЛЧДИЙН ЗАХ</div>
      </div>
    </div>
    <div style={{width:120,height:3,borderRadius:2,background:T.s2,marginTop:24,overflow:"hidden"}}>
      <div style={{width:progress+"%",height:"100%",borderRadius:2,background:T.accent,transition:"width .2s"}}/>
    </div>
    <style>{`
      @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
    `}</style>
  </div>;
}
