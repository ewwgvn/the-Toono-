"use client";
import { useState, useEffect } from "react";
import { T, getTheme, ULIGER_DECOR as D, ULIGER_FONT_DISPLAY, ULIGER_FONT_ACCENT } from "@/theme/colors";
import Toono from "@/components/atoms/Toono";
import StoryDecor from "@/components/atoms/StoryDecor";
import ScallopEdge from "@/components/atoms/ScallopEdge";

export default function Splash() {
  const [progress, setProgress] = useState(0);
  const isUliger = getTheme() === "uliger";
  useEffect(() => {
    const t = setInterval(() => setProgress(p => Math.min(p + Math.random() * 30, 100)), 200);
    return () => clearInterval(t);
  }, []);

  if (isUliger) {
    // 책을 펼친 듯한 두 '페이지' 구조 — 위쪽 네이비 표지면 / 아래쪽 크림 면지, 가운데를 스캘럽 책장선으로 구분
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", background: T.bg, position: "relative", overflow: "hidden" }}>
        {/* 위쪽 페이지 — 표지 */}
        <div style={{ flex: "0 0 46%", background: D.navy, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <StoryDecor variant="stars" size={56} style={{ position: "absolute", top: 18, left: 22, opacity: .9 }} />
          <StoryDecor variant="stars" size={40} style={{ position: "absolute", bottom: 30, right: 28, opacity: .7 }} />
          <StoryDecor variant="moon" size={64} style={{ position: "absolute", top: 14, right: 18, opacity: .85 }} />
          {/* 꽃잎 모양 블롭 프레임 */}
          <div style={{
            width: 124, height: 124, borderRadius: "42% 58% 53% 47% / 48% 45% 55% 52%",
            background: D.mustard, display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0, animation: "fadeUp .6s .15s ease forwards", border: `3px solid ${D.star}`,
          }}>
            <Toono size={56} color={D.navy} />
          </div>
        </div>

        {/* 책장 가르는 스캘럽 선 */}
        <ScallopEdge color={T.bg} height={20} style={{ marginTop: -1 }} />

        {/* 아래쪽 페이지 — 면지 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, position: "relative" }}>
          <StoryDecor variant="flower" size={48} style={{ position: "absolute", left: 18, bottom: 56, opacity: .8 }} />
          <StoryDecor variant="cloud" size={50} style={{ position: "absolute", right: 16, top: 8, opacity: .6 }} />
          <div style={{ opacity: 0, animation: "fadeUp .6s .35s ease forwards", textAlign: "center" }}>
            <div style={{ fontFamily: ULIGER_FONT_DISPLAY, fontSize: 36, fontWeight: 700, color: T.textH, letterSpacing: ".01em" }}>
              Uliger
            </div>
            <div style={{ fontFamily: ULIGER_FONT_ACCENT, fontSize: 19, color: D.navy, marginTop: 2 }}>
              нэгэн үлгэрийн орон зай ✶
            </div>
          </div>
          <div style={{ width: 130, height: 4, borderRadius: 4, background: T.s3, marginTop: 6, overflow: "hidden" }}>
            <div style={{ width: progress + "%", height: "100%", borderRadius: 4, background: D.mustard, transition: "width .2s" }} />
          </div>
        </div>

        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      </div>
    );
  }

  return <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:T.bg,position:"relative",overflow:"hidden"}}>
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
      <div style={{opacity:0,animation:"fadeUp .6s .2s ease forwards"}}>
        <Toono size={72} color={T.accent}/>
      </div>
      <div style={{opacity:0,animation:"fadeUp .6s .4s ease forwards",textAlign:"center"}}>
        <div style={{fontFamily:"'Stardom','Helvetica Neue',Arial,sans-serif",fontSize:34,fontWeight:400,color:T.textH,letterSpacing:".02em"}}>Uliger</div>
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
