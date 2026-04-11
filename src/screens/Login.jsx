"use client";
import { useState } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS, seedDemoData } from "@/lib/store";
import { DB, isSupabaseReady, syncFromSupabase, fetchPublicData } from "@/lib/supabase";
import { getAllWorks, getCreators } from "@/lib/utils";
import { toast } from "@/components/layout/Toast";
import Toono from "@/components/atoms/Toono";
import PBtn from "@/components/atoms/PBtn";
import {
  IcBack, IcEye, IcEyeOff, IcWarning, IcCheck,
  IcFieldFashion, IcFieldTextile, IcFieldArt, IcFieldDirection,
  IcFieldGraphic, IcFieldPhoto, IcField3D, IcFieldSpace,
  IcFieldJewelry, IcFieldCeramic, IcFieldWood, IcFieldLeather, IcFieldHome
} from "@/components/icons";

export default function Login({ nav }) {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(0);
  const [role, setRole] = useState("");
  const [signupField, setSignupField] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});
  const [agreeItems, setAgreeItems] = useState({ terms: false, privacy: false, age: false, marketing: false });

  const validate = () => {
    const e = {};
    if (!email) e.email = "Имэйл оруулна уу";
    else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) e.email = "Зөв имэйл оруулна уу";
    if (!pw) e.pw = "Нууц үг оруулна уу";
    else if (pw.length < 6) e.pw = "Нууц үг 6-аас дээш тэмдэгт байх ёстой";
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);

    if (isSupabaseReady()) {
      const { user, error } = await DB.signIn(email, pw);
      setLoading(false);
      if (error) {
        const msg = error.message || "";
        if (msg.includes("Invalid login") || msg.includes("credentials")) {
          setErrors({ email: " ", pw: "Имэйл эсвэл нууц үг буруу байна" });
        } else if (msg.includes("Email not confirmed")) {
          setErrors({ email: "Имэйл хаяг баталгаажаагүй байна" });
        } else if (msg.includes("not found") || msg.includes("User")) {
          setErrors({ email: "Энэ имэйлээр бүртгэлгүй байна" });
        } else {
          setErrors({ email: msg });
        }
        return;
      }
      const synced = await syncFromSupabase();
      if (synced) {
        await fetchPublicData();
        nav(GS.needsProfileSetup ? "profile-setup" : "home");
        toast(`Тавтай морил, ${GS.user.name.split(" ")[0]||""}! ${getAllWorks().length} бүтээл · ${getCreators().length} бүтээлч`,"success");
      }
    } else {
      setLoading(false);
      toast("Сервертэй холбогдож чадсангүй. Дахин оролдоно уу.", "error");
    }
  };

  const handleSignup = async () => {
    const e = validate();
    if (!name) e.name = "Нэр оруулна уу";
    if (pw !== pwConfirm) e.pwConfirm = "Нууц үг таарахгүй байна";
    if (!agreeItems.terms || !agreeItems.privacy || !agreeItems.age) e.agree = "Шаардлагатай нөхцлүүдийг зөвшөөрнө үү";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);

    if (isSupabaseReady()) {
      const { user, error } = await DB.signUp(email, pw, name.trim(), role || "buyer");
      setLoading(false);
      if (error) {
        if (error.message.includes("already registered")) setErrors({email:"Энэ имэйл бүртгэлтэй байна"});
        else if (error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("email rate")) setErrors({email:"Имэйл хязгаар хэтэрлээ. Хэдэн минут хүлээгээд дахин оролдоно уу."});
        else setErrors({email: error.message});
        toast("Бүртгэл амжилтгүй","error");
        return;
      }
      // Set basic state immediately
      GS.isLoggedIn = true;
      GS.currentRole = role || "buyer";
      GS.user.name = name.trim();
      GS.user.field = signupField || "";
      GS.user.id = user?.id;
      GS.needsProfileSetup = true;
      saveGS();
      // Full sync so WORKS + CREATORS populate from Supabase
      syncFromSupabase().catch(() => {});
      nav("profile-setup");
      toast(`Тавтай морил, ${name.split(" ")[0]}!`,"success");
    } else {
      setTimeout(() => {
        setLoading(false);
        seedDemoData(role || "buyer", name.trim());
        GS.user.field = signupField || "";
        nav("profile-setup");
        toast(`Тавтай морил, ${name.split(" ")[0]}!`,"success");
      }, 800);
    }
  };

  return <div style={{height:"100%",display:"flex",flexDirection:"column",background:T.bg,alignItems:"center"}}>
    <div style={{width:"100%",maxWidth:480,height:"100%",display:"flex",flexDirection:"column"}}>
    <div style={{padding:"20px 20px 0",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
      <button type="button" onClick={() => step > 0 ? setStep(step - 1) : nav("onboarding")} style={{background:"none",border:"none",color:T.textH,cursor:"pointer",display:"flex"}}><IcBack/></button>
      <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:18,fontWeight:700,color:T.textH}}>{mode==="login"?"Нэвтрэх":"Бүртгүүлэх"}</div>
    </div>

    <div style={{flex:1,padding:"24px 24px 40px",overflowY:"auto",scrollbarWidth:"none"}}>
      {/* Logo */}
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{display:"inline-flex",width:68,height:68,borderRadius:20,background:T.accentSub,border:`1px solid ${T.accentGlow}`,alignItems:"center",justifyContent:"center",marginBottom:12}}>
          <Toono size={42} color={T.accent}/>
        </div>
        <div style={{fontFamily:"'Stardom','Helvetica Neue',Arial,sans-serif",fontSize:28,fontWeight:400,color:T.textH,letterSpacing:".02em"}}>The TOONO</div>
        {mode==="login"&&<div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub,marginTop:4}}>Бүртгэлдээ нэвтэрнэ үү</div>}
      </div>

      {mode==="login"&&<>
        {/* Email */}
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:7}}>Имэйл</div>
          <input
            autoFocus
            type="email" value={email} placeholder="name@email.com"
            onChange={e => {setEmail(e.target.value);setErrors(er => ({...er,email:""}));}}
            onKeyDown={e => e.key==="Enter"&&document.getElementById("pw-input")?.focus()}
            style={{width:"100%",background:T.s1,border:`1.5px solid ${errors.email?T.red:email&&email.includes("@")?T.green:T.border}`,borderRadius:13,padding:"13px 16px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,outline:"none",boxSizing:"border-box",transition:"border-color .15s"}}
          />
          {errors.email&&<div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.red,marginTop:5,display:"flex",alignItems:"center",gap:4}}><span style={{display:"flex"}}><IcWarning/></span>{errors.email}</div>}
        </div>

        {/* Password */}
        <div style={{marginBottom:6}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:7}}>Нууц үг</div>
          <div style={{position:"relative"}}>
            <input
              id="pw-input" type={showPw?"text":"password"} value={pw} placeholder="••••••••"
              onChange={e => {setPw(e.target.value);setErrors(er => ({...er,pw:""}));}}
              onKeyDown={e => e.key==="Enter"&&handleLogin()}
              style={{width:"100%",background:T.s1,border:`1.5px solid ${errors.pw?T.red:T.border}`,borderRadius:13,padding:"13px 44px 13px 16px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,outline:"none",boxSizing:"border-box",transition:"border-color .15s"}}
            />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.textSub,fontSize:16,padding:2}}>{showPw?<IcEyeOff/>:<IcEye/>}</button>
          </div>
          {errors.pw&&<div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.red,marginTop:5,display:"flex",alignItems:"center",gap:4}}><span style={{display:"flex"}}><IcWarning/></span>{errors.pw}</div>}
        </div>

        <div style={{textAlign:"right",marginBottom:20}}>
          <button type="button" onClick={async () => {
            if(!email){toast("Имэйл хаяг оруулна уу","error");return;}
            if(isSupabaseReady()){
              const {error}=await DB.resetPassword(email);
              toast(error?"Алдаа гарлаа":"Нууц үг сэргээх имэйл илгээлээ",error?"error":"success");
            } else { toast("Сервертэй холбогдоогүй байна","error"); }
          }} style={{background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.accent,cursor:"pointer"}}>Нууц үг мартсан уу?</button>
        </div>

        <PBtn full loading={loading} onClick={handleLogin}>Нэвтрэх</PBtn>

        <div style={{textAlign:"center",marginTop:8,marginBottom:20}}>
          <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub}}>Бүртгэлгүй юу? </span>
          <button type="button" onClick={() => {setMode("signup");setStep(0);setErrors({});}} style={{background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:700,color:T.accent,cursor:"pointer"}}>Бүртгүүлэх</button>
        </div>
      </>}

      {mode==="signup"&&step===0&&<>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:17,fontWeight:700,color:T.textH,marginBottom:6}}>Та ямар зорилгоор ашиглах вэ?</div>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub,marginBottom:20}}>Дараа өөрчилж болно.</div>
        {[["creator","Бүтээлч","Бүтээл байршуулах · зарах · захиалга авах"],["buyer","Худалдан авагч","Үзэх · худалдаж авах · захиалах"]].map(r => <button type="button" key={r[0]} onClick={() => setRole(r[0])} style={{width:"100%",background:role===r[0]?T.accentSub:T.s1,border:`1.5px solid ${role===r[0]?T.accent:T.border}`,borderRadius:16,padding:"18px",cursor:"pointer",textAlign:"left",marginBottom:12,display:"flex",gap:14,alignItems:"center"}}>
          <div style={{flex:1}}><div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:16,fontWeight:700,color:T.textH,marginBottom:3}}>{r[1]}</div><div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.textSub}}>{r[2]}</div></div>
          {role===r[0]&&<span style={{color:T.accent}}><IcCheck/></span>}
        </button>)}
        <PBtn full disabled={!role} onClick={() => role&&setStep(1)}>Дараах</PBtn>
        <div style={{textAlign:"center",marginTop:14,marginBottom:20}}>
          <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub}}>Бүртгэлтэй юу? </span>
          <button type="button" onClick={() => {setMode("login");setErrors({});}} style={{background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:700,color:T.accent,cursor:"pointer"}}>Нэвтрэх</button>
        </div>
      </>}

      {mode==="signup"&&step===1&&<>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:17,fontWeight:700,color:T.textH,marginBottom:6}}>{role==="creator"?"Таны мэргэжил / чиглэл":"Таны сонирхол"}</div>
        <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub,marginBottom:20}}>{role==="creator"?"Үндсэн чиглэлээ сонгоно уу. Нэгээс олон сонгож болно.":"Ямар чиглэлийн бүтээлд сонирхолтой вэ?"}</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:24}}>
          {(role==="creator"
            ?[["Fashion Design",<IcFieldFashion/>],["Textile Design",<IcFieldTextile/>],["Fine Art",<IcFieldArt/>],["Interior Design",<IcFieldDirection/>],["Graphic Design",<IcFieldGraphic/>],["Photography",<IcFieldPhoto/>],["3D Design",<IcField3D/>],["Industrial Design",<IcFieldSpace/>],["Jewelry Design",<IcFieldJewelry/>],["Ceramic",<IcFieldCeramic/>],["Woodcraft",<IcFieldWood/>],["Leatherwork",<IcFieldLeather/>]]
            :[["Fashion Design",<IcFieldFashion/>],["Textile Design",<IcFieldTextile/>],["Fine Art",<IcFieldArt/>],["Graphic Design",<IcFieldGraphic/>],["Photography",<IcFieldPhoto/>],["3D Design",<IcField3D/>],["Jewelry Design",<IcFieldJewelry/>]]
          ).map(([label, icon]) => {
            const sel = signupField.includes(label);
            return <button type="button" key={label} onClick={() => setSignupField(sel?signupField.replace(label+", ","").replace(label,""):signupField?(signupField+", "+label):label)} style={{display:"flex",alignItems:"center",gap:8,padding:"12px 16px",borderRadius:14,cursor:"pointer",background:sel?T.accentSub:T.s1,border:`1.5px solid ${sel?T.accent:T.border}`,transition:"all .15s"}}>
              <span style={{display:"flex",color:sel?T.accent:T.textSub,flexShrink:0}}>{icon}</span>
              <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:sel?700:500,color:sel?T.accent:T.textH}}>{label}</span>
              {sel&&<span style={{color:T.accent,marginLeft:4}}><IcCheck/></span>}
            </button>;
          })}
        </div>
        {signupField&&<div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:T.accent,marginBottom:12}}>{signupField.split(", ").length} чиглэл сонгогдлоо</div>}
        <PBtn full disabled={!signupField} onClick={() => setStep(2)}>Дараах</PBtn>
        <div style={{textAlign:"center",marginTop:10}}>
          <button type="button" onClick={() => setStep(0)} style={{background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,color:T.textSub,cursor:"pointer"}}>← Буцах</button>
        </div>
      </>}

      {mode==="signup"&&step===2&&<>
        {/* Name */}
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:7}}>Нэр / Хочоо</div>
          <input value={name} onChange={e => {setName(e.target.value);setErrors(er => ({...er,name:""}));}} placeholder="Уугана Болд" style={{width:"100%",background:T.s1,border:`1.5px solid ${errors.name?T.red:T.border}`,borderRadius:13,padding:"13px 16px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,outline:"none",boxSizing:"border-box"}}/>
          {errors.name&&<div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.red,marginTop:5}}>{errors.name}</div>}
        </div>
        {/* Email */}
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:7}}>Имэйл</div>
          <input type="email" value={email} onChange={e => {setEmail(e.target.value);setErrors(er => ({...er,email:""}));}} placeholder="name@email.com" style={{width:"100%",background:T.s1,border:`1.5px solid ${errors.email?T.red:T.border}`,borderRadius:13,padding:"13px 16px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,outline:"none",boxSizing:"border-box"}}/>
          {errors.email&&<div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.red,marginTop:5}}>{errors.email}</div>}
        </div>
        {/* Password */}
        <div style={{marginBottom:14}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:7}}>Нууц үг</div>
          <div style={{position:"relative"}}>
            <input type={showPw?"text":"password"} value={pw} onChange={e => {setPw(e.target.value);setErrors(er => ({...er,pw:""}));}} placeholder="6-аас дээш тэмдэгт" style={{width:"100%",background:T.s1,border:`1.5px solid ${errors.pw?T.red:T.border}`,borderRadius:13,padding:"13px 44px 13px 16px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,outline:"none",boxSizing:"border-box"}}/>
            <button type="button" onClick={() => setShowPw(!showPw)} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:T.textSub,fontSize:16}}>
              {showPw?<IcEyeOff/>:<IcEye/>}
            </button>
          </div>
          {pw.length>0&&<div style={{display:"flex",gap:4,marginTop:6}}>
            {[{l:"Богино",ok:pw.length>=6},{l:"Дунд",ok:pw.length>=8},{l:"Хүчтэй",ok:pw.length>=10&&/[0-9]/.test(pw)}].map((s,i) => <div key={i} style={{flex:1,height:3,borderRadius:2,background:s.ok?T.green:T.border,transition:"background .2s"}}/>)}
          </div>}
          {errors.pw&&<div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.red,marginTop:5}}>{errors.pw}</div>}
        </div>
        {/* Confirm */}
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:7}}>Нууц үг давтах</div>
          <input type="password" value={pwConfirm} onChange={e => {setPwConfirm(e.target.value);setErrors(er => ({...er,pwConfirm:""}));}} placeholder="Нууц үгийг дахин оруулна уу" style={{width:"100%",background:T.s1,border:`1.5px solid ${errors.pwConfirm?T.red:pwConfirm&&pwConfirm===pw?T.green:T.border}`,borderRadius:13,padding:"13px 16px",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:14,color:T.textH,outline:"none",boxSizing:"border-box"}}/>
          {pwConfirm&&pwConfirm===pw&&<div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.green,marginTop:5}}><span style={{display:"flex",marginRight:4}}><IcCheck/></span>Нууц үг таарч байна</div>}
          {errors.pwConfirm&&<div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.red,marginTop:5}}>{errors.pwConfirm}</div>}
        </div>
        {/* PIPA Consent */}
        <div style={{background:T.s1,border:`1px solid ${errors.agree?T.red:T.border}`,borderRadius:14,padding:"14px 16px",marginBottom:18}}>
          <div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:700,color:T.textH,marginBottom:10}}>Зөвшөөрөл</div>
          {[
            {key:"terms",label:"[Шаардлагатай] Үйлчилгээний нөхцөл",required:true,link:"terms"},
            {key:"privacy",label:"[Шаардлагатай] Хувийн мэдээлэл цуглуулах, ашиглах",required:true,link:"privacy"},
            {key:"age",label:"[Шаардлагатай] 14 нас дээш болохоо баталж байна",required:true},
            {key:"marketing",label:"[Сонголтоор] Маркетинг мэдээлэл хүлээн авах",required:false},
          ].map(item => <div key={item.key} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
            <input type="checkbox" checked={!!agreeItems[item.key]} onChange={e => setAgreeItems(prev => ({...prev,[item.key]:e.target.checked}))} style={{accentColor:T.accent,width:16,height:16,flexShrink:0,cursor:"pointer"}}/>
            <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:12,color:item.required?T.textB:T.textSub,flex:1,lineHeight:1.5}}>{item.label}</span>
            {item.link&&<button type="button" onClick={() => nav(item.link)} style={{background:"none",border:"none",fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.accent,cursor:"pointer",flexShrink:0}}>Үзэх</button>}
          </div>)}
          <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10}}>
            <input type="checkbox" checked={agreeItems.terms && agreeItems.privacy && agreeItems.age && agreeItems.marketing} onChange={e => {const v=e.target.checked; setAgreeItems({terms:v,privacy:v,age:v,marketing:v});}} style={{accentColor:T.accent,width:18,height:18,flexShrink:0,cursor:"pointer"}}/>
            <span style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:13,fontWeight:700,color:T.accent}}>Бүгдийг зөвшөөрөх</span>
          </div>
        </div>
        {errors.agree&&<div style={{fontFamily:"'Helvetica Neue', Arial, sans-serif",fontSize:11,color:T.red,marginTop:-14,marginBottom:14}}>{errors.agree}</div>}
        <PBtn full loading={loading} onClick={handleSignup}>Бүртгэл үүсгэх</PBtn>
        <div style={{height:24}}/>
      </>}
    </div>
    </div>
  </div>;
}
