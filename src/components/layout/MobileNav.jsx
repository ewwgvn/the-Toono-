"use client";
import { T } from "@/theme/colors";
import { IcHome, IcSearch, IcPlus, IcMsg, IcProfile } from "@/components/icons";

// ── MOBILE BOTTOM NAV ──
const defaultNavItems = [
  { id: "home", label: "Нүүр", Ic: IcHome },
  { id: "explore", label: "Хайлт", Ic: IcSearch },
  { id: "upload", label: "", Ic: null },
  { id: "chat", label: "Зурвас", Ic: IcMsg },
  { id: "me", label: "Миний", Ic: IcProfile },
];

export default function MobileNav({ activeTab, onNav, unreadChat = 0, unreadNotif = 0, currentRole }) {
  const navItems = defaultNavItems.map((item) => {
    if (item.id === "chat") return { ...item, badge: unreadChat };
    if (item.id === "me") return { ...item, badge: unreadNotif };
    return item;
  });

  return (
    <div
      className="toono-mobile-nav"
      style={{
        background: T.nav,
        borderTop: `1px solid ${T.border}`,
        paddingTop: 6,
        paddingLeft: 4,
        paddingRight: 4,
        paddingBottom: "calc(6px + env(safe-area-inset-bottom, 0px))",
        justifyContent: "space-around",
        alignItems: "center",
        flexShrink: 0,
        position: "relative",
        zIndex: 50,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {navItems.map((item) => {
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: "4px 8px",
              minWidth: 48,
              minHeight: 44,
              justifyContent: "center",
              position: "relative",
            }}
          >
            {item.id === "upload" ? (
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  background: T.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: -20,
                  boxShadow: `0 6px 24px ${T.accentGlow},0 2px 8px rgba(91,143,232,0.5)`,
                }}
              >
                <IcPlus />
              </div>
            ) : (
              <>
                <div
                  style={{
                    position: "relative",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ color: active ? T.accent : T.textSub }}>
                    <item.Ic />
                  </span>
                  {item.badge > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: -4,
                        right: -6,
                        minWidth: 14,
                        height: 14,
                        borderRadius: 7,
                        background: T.red,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 3px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "system-ui",
                          fontSize: 8,
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        {item.badge}
                      </span>
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: "system-ui",
                    fontSize: 10,
                    fontWeight: active ? 700 : 400,
                    color: active ? T.accent : T.textSub,
                    lineHeight: 1,
                  }}
                >
                  {item.label}
                </span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
