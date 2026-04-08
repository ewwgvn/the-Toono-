"use client";
import { useState, useCallback, useEffect } from "react";
import { T } from "@/theme/colors";
import { GS, saveGS, loadGS, resetGS, getUnreadChat, getUnreadNotif } from "@/lib/store";
import { DB, isSupabaseReady, initSupabase, syncFromSupabase, fetchPublicData } from "@/lib/supabase";
import { getAllWorks, getCreators } from "@/lib/utils";
import { IcHome, IcSearch, IcPlus, IcMsg, IcProfile, IcBell, IcCart } from "@/components/icons";
import Toono from "@/components/atoms/Toono";
import Toast from "@/components/layout/Toast";
import { toast } from "@/components/layout/Toast";
import NetworkStatus from "@/components/layout/NetworkStatus";
import PWAInstall from "@/components/shared/PWAInstall";

// Screens
import Splash from "@/screens/Splash";
import Onboarding from "@/screens/Onboarding";
import Login from "@/screens/Login";
import ProfileSetup from "@/screens/ProfileSetup";
import Home from "@/screens/Home";
import Explore from "@/screens/Explore";
import WorkDetail from "@/screens/WorkDetail";
import CreatorProfile from "@/screens/CreatorProfile";
import CommissionScreen from "@/screens/CommissionScreen";
import Checkout from "@/screens/Checkout";
import ChatList from "@/screens/ChatList";
import ChatRoom from "@/screens/ChatRoom";
import MyProfile from "@/screens/MyProfile";
import Notifications from "@/screens/Notifications";
import Settings from "@/screens/Settings";
import EditProfile from "@/screens/EditProfile";
import Dashboard from "@/screens/Dashboard";
import OrderDetail from "@/screens/OrderDetail";
import OrderList from "@/screens/OrderList";
import SavedWorks from "@/screens/SavedWorks";
import FollowList from "@/screens/FollowList";
import Upload from "@/screens/Upload";
import CommManage from "@/screens/CommManage";
import CartScreen from "@/screens/CartScreen";
import DisputeCenter from "@/screens/DisputeCenter";
import Referral from "@/screens/Referral";
import FeedScreen from "@/screens/FeedScreen";
import Portfolio from "@/screens/Portfolio";
import ReviewWrite from "@/screens/ReviewWrite";
import ReturnRequest from "@/screens/ReturnRequest";
import Report from "@/screens/Report";
import Terms from "@/screens/Terms";
import Privacy from "@/screens/Privacy";

const APP_VERSION = "2.1.0";

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [tab, setTab] = useState("home");
  const [tick, setTick] = useState(0);
  const [selectedWorkId, setSelectedWorkId] = useState(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState(null);
  const [history, setHistory] = useState([]);

  const refresh = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    const init = async () => {
      // Version check
      try {
        const savedVer = localStorage.getItem("toono-version");
        if (savedVer !== APP_VERSION) {
          localStorage.removeItem("toono-app-state");
          localStorage.removeItem("toono-storage");
          localStorage.setItem("toono-version", APP_VERSION);
        }
      } catch (e) {}

      // 1. Try Supabase
      initSupabase();
      if (isSupabaseReady()) {
        const session = await DB.getSession();
        if (session) {
          const synced = await syncFromSupabase();
          if (synced) { await fetchPublicData(); setScreen(GS.needsProfileSetup ? "profile-setup" : "main"); return; }
        }
      }
      // 2. Fallback to localStorage
      const loaded = await loadGS();
      if (loaded && GS.isLoggedIn && GS.user.name) {
        await fetchPublicData();
        setScreen("main");
      } else {
        await new Promise(r => setTimeout(r, 1500));
        if (GS.isLoggedIn && GS.user.name) setScreen("main");
        else { resetGS(); setScreen("onboarding"); }
      }
    };
    init();
  }, []);

  const nav = useCallback((s, data) => {
    const tabs = { home: 1, explore: 1, chat: 1, me: 1 };
    if (data?.workId !== undefined) setSelectedWorkId(data.workId);
    if (data?.creatorId !== undefined) setSelectedCreatorId(data.creatorId);

    if (tabs[s]) {
      setTab(s);
      setScreen("main");
      setHistory([]);
    } else if (s === "feed") {
      setTab("feed");
      setScreen("main");
      setHistory([]);
    } else if (s === "upload") {
      setHistory(h => [...h, { screen, tab }]);
      setScreen("upload");
    } else {
      setHistory(h => [...h, { screen, tab }]);
      setScreen(s);
    }

    // Background refresh on home tab switch
    if (s === "home" && GS.isLoggedIn && isSupabaseReady()) {
      Promise.all([DB.getWorks().catch(() => []), DB.getCreators().catch(() => [])]).then(([ws, cs]) => {
        if (ws.length) { GS.publicWorks = ws.map(w => ({ ...w, creator: w.profiles?.name || "—" })); }
        if (cs.length) { GS.publicCreators = cs.map(c => ({ ...c })); }
        setTick(t => t + 1);
      });
    }
  }, [screen, tab]);

  const goBack = useCallback(() => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setScreen(prev.screen);
      setTab(prev.tab);
    } else {
      setTab("home"); setScreen("main");
    }
  }, [history]);

  const p = { nav, refresh, goBack };

  const renderScreen = () => {
    if (screen === "splash") return <Splash />;
    if (screen === "onboarding") return <Onboarding nav={nav} onDone={() => nav("home")} />;
    if (screen === "login") return <Login nav={nav} />;
    if (screen === "profile-setup") return <ProfileSetup nav={nav} refresh={refresh} goBack={goBack} />;
    if (screen === "work") return <WorkDetail {...p} workId={selectedWorkId} />;
    if (screen === "profile") return <CreatorProfile {...p} creatorId={selectedCreatorId} />;
    if (screen === "commission") return <CommissionScreen {...p} creatorId={selectedCreatorId} />;
    if (screen === "checkout") return <Checkout {...p} workId={selectedWorkId} />;
    if (screen === "chatroom") return <ChatRoom {...p} />;
    if (screen === "order-detail") return <OrderDetail {...p} />;
    if (screen === "order-list") return <OrderList {...p} />;
    if (screen === "notifications") return <Notifications {...p} />;
    if (screen === "settings") return <Settings {...p} />;
    if (screen === "edit-profile") return <EditProfile {...p} />;
    if (screen === "dashboard") return <Dashboard {...p} />;
    if (screen === "saved") return <SavedWorks {...p} />;
    if (screen === "follows") return <FollowList {...p} />;
    if (screen === "upload") return <Upload {...p} />;
    if (screen === "comm-manage") return <CommManage {...p} />;
    if (screen === "review-write") return <ReviewWrite {...p} />;
    if (screen === "report") return <Report {...p} />;
    if (screen === "portfolio") return <Portfolio {...p} />;
    if (screen === "cart") return <CartScreen {...p} />;
    if (screen === "dispute") return <DisputeCenter {...p} />;
    if (screen === "referral") return <Referral {...p} />;
    if (screen === "feed") return <FeedScreen {...p} />;
    if (screen === "terms") return <Terms {...p} />;
    if (screen === "privacy") return <Privacy {...p} />;
    if (screen === "return-request") return <ReturnRequest {...p} />;
    if (tab === "explore") return <Explore {...p} />;
    if (tab === "feed") return <FeedScreen {...p} />;
    if (tab === "chat") return <ChatList nav={nav} refresh={refresh} />;
    if (tab === "me") return <MyProfile {...p} />;
    return <Home {...p} />;
  };

  const isMain = !["splash", "onboarding", "login", "chatroom", "profile-setup"].includes(screen);
  const navItems = [
    { id: "home", label: "Нүүр", Ic: IcHome },
    { id: "explore", label: "Хайлт", Ic: IcSearch },
    { id: "upload", label: "", Ic: null },
    { id: "chat", label: "Зурвас", Ic: IcMsg, badge: getUnreadChat() },
    { id: "me", label: "Миний", Ic: IcProfile, badge: getUnreadNotif() },
  ];

  return (
    <div style={{ width: "100%", height: "100dvh", background: T.bg, display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {/* ── DESKTOP TOP NAV ── */}
      {isMain && <div className="toono-desktop-nav" style={{ background: "rgba(8,9,14,0.95)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${T.border}`, padding: "0 32px", position: "sticky", top: 0, zIndex: 100, justifyContent: "center" }}>
        <div style={{ maxWidth: 1200, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div onClick={() => nav("home")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <Toono size={28} color={T.accent} />
              <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, fontWeight: 700, color: T.textH, letterSpacing: ".05em" }}>The TOONO</span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[["home", "Нүүр"], ["explore", "Хайлт"], ["feed", "Фийд"]].map(([id, label]) =>
                <button key={id} onClick={() => nav(id)} style={{ background: tab === id ? T.accentSub : "transparent", border: `1px solid ${tab === id ? T.accent + "40" : "transparent"}`, borderRadius: 10, padding: "8px 16px", fontFamily: "'DM Sans',system-ui", fontSize: 14, fontWeight: tab === id ? 600 : 400, color: tab === id ? T.accent : T.textSub, cursor: "pointer", transition: "all .2s" }}>{label}</button>
              )}
            </div>
          </div>
          <div style={{ flex: 1, maxWidth: 400, margin: "0 24px" }}>
            <div onClick={() => nav("explore")} style={{ background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12, padding: "10px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <IcSearch /><span style={{ fontFamily: "'DM Sans',system-ui", fontSize: 14, color: T.textSub }}>Хайлт...</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {GS.currentRole === "creator" && <button onClick={() => nav("upload")} style={{ display: "flex", alignItems: "center", gap: 6, background: T.accent, border: "none", borderRadius: 10, padding: "8px 18px", fontFamily: "'DM Sans',system-ui", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer" }}><IcPlus /> Байршуулах</button>}
            <button onClick={() => nav("cart")} style={{ position: "relative", width: 40, height: 40, borderRadius: 10, background: T.s1, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textSub }}>
              <IcCart />
              {GS.cart.length > 0 && <div style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, background: T.red, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{GS.cart.length}</span></div>}
            </button>
            <button onClick={() => nav("notifications")} style={{ position: "relative", width: 40, height: 40, borderRadius: 10, background: T.s1, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textSub }}>
              <IcBell />
              {getUnreadNotif() > 0 && <div style={{ position: "absolute", top: -4, right: -4, width: 8, height: 8, borderRadius: 4, background: T.red }} />}
            </button>
            <button onClick={() => nav("chat")} style={{ position: "relative", width: 40, height: 40, borderRadius: 10, background: T.s1, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textSub }}>
              <IcMsg />
              {getUnreadChat() > 0 && <div style={{ position: "absolute", top: -4, right: -4, minWidth: 16, height: 16, borderRadius: 8, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{getUnreadChat()}</span></div>}
            </button>
            <button onClick={() => nav("me")} style={{ width: 36, height: 36, borderRadius: 12, background: T.accentSub, border: `2px solid ${T.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}>
              {GS.user.photo ? <img src={GS.user.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: T.accent, fontSize: 12, fontWeight: 700 }}>{(GS.user.name || "?")[0]}</span>}
            </button>
          </div>
        </div>
      </div>}

      {/* ── MAIN CONTENT ── */}
      <div className="toono-content" style={{ flex: 1, overflow: "hidden", position: "relative", width: "100%" }}>
        <div key={screen + tab} style={{ height: "100%", animation: "fadeIn .2s ease" }}>
          {renderScreen()}
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      {isMain && <div className="toono-mobile-nav" style={{ background: T.nav, borderTop: `1px solid ${T.border}`, paddingTop: 6, paddingLeft: 4, paddingRight: 4, paddingBottom: "calc(6px + env(safe-area-inset-bottom, 0px))", justifyContent: "space-around", alignItems: "center", flexShrink: 0, position: "relative", zIndex: 50, boxShadow: "0 -4px 20px rgba(0,0,0,0.3)" }}>
        {navItems.map(item => {
          const active = tab === item.id && isMain;
          return <button key={item.id} onClick={() => nav(item.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", background: "none", border: "none", padding: "4px 8px", minWidth: 48, minHeight: 44, justifyContent: "center", position: "relative" }}>
            {item.id === "upload"
              ? <div style={{ width: 50, height: 50, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", marginTop: -20, boxShadow: `0 6px 24px ${T.accentGlow},0 2px 8px rgba(91,143,232,0.5)` }}><IcPlus /></div>
              : <>
                <div style={{ position: "relative", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: active ? T.accent : T.textSub }}><item.Ic /></span>
                  {item.badge > 0 && <div style={{ position: "absolute", top: -4, right: -6, minWidth: 14, height: 14, borderRadius: 7, background: T.red, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}><span style={{ fontFamily: "system-ui", fontSize: 8, fontWeight: 700, color: "#fff" }}>{item.badge}</span></div>}
                </div>
                <span style={{ fontFamily: "system-ui", fontSize: 10, fontWeight: active ? 700 : 400, color: active ? T.accent : T.textSub, lineHeight: 1 }}>{item.label}</span>
              </>}
          </button>;
        })}
      </div>}

      {/* Footer — desktop only */}
      {isMain && <div className="toono-desktop-only" style={{ textAlign: "center", padding: "16px 0", borderTop: `1px solid ${T.border}` }}><span style={{ fontFamily: "'DM Sans',system-ui", fontSize: 11, color: T.textDim }}>© 2026 The TOONO</span></div>}

      <Toast />
      <NetworkStatus />
      <PWAInstall />
    </div>
  );
}
