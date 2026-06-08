"use client";
import { useState } from "react";
import { T, getTheme, ULIGER_DECOR as D, ULIGER_FONT_DISPLAY, ULIGER_FONT_ACCENT } from "@/theme/colors";
import Toono from "@/components/atoms/Toono";
import PBtn from "@/components/atoms/PBtn";
import StoryDecor from "@/components/atoms/StoryDecor";
import ScallopEdge from "@/components/atoms/ScallopEdge";
import { IcOnboard2, IcPortfolio, IcOnboard3 } from "@/components/icons";

const DECOR_VARIANTS = ["stars", "moon", "flower", "cloud"];

export default function Onboarding({ nav }) {
  const [step, setStep] = useState(0);
  const isUliger = getTheme() === "uliger";
  const slides = [
    {title:"Монгол уран бүтээлчидэд\nзориулагдсан платформ",sub:"Бүтээлээ байршуулж, олон нийтэд\nтаниулах дижитал орон зай",emoji:null,icon:<Toono size={64} color={isUliger?D.ink:T.accent}/>},
    {title:"Өөрийн хамтрагчаа\nолоорой",sub:"Загвар · Нэхмэл · Урлаг · График\nМонгол бүтээлчидтэй холбогдоорой",emoji:null,icon:<IcOnboard2/>},
    {title:"Бүтээлээ\nархивлаарай",sub:"Таны бүтээл, ажлыг нэг дороос\nхадгалж, портфолио болгоорой",emoji:null,icon:<IcPortfolio/>},
    {title:"Захиалга өгөх,\nхүлээн авах",sub:"Бүтээлч хайж, захиалга илгээж\nхамтран ажиллаарай",emoji:null,icon:<IcOnboard3/>},
  ];
  const s = slides[step];

  if (isUliger) {
    // 온보딩도 스플래시처럼 책을 펼친 좌/우 페이지 구조 — 왼쪽 삽화면(슬라이드별 모티프) / 오른쪽 글면
    const decor = DECOR_VARIANTS[step];
    return (
      <div style={{ height: "100%", width: "100vw", display: "flex", flexDirection: "column", background: T.bg, position: "relative", marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "row", overflow: "hidden", position: "relative" }}>
          {/* 왼쪽 페이지 — 삽화면 */}
          <div key={"left"+step} style={{ flex: "0 0 42%", background: D.ink, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <StoryDecor variant={decor} size={40} style={{ position: "absolute", top: 24, left: 16, opacity: .85 }} />
            <StoryDecor variant={DECOR_VARIANTS[(step + 2) % 4]} size={30} style={{ position: "absolute", bottom: 30, left: 14, opacity: .65 }} />
            <div key={step} style={{
              width: 112, height: 112, borderRadius: "44% 56% 50% 50% / 50% 46% 54% 50%",
              background: D.gold, display: "flex", alignItems: "center", justifyContent: "center",
              opacity: 0, animation: "fadeUp .5s ease forwards", border: `3px solid ${D.paper}`, color: D.paper,
            }}>
              {s.icon}
            </div>
          </div>

          <ScallopEdge color={T.bg} orientation="vertical" size={16} style={{ marginLeft: -1 }} />

          {/* 오른쪽 페이지 — 글면 */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22, padding: "0 22px", position: "relative" }}>
            <StoryDecor variant={DECOR_VARIANTS[(step + 1) % 4]} size={36} style={{ position: "absolute", right: 12, top: 28, opacity: .7 }} />
            <div key={"text"+step} style={{ opacity: 0, animation: "fadeUp .5s .1s ease forwards" }}>
              <div style={{ fontFamily: ULIGER_FONT_DISPLAY, fontSize: 21, fontWeight: 700, color: T.textH, lineHeight: 1.35, marginBottom: 10, whiteSpace: "pre-line" }}>{s.title}</div>
              <div style={{ fontFamily: ULIGER_FONT_ACCENT, fontSize: 15, color: T.textSub, lineHeight: 1.5, whiteSpace: "pre-line" }}>{s.sub}</div>
            </div>
            <div style={{ display: "flex", gap: 7 }}>
              {slides.map((_, i) => <div key={i} style={{ width: i === step ? 22 : 6, height: 6, borderRadius: 3, background: i === step ? D.gold : T.s3, transition: "all .3s" }} />)}
            </div>
          </div>
        </div>

        <ScallopEdge color={D.ink} size={14} flip style={{ marginBottom: -1 }} />
        <div style={{ padding: "16px 24px 40px", display: "flex", flexDirection: "column", gap: 10, maxWidth: 400, margin: "0 auto", width: "100%", boxSizing: "border-box", background: D.ink }}>
          {step < 3 ? <PBtn full onClick={() => setStep(step + 1)}>Дараах</PBtn>
                    : <><PBtn full onClick={() => nav("login",{mode:"signup"})}>Бүртгүүлэх</PBtn><PBtn full secondary onClick={() => nav("login",{mode:"login"})}>Нэвтрэх</PBtn></>}
        </div>

        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    );
  }

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
                : <><PBtn full onClick={() => nav("login",{mode:"signup"})}>Бүртгүүлэх</PBtn><PBtn full secondary onClick={() => nav("login",{mode:"login"})}>Нэвтрэх</PBtn></>}
    </div>
  </div>;
}
