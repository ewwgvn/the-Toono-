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
    // 책을 펼친 듯한 좌/우 두 '페이지' 구조 — 왼쪽 네이비 삽화면 / 오른쪽 크림 글면,
    // 가운데를 세로 스캘럽 제본선으로 구분 (실제 펼친 책처럼 가로로 분할)
    return (
      <div style={{ height: "100%", width: "100vw", display: "flex", flexDirection: "row", background: T.bg, position: "relative", marginLeft: "calc(50% - 50vw)", marginRight: "calc(50% - 50vw)", overflow: "hidden" }}>
        {/* 왼쪽 페이지 — 삽화면 */}
        <div style={{ flex: "0 0 44%", background: D.ink, position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <StoryDecor variant="stars" size={44} style={{ position: "absolute", top: 22, left: 16, opacity: .9 }} />
          <StoryDecor variant="stars" size={32} style={{ position: "absolute", bottom: 36, left: 14, opacity: .7 }} />
          <StoryDecor variant="moon" size={56} style={{ position: "absolute", top: 16, right: -10, opacity: .85 }} />
          {/* 꽃잎 모양 블롭 프레임 */}
          <div style={{
            width: 104, height: 104, borderRadius: "42% 58% 53% 47% / 48% 45% 55% 52%",
            background: D.gold, display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0, animation: "fadeUp .6s .15s ease forwards", border: `3px solid ${D.paper}`,
          }}>
            <Toono size={46} color={D.ink} />
          </div>
        </div>

        {/* 책장을 가르는 세로 스캘럽 제본선 */}
        <ScallopEdge color={T.bg} orientation="vertical" size={18} style={{ marginLeft: -1 }} />

        {/* 오른쪽 페이지 — 글면 */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, position: "relative", padding: "0 14px" }}>
          <StoryDecor variant="flower" size={42} style={{ position: "absolute", right: 14, top: 26, opacity: .8 }} />
          <StoryDecor variant="cloud" size={44} style={{ position: "absolute", right: 8, bottom: 64, opacity: .6 }} />
          <div style={{ opacity: 0, animation: "fadeUp .6s .35s ease forwards", textAlign: "center" }}>
            <div style={{ fontFamily: ULIGER_FONT_DISPLAY, fontSize: 30, fontWeight: 700, color: T.textH, letterSpacing: ".01em" }}>
              Uliger
            </div>
            <div style={{ fontFamily: ULIGER_FONT_ACCENT, fontSize: 17, color: D.ink, marginTop: 2 }}>
              нэгэн үлгэрийн орон зай ✶
            </div>
          </div>
          <div style={{ width: 96, height: 4, borderRadius: 4, background: T.s3, marginTop: 4, overflow: "hidden" }}>
            <div style={{ width: progress + "%", height: "100%", borderRadius: 4, background: D.gold, transition: "width .2s" }} />
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
