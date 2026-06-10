"use client";
import { useState, useCallback, useEffect, lazy, Suspense, Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("[App] Chunk error:", error, info); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 12, padding: 32 }}>
          <span style={{ fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 15, fontWeight: 600, color: T.textH }}>Хуудас ачааллахад алдаа гарлаа</span>
          <button type="button" onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{ padding: "10px 24px", background: T.accent, color: "#fff", border: "none", borderRadius: 20, fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Дахин оролдох
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
import { T } from "@/theme/colors";
import { GS, saveGS, loadGS, resetGS, getUnreadChat, getUnreadNotif } from "@/lib/store";
import { DB, isSupabaseReady, initSupabase, syncFromSupabase, fetchPublicData } from "@/lib/supabase";
import { getAllWorks, getCreators } from "@/lib/utils";
import { IcHome, IcSearch, IcPlus, IcMsg, IcProfile, IcBell, IcCart, IcFeed } from "@/components/icons";
import Toono from "@/components/atoms/Toono";
import Toast from "@/components/layout/Toast";
import { toast } from "@/components/layout/Toast";
import NetworkStatus from "@/components/layout/NetworkStatus";
import PWAInstall from "@/components/shared/PWAInstall";

// Critical screens — loaded eagerly
import Splash from "@/screens/Splash";
import Onboarding from "@/screens/Onboarding";
import Login from "@/screens/Login";
import Home from "@/screens/Home";
import Explore from "@/screens/Explore";

// Lazy-loaded screens — reduces initial bundle size
const ProfileSetup = lazy(() => import("@/screens/ProfileSetup"));
const WorkDetail = lazy(() => import("@/screens/WorkDetail"));
const CreatorProfile = lazy(() => import("@/screens/CreatorProfile"));
const CommissionScreen = lazy(() => import("@/screens/CommissionScreen"));
const Checkout = lazy(() => import("@/screens/Checkout"));
const ChatList = lazy(() => import("@/screens/ChatList"));
const ChatRoom = lazy(() => import("@/screens/ChatRoom"));
const Notifications = lazy(() => import("@/screens/Notifications"));
const Settings = lazy(() => import("@/screens/Settings"));
const EditProfile = lazy(() => import("@/screens/EditProfile"));
const Dashboard = lazy(() => import("@/screens/Dashboard"));
const CommStatus = lazy(() => import("@/screens/CommStatus"));
const OrderDetail = lazy(() => import("@/screens/OrderDetail"));
const OrderList = lazy(() => import("@/screens/OrderList"));
const SavedWorks = lazy(() => import("@/screens/SavedWorks"));
const FollowList = lazy(() => import("@/screens/FollowList"));
const Upload = lazy(() => import("@/screens/Upload"));
const CommManage = lazy(() => import("@/screens/CommManage"));
const CartScreen = lazy(() => import("@/screens/CartScreen"));
const DisputeCenter = lazy(() => import("@/screens/DisputeCenter"));
const Referral = lazy(() => import("@/screens/Referral"));
const FeedScreen = lazy(() => import("@/screens/FeedScreen"));
const Portfolio = lazy(() => import("@/screens/Portfolio"));
const ReviewWrite = lazy(() => import("@/screens/ReviewWrite"));
const ReturnRequest = lazy(() => import("@/screens/ReturnRequest"));
const Report = lazy(() => import("@/screens/Report"));
const Terms = lazy(() => import("@/screens/Terms"));
const Privacy = lazy(() => import("@/screens/Privacy"));

const F = "'Helvetica Neue', Arial, sans-serif";
const APP_VERSION = "2.1.0";
const PROTECTED = new Set(["upload", "settings", "edit-profile", "dashboard", "saved", "follows", "comm-manage", "comm-status", "review-write", "report", "portfolio", "dispute", "referral", "notifications", "checkout", "order-detail", "order-list", "cart", "chatroom"]);
const PROTECTED_TABS = new Set(["chat", "me"]);

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [tab, setTab] = useState("home");
  const [tick, setTick] = useState(0);
  const [selectedWorkId, setSelectedWorkId] = useState(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState(null);
  const [loginMode, setLoginMode] = useState("login");
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
        try {
          const session = await DB.getSession();
          if (session) {
            const synced = await syncFromSupabase();
            if (synced) { await fetchPublicData(); setScreen(GS.needsProfileSetup ? "profile-setup" : "main"); return; }
          }
        } catch (err) {
          console.error("[App] Supabase sync error:", err);
          setTimeout(() => toast("Сервертэй холбогдоход алдаа гарлаа", "error"), 2000);
        }
      } else {
        console.warn("[App] Supabase not configured — check NEXT_PUBLIC_SUPABASE_URL / ANON_KEY env vars");
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

      // Parse deep link query params after initial load
      try {
        const params = new URLSearchParams(window.location.search);
        const workId = params.get("work");
        const creatorId = params.get("creator");
        if (workId) { setSelectedWorkId(Number(workId) || workId); setScreen("work"); }
        else if (creatorId) { setSelectedCreatorId(creatorId); setScreen("profile"); }
      } catch (e) {}
    };
    init();

    // Browser back button support
    const handlePopState = (e) => {
      if (e.state?.screen) {
        setScreen(e.state.screen);
        if (e.state.tab) setTab(e.state.tab);
      }
    };
    window.addEventListener("popstate", handlePopState);

    // Multi-tab sync via storage event
    const handleStorage = (e) => {
      if (e.key === "toono-app-state" && e.newValue) {
        loadGS();
        setTick(t => t + 1);
      }
    };
    window.addEventListener("storage", handleStorage);

    // Supabase auth state changes (JWT refresh, logout from other tabs)
    let authSub = null;
    if (isSupabaseReady()) {
      import("@/lib/supabase").then(({ supabase }) => {
        if (!supabase?.auth) return;
        const { data } = supabase.auth.onAuthStateChange((event) => {
          if (event === "SIGNED_OUT") {
            resetGS();
            setScreen("onboarding");
          } else if (event === "TOKEN_REFRESHED") {
            // Silent refresh, no action needed
          }
        });
        authSub = data?.subscription;
      });
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("storage", handleStorage);
      authSub?.unsubscribe?.();
    };
  }, []);

  const nav = useCallback((s, data) => {
    const tabs = { home: 1, explore: 1, chat: 1, me: 1 };

    // Auth guard — redirect unauthenticated users to login
    if (!GS.isLoggedIn && (PROTECTED.has(s) || PROTECTED_TABS.has(s))) {
      setLoginMode("login");
      setHistory(h => [...h, { screen, tab }]);
      setScreen("login");
      toast("Нэвтэрч орно уу", "info");
      return;
    }

    if (data?.workId !== undefined) setSelectedWorkId(data.workId);
    if (data?.creatorId !== undefined) setSelectedCreatorId(data.creatorId);
    if (s === "login" && data?.mode) setLoginMode(data.mode);

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

    // Update browser URL for deep linking
    try {
      let url = "/";
      if (s === "work" && data?.workId) url = `/?work=${data.workId}`;
      else if (s === "profile" && data?.creatorId) url = `/?creator=${data.creatorId}`;
      else if (tabs[s]) url = `/?tab=${s}`;
      window.history.pushState({ screen: s, tab: tabs[s] ? s : tab }, "", url);
    } catch (e) {}

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
    if (screen === "login") return <Login nav={nav} initialMode={loginMode} />;
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
    if (screen === "comm-status") return <CommStatus {...p} />;
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
    if (tab === "me") return <CreatorProfile {...p} creatorId={GS.user.id} />;
    return <Home {...p} />;
  };

  const isMain = !["splash", "onboarding", "login", "chatroom", "profile-setup"].includes(screen);
  const navItems = [
    { id: "home", label: "Нүүр", Ic: IcHome },
    { id: "explore", label: "Хайлт", Ic: IcSearch },
    { id: "upload", label: "Байршуулах", Ic: null },
    { id: "feed", label: "Фийд", Ic: IcFeed },
    { id: "me", label: "Миний", Ic: IcProfile, badge: getUnreadNotif() },
  ];

  return (
    <div style={{ width: "100%", height: "100dvh", background: "#FFFFFF", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>

      {/* ── DESKTOP TOP NAV ── */}
      {isMain && <div className="toono-desktop-nav" style={{ background: "#FFFFFF", borderBottom: `1px solid ${T.border}`, padding: "0 32px", position: "sticky", top: 0, zIndex: 100, justifyContent: "center" }}>
        <div style={{ maxWidth: "100%", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", height: 56 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <div onClick={() => nav("home")} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <img src="/uliger-world-logo.png?v=2" alt="Uliger World" style={{ height: 52, width: "auto", display: "block" }} />
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {[["home", "Нүүр"], ["explore", "Хайлт"], ["feed", "Фийд"]].map(([id, label]) =>
                <button type="button" key={id} onClick={() => nav(id)} style={{
                  background: "transparent", border: "none", padding: "8px 14px",
                  fontFamily: F, fontSize: 13, fontWeight: tab === id ? 600 : 400,
                  color: tab === id ? T.textH : T.textSub, cursor: "pointer",
                  borderBottom: tab === id ? `2px solid ${T.accent}` : "2px solid transparent",
                  transition: "all 150ms ease",
                }}>{label}</button>
              )}
            </div>
          </div>
          <div style={{ flex: 1, maxWidth: 360, margin: "0 24px" }}>
            <div onClick={() => nav("explore")} style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <IcSearch /><span style={{ fontFamily: F, fontSize: 13, color: T.textSub }}>Хайлт...</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {GS.currentRole === "creator" && <button type="button" onClick={() => nav("upload")} style={{ display: "flex", alignItems: "center", gap: 6, background: T.accent, border: "none", borderRadius: 20, padding: "8px 18px", fontFamily: F, fontSize: 13, fontWeight: 600, color: "#FFFFFF", cursor: "pointer" }}><IcPlus /> Байршуулах</button>}
            {[
              { action: "cart", Ic: IcCart, badge: GS.cart.length },
              { action: "notifications", Ic: IcBell, badge: getUnreadNotif() },
              { action: "chat", Ic: IcMsg, badge: getUnreadChat() },
            ].map(({ action, Ic, badge }) => (
              <button type="button" key={action} onClick={() => nav(action)} style={{ position: "relative", width: 36, height: 36, borderRadius: 8, background: "transparent", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: T.textH }}>
                <Ic />
                {badge > 0 && <div style={{ position: "absolute", top: -3, right: -3, minWidth: 14, height: 14, borderRadius: 7, background: T.red, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, fontWeight: 600, color: "#fff" }}>{badge}</span></div>}
              </button>
            ))}
            <button type="button" onClick={() => nav("me")} style={{ width: 32, height: 32, borderRadius: "50%", background: T.s2, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden" }}>
              {GS.user.photo ? <img src={GS.user.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ color: T.textH, fontSize: 11, fontWeight: 600 }}>{(GS.user.name || "?")[0]}</span>}
            </button>
          </div>
        </div>
      </div>}

      {/* ── MAIN CONTENT ── */}
      <div className="toono-content" style={{ flex: 1, overflow: "hidden", position: "relative", width: "100%" }}>
        <div key={screen + tab} style={{ height: "100%", animation: "fadeIn .2s ease" }}>
          <ErrorBoundary>
            <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: T.textDim, fontFamily: F, fontSize: 13 }}>Loading...</div>}>
              {renderScreen()}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      {isMain && <nav role="navigation" aria-label="Main" className="toono-mobile-nav" style={{
        background: "rgba(253,252,250,0.95)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        borderTop: `1px solid ${T.borderLight}`,
        paddingTop: 4, paddingLeft: 4, paddingRight: 4,
        paddingBottom: "calc(8px + env(safe-area-inset-bottom, 0px))",
        justifyContent: "space-around", alignItems: "center",
        flexShrink: 0, position: "relative", zIndex: 50,
      }}>
        {navItems.map(item => {
          const active = tab === item.id && isMain;
          return <button type="button" key={item.id} aria-label={item.label || item.id} aria-current={active ? "page" : undefined} onClick={() => nav(item.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer", background: "none", border: "none", padding: "6px 10px 4px", minWidth: 52, minHeight: 44, justifyContent: "center", position: "relative" }}>
            {item.id === "upload"
              ? <div style={{ width: 46, height: 46, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", marginTop: -18, color: "#FFFFFF", boxShadow: "0 4px 20px rgba(38,129,218,0.35)" }}><IcPlus /></div>
              : <>
                <div style={{ position: "relative", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: active ? T.accent : T.textDim, transition: "color .15s" }}><item.Ic /></span>
                  {item.badge > 0 && <div style={{ position: "absolute", top: -3, right: -6, minWidth: 14, height: 14, borderRadius: 7, background: T.red, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px", border: "1.5px solid #fff" }}><span style={{ fontFamily: F, fontSize: 8, fontWeight: 700, color: "#fff" }}>{item.badge}</span></div>}
                </div>
                <span style={{ fontFamily: F, fontSize: 9.5, fontWeight: active ? 700 : 400, color: active ? T.accent : T.textDim, lineHeight: 1, transition: "all .15s", letterSpacing: active ? "0.01em" : "0" }}>{item.label}</span>
                {active && <span className="toono-nav-pip" style={{ transition: "opacity .2s" }} />}
              </>}
          </button>;
        })}
      </nav>}

      {/* Footer — desktop only */}
      {isMain && <div className="toono-desktop-only" style={{ textAlign: "center", padding: "12px 0", borderTop: `1px solid ${T.borderLight}` }}><span style={{ fontFamily: F, fontSize: 11, color: T.textSub }}>© 2026 Uliger World</span></div>}

      <Toast />
      <NetworkStatus />
      <PWAInstall />
    </div>
  );
}
