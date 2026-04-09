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

const F = "'Helvetica Neue', Arial, sans-serif";
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
      try {
        const savedVer = localStorage.getItem("toono-version");
        if (savedVer !== APP_VERSION) {
          localStorage.removeItem("toono-app-state");
          localStorage.removeItem("toono-storage");
          localStorage.setItem("toono-version", APP_VERSION);
        }
      } catch (e) {}

      initSupabase();
      if (isSupabaseReady()) {
        const session = await DB.getSession();
        if (session) {
          const synced = await syncFromSupabase();
          if (synced) { await fetchPublicData(); setScreen(GS.needsProfileSetup ? "profile-setup" : "main"); return; }
        }
      }
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
    <div style={{ width: "100%", height: "100dvh", background: "#FFFFFF", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

      {/* ── DESKTOP TOP NAV ── */}
      {isMain && <div className="toono-desktop-nav" style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E5E5", padding: "0 32px", position: "sticky", top: 0, zIndex: 100, justifyContent: "center" }}>
        <div style={{ maxWidth: 1200, width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div onClick={() => nav("home")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <Toono size={22} color="#111111" />
              <span style={{ fontFamily: F, fontSize: 16, fontWeight: 700, color: "#111111", letterSpacing: "0.05em", textTransform: "uppercase" }}>The TOONO</span>
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[["home", "Нүүр"], ["explore", "Хайлт"], ["feed", "Фийд"]].map(([id, label]) =>
                <button key={id} onClick={() => nav(id)} style={{
                  background: "transparent", border: "none", padding: "8px 14px",
                  fontFamily: F, fontSize: 13, fontWeight: tab === id ? 600 : 400,
                  color: tab === id ? "#111111" : "#999999", cursor: "pointer",
                  borderBottom: tab === id ? "2px solid #111111" : "2px solid transparent",
                  transition: "all 150ms ease",
                }}>{label}</button>
              )}
            </div>
          </div>
          <div style={{ flex: 1, maxWidth: 360, margin: "0 24px" }}>
            <div onClick={() => nav("explore")} style={{ background: "#F7F7F7", border: "1px solid #E5E5E5", borderRadius: 8, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <IcSearch /><span style={{ fontFamily: F, fontSize: 13, color: "#999999" }}>Хайлт...</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {GS.currentRole === "creator" && <button onClick={() => nav("upload")} style={{ display: "flex", alignItems: "center", gap: 6, background: "#111111", border: "none", borderRadius: 20, padding: "8px 18px", fontFamily: F, fontSize: 13, fontWeight: 600, color: "#FFFFFF", cursor: "pointer" }}><IcPlus /> Байршуулах</button>}
            {[
              { action: "cart", Ic: IcCart, badge: GS.cart.length },
              { action: "notifications", Ic: IcBell, badge: getUnreadNotif() },
              { action: "chat", Ic: IcMsg, badge: getUnreadChat() },
            ].map(({ action, Ic, badge }) => (
              <button key={action} onClick={() => nav(action)} style={{ position: "relative", width: 36, height: 36, borderRadius: 8, background: "transparent", border: "1px solid #E5E5E5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#111111" }}>
                <Ic />
                {badge > 0 && <div style={{ position: "absolute", top: -3, right: -3, minWidth: 14, height: 14, borderRadius: 7, background: "#D32F2F", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, fontWeight: 600, color: "#fff" }}>{badge}</span></div>}
              </button>
            ))}
            <button onClick={() => nav("me")} style={{ width: 32, height: 32, borderRadius: "50%", background: "#F7F7F7", border: "1px solid #E5E5E5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}>
              {GS.user.photo ? <img src={GS.user.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: "#111111", fontSize: 11, fontWeight: 600 }}>{(GS.user.name || "?")[0]}</span>}
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
      {isMain && <div className="toono-mobile-nav" style={{
        background: "#FFFFFF", borderTop: "1px solid #F0F0F0",
        paddingTop: 6, paddingLeft: 4, paddingRight: 4,
        paddingBottom: "calc(6px + env(safe-area-inset-bottom, 0px))",
        justifyContent: "space-around", alignItems: "center",
        flexShrink: 0, position: "relative", zIndex: 50,
      }}>
        {navItems.map(item => {
          const active = tab === item.id && isMain;
          return <button key={item.id} onClick={() => nav(item.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", background: "none", border: "none", padding: "4px 8px", minWidth: 48, minHeight: 44, justifyContent: "center", position: "relative" }}>
            {item.id === "upload"
              ? <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#111111", display: "flex", alignItems: "center", justifyContent: "center", marginTop: -16 }}><IcPlus /></div>
              : <>
                <div style={{ position: "relative", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: active ? "#111111" : "#999999" }}><item.Ic /></span>
                  {item.badge > 0 && <div style={{ position: "absolute", top: -4, right: -8, minWidth: 14, height: 14, borderRadius: 7, background: "#D32F2F", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}><span style={{ fontFamily: F, fontSize: 8, fontWeight: 600, color: "#fff" }}>{item.badge}</span></div>}
                </div>
                <span style={{ fontFamily: F, fontSize: 10, fontWeight: active ? 600 : 400, color: active ? "#111111" : "#999999", lineHeight: 1 }}>{item.label}</span>
              </>}
          </button>;
        })}
      </div>}

      {/* Footer — desktop only */}
      {isMain && <div className="toono-desktop-only" style={{ textAlign: "center", padding: "12px 0", borderTop: "1px solid #F0F0F0" }}><span style={{ fontFamily: F, fontSize: 11, color: "#999999" }}>© 2026 The TOONO</span></div>}

      <Toast />
      <NetworkStatus />
      <PWAInstall />
    </div>
  );
}
