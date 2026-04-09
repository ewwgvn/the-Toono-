"use client";
import { useState } from "react";
import { T } from "@/theme/colors";
import Toono from "@/components/atoms/Toono";
import PBtn from "@/components/atoms/PBtn";
import { IcOnboard2, IcPortfolio, IcOnboard3 } from "@/components/icons";

export default function Onboarding({ nav }) {
  const [step, setStep] = useState(0);
  const slides = [
    {title:"Монгол уран бүтээлчидэд\nзориулагдсан платформ",sub:"Бүтээлээ байршуулж, олон нийтэд\nтаниулах дижитал орон зай",emoji:null,icon:<Toono size={64} color={T.accent}/>},
    {title:"Өөрийн хамтрагчаа\nолоорой",sub:"Загвар · Нэхмэл · Урлаг · График\nМонгол бүтээлчидтэй холбогдоорой",emoji:null,icon:<IcOnboard2/>},
    {title:"Бүтээлээ\nархивлаарай",sub:"Таны бүтээл, ажлыг нэг дороос\nхадгалж, портфолио болгоорой",emoji:null,icon:<IcPortfolio/>},
    {title:"Захиалга өгөх,\nхүлээн авах",sub:"Бүтээлч хайж, захиалга илгээж\nхамтран ажиллаарай",emoji:null,icon:<IcOnboard3/>},
  ];
  const s = slides[step];
  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg}}>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px"}}>
      <div style={{width:160,height:160,borderRadius:36,background:T.accentSub,border:`1px solid ${T.accentGlow}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:36}}>
        <div style={{width:140,height:140,borderRadius:36,background:T.accentSub,border:`1px solid ${T.accentGlow}`,display:"flex",alignItems:"center",justifyContent:"center",color:T.accent}}>{s.icon||<Toono size={64} color={T.accent}/>}</div>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:32}}>
        {slides.map((_, i) => <div key={i} style={{width:i===step?24:7,height:7,borderRadius:4,background:i===step?T.accent:T.textDim,transition:"all .3s"}}/>)}
      </div>
      <div style={{textAlign:"center"}}>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:27,fontWeight:800,color:T.textH,lineHeight:1.2,marginBottom:14,whiteSpace:"pre-line"}}>{s.title}</div>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textSub,lineHeight:1.7,whiteSpace:"pre-line"}}>{s.sub}</div>
      </div>
    </div>
    <div style={{padding:"0 24px 48px",display:"flex",flexDirection:"column",gap:10,maxWidth:400,margin:"0 auto",width:"100%"}}>
      {step < 3 ? <PBtn full onClick={() => setStep(step + 1)}>Дараах</PBtn>
                : <><PBtn full onClick={() => nav("login")}>Бүртгүүлэх</PBtn><PBtn full secondary onClick={() => nav("login")}>Нэвтрэх</PBtn></>}
    </div>
  </div>;
}
