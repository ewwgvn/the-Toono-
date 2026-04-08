"use client";
import { T } from "@/theme/colors";
import { IcSearch, IcPlus, IcCart, IcBell, IcMsg } from "@/components/icons";

// ── DESKTOP TOP NAV ──
// Note: Toono logo component needs to be passed as prop or imported separately
// since it depends on TOONO_B64 asset

export default function DesktopNav({
  activeTab,
  onNav,
  cartCount = 0,
  unreadNotif = 0,
  unreadChat = 0,
  currentRole,
  userPhoto,
  userName,
  ToonoLogo,
}) {
  return (
    <div
      className="toono-desktop-nav"
      style={{
        background: "rgba(8,9,14,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${T.border}`,
        padding: "0 32px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: 64,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            onClick={() => onNav("home")}
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          >
            {ToonoLogo && <ToonoLogo size={28} color={T.accent} />}
            <span
              style={{
                fontFamily: "'Playfair Display',Georgia,serif",
                fontSize: 22,
                fontWeight: 700,
                color: T.textH,
                letterSpacing: ".05em",
              }}
            >
              The TOONO
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              ["home", "Нүүр"],
              ["explore", "Хайлт"],
              ["feed", "Фийд"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => onNav(id)}
                style={{
                  background: activeTab === id ? T.accentSub : "transparent",
                  border: `1px solid ${activeTab === id ? T.accent + "40" : "transparent"}`,
                  borderRadius: 10,
                  padding: "8px 16px",
                  fontFamily: "'DM Sans',system-ui",
                  fontSize: 14,
                  fontWeight: activeTab === id ? 600 : 400,
                  color: activeTab === id ? T.accent : T.textSub,
                  cursor: "pointer",
                  transition: "all .2s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, maxWidth: 400, margin: "0 24px" }}>
          <div
            onClick={() => onNav("explore")}
            style={{
              background: T.s1,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
          >
            <IcSearch />
            <span style={{ fontFamily: "'DM Sans',system-ui", fontSize: 14, color: T.textSub }}>
              Хайлт...
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {currentRole === "creator" && (
            <button
              onClick={() => onNav("upload")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: T.accent,
                border: "none",
                borderRadius: 10,
                padding: "8px 18px",
                fontFamily: "'DM Sans',system-ui",
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                cursor: "pointer",
              }}
            >
              <IcPlus /> Байршуулах
            </button>
          )}
          <button
            onClick={() => onNav("cart")}
            style={{
              position: "relative",
              width: 40,
              height: 40,
              borderRadius: 10,
              background: T.s1,
              border: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: T.textSub,
            }}
          >
            <IcCart />
            {cartCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  background: T.red,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{cartCount}</span>
              </div>
            )}
          </button>
          <button
            onClick={() => onNav("notifications")}
            style={{
              position: "relative",
              width: 40,
              height: 40,
              borderRadius: 10,
              background: T.s1,
              border: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: T.textSub,
            }}
          >
            <IcBell />
            {unreadNotif > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: T.red,
                }}
              />
            )}
          </button>
          <button
            onClick={() => onNav("chat")}
            style={{
              position: "relative",
              width: 40,
              height: 40,
              borderRadius: 10,
              background: T.s1,
              border: `1px solid ${T.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: T.textSub,
            }}
          >
            <IcMsg />
            {unreadChat > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 8,
                  background: T.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>{unreadChat}</span>
              </div>
            )}
          </button>
          <button
            onClick={() => onNav("me")}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: T.accentSub,
              border: `2px solid ${T.accent}40`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              overflow: "hidden",
            }}
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ color: T.accent, fontSize: 12, fontWeight: 700 }}>
                {(userName || "?")[0]}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
