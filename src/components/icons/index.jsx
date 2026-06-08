"use client";

// ── TOONO ICON SET v3 ──────────────────────────────────────────────────────────
// Design: geometric · Mongolian motifs · consistent 1.6 stroke · 24×24 grid
// Nav icons use filled active state via `filled` prop

// ─ Navigation ─────────────────────────────────────────────────────────────────

// IcHome: Ger (гэр) dome — clean arch with door
export const IcHome = ({ filled }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z"
    stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"
    fill={filled ? "currentColor" : "none"} fillOpacity={filled ? 0.12 : 0}/>
  {!filled && <path d="M9 21V15H15V21" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>}
</svg>;

// IcSearch: Magnifying glass with inner dot — нүдний шил
export const IcSearch = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.7"/>
  <path d="M17 17L21 21" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
  <circle cx="11" cy="11" r="2.5" fill="currentColor" opacity="0.2"/>
</svg>;

// IcPlus: Upload/create — Tenger cross
export const IcPlus = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <circle cx="11" cy="11" r="9.5" stroke="currentColor" strokeWidth="1.6"/>
  <path d="M11 6V16M6 11H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
</svg>;

// IcMsg: Chat bubble — зурвас
export const IcMsg = ({ filled }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M4 4H20V16H13L9 20V16H4V4Z"
    stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"
    fill={filled ? "currentColor" : "none"} fillOpacity={filled ? 0.12 : 0}/>
  <path d="M8 9.5H16M8 12.5H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
</svg>;

// IcProfile: Person — хүн
export const IcProfile = ({ filled }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="8" r="4"
    stroke="currentColor" strokeWidth="1.7"
    fill={filled ? "currentColor" : "none"} fillOpacity={filled ? 0.12 : 0}/>
  <path d="M4 21C4 17.1 7.6 14 12 14C16.4 14 20 17.1 20 21"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
</svg>;

// IcFeed: Content feed — фийд
export const IcFeed = ({ filled }) => <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <rect x="3" y="3" width="18" height="11" rx="2.5"
    stroke="currentColor" strokeWidth="1.7"
    fill={filled ? "currentColor" : "none"} fillOpacity={filled ? 0.12 : 0}/>
  <path d="M3 18H14M3 21H10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
</svg>;

// ─ UI Controls ────────────────────────────────────────────────────────────────

export const IcBack = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

export const IcChevron = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M6.5 4.5L12 9L6.5 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

export const IcCheck = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M3 9.5L7 13.5L15 5.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

export const IcX = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
</svg>;

export const IcFilter = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M3 5H17M6 10H14M9 15H11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
</svg>;

export const IcDots = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
  <circle cx="4.5" cy="10" r="1.8"/>
  <circle cx="10" cy="10" r="1.8"/>
  <circle cx="15.5" cy="10" r="1.8"/>
</svg>;

export const IcEdit = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M11 3.5L14.5 7L6.5 15H3.5V12L11 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M9.5 5.5L12.5 8.5" stroke="currentColor" strokeWidth="1.4"/>
</svg>;

export const IcSend = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M2.5 9L15.5 3L10 15.5L8.5 10L2.5 9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M8.5 10L15.5 3" stroke="currentColor" strokeWidth="1.4"/>
</svg>;

// ─ Reaction / Interaction ─────────────────────────────────────────────────────

// IcHeart: шагай — both states use the shagai shape
// unfilled = currentColor outline, filled = red fill + animation
const SHAGAI_D1 = "M65.09,24.15c.43,1.12-.87,1.71-1.71,1.8-7.09.75-13.96-.07-19.52-4.67-6.34-5.25-10.51-2.2-11.37-4.33s6.45-3.13,12.4,1.12c2.22,1.59,4.3,3.15,6.92,4.02,3.6,1.2,7.24,1.52,11.08,1.38.6-.02,2,.15,2.2.67Z";
const SHAGAI_D2 = "M53.86,67.23c4.63-.49,8.43-2.96,14.36-3.31,2.38-.14,4.73-.52,6.73-1.85,4.58-3.04,4.08-10.41,1.99-14.71l-3.08-6.41c-.34-.7-1.08-2.87-.44-3.19s1-1.7,3.34,1.78c1.37,2.02,2.46,4.5,3.43,6.78,1.41,3.31,2.08,6.81,1.55,10.41-.91,6.12-5.27,9.69-11.4,10.2-3.17.26-6.03.61-9.05,1.71-7.02,2.55-14.63,2.53-21.65-.06s-13.44-8.54-14.03-16.37c-.16-2.12.01-4.21.33-6.28.97-6.3-3.15-9.66-8.84-11.55-2.67-.89-5.06-2.04-7.52-3.43-4.82,3.16-6.76,10.11-5.73,15.45,1.38,7.2,14.5,4.1,23.25,7.33.77.28,1.16,1.29.97,1.83-.29.83-1.04,1.1-1.91.87-3.64-.95-10.91-1.16-14.66-1.59-2.08-.24-4.06-.54-5.95-1.35-2.85-1.23-4.76-3.57-5.29-6.71-.93-5.51.61-11.21,4.04-15.6.8-1.02,1.75-1.72,2.98-2.41C.7,23.49.2,14.03,5.98,7.95,12.29,1.33,21.69-.37,30.71.06c3.12.15,5.97.66,8.93,1.57,2.46.76,4.99,1.39,7.58,1.26,3.4-.16,6.61-3.58,8.74-1.49l2.33,2.29c1.15,1.13,2.39,2.34,3.98,2.82,1.85.55,3.76.62,5.7.59,6.47-.1,11.13,2.32,13.2,8.54,1.08,3.24,1.18,6.58.39,10.02-2.7,11.76-16.62,22.32-28.09,18.66-.52-.16-1.07-.81-.99-1.19.08-.41.8-1.1,1.25-1.06,4.15.33,8.25.1,12.07-1.84,8.64-4.38,15.16-15.1,11.57-24.66-1.89-5.05-6.25-5.38-11.35-5.34-4.35.04-8.17-1.74-10.85-5.18-.53-.68-1.24-1.11-2.13-.66-3.81,1.93-7.86,2.21-12,.89-10-3.19-22.73-3.14-31,3.57-4.77,3.87-5.89,10.19-2.46,15.36,2.32,3.5,5.87,5.76,9.88,7.11,3.16,1.07,6.12,2.33,8.64,4.51,3.34,2.9,4.26,7.23,3.41,11.49-.81,4.01-.15,7.9,2.11,11.27,4.73,7.03,13.95,9.51,22.21,8.64Z";

export const IcHeart = ({ filled }) => (
  <svg width="22" height="20" viewBox="0 0 82.08 70.55"
    className={filled ? "shagai-liked" : ""}>
    <path d={SHAGAI_D1} fill={filled ? "#E24B4A" : "currentColor"}/>
    <path d={SHAGAI_D2} fill={filled ? "#E24B4A" : "currentColor"}/>
  </svg>
);

export const IcBookmark = ({ filled }) => <svg width="20" height="22" viewBox="0 0 20 22" fill={filled ? "currentColor" : "none"}>
  <path d="M4 2H16V20.5L10 16L4 20.5V2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
</svg>;

export const IcShare = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="15" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="15" cy="15.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="5" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M7.2 9L12.8 5.8M7.2 11L12.8 14.2" stroke="currentColor" strokeWidth="1.4"/>
</svg>;

// ─ Notification / Status ──────────────────────────────────────────────────────

export const IcBell = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M11 3C8 3 5.5 5.5 5.5 8.5V14L4 16.5H18L16.5 14V8.5C16.5 5.5 14 3 11 3Z"
    stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  <path d="M8.5 16.5C8.5 18 9.7 19 11 19C12.3 19 13.5 18 13.5 16.5"
    stroke="currentColor" strokeWidth="1.5"/>
  <path d="M9 3C9.5 2.3 10.2 2 11 2C11.8 2 12.5 2.3 13 3"
    stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
</svg>;

export const IcNotif = IcBell;

// ─ Commerce ───────────────────────────────────────────────────────────────────

export const IcCart = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M2 3H5L8 15H17L19.5 7H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  <circle cx="9.5" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.4"/>
  <circle cx="16" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.4"/>
</svg>;

export const IcMoney = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.6"/>
  <path d="M11 6V8M11 14V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M8 12C8 13.1 9.3 14 11 14C12.7 14 14 13.1 14 12C14 10.9 12.7 10 11 10C9.3 10 8 9.1 8 8C8 6.9 9.3 6 11 6C12.7 6 14 6.9 14 8"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
</svg>;

export const IcShield = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M10 2L18 5.5V10.5C18 14.8 14.4 18.3 10 19C5.6 18.3 2 14.8 2 10.5V5.5L10 2Z"
    stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M7 10.5L9.5 13L13.5 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

export const IcOrder = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M11 3L20 7.5V14.5L11 19L2 14.5V7.5L11 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  <path d="M2 7.5L11 12L20 7.5" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M11 12V19" stroke="currentColor" strokeWidth="1.5"/>
</svg>;

// ─ Profile / Social ───────────────────────────────────────────────────────────

export const IcSaved = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M5 2.5H17V20L11 16L5 20V2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  <path d="M8.5 8H13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
</svg>;

export const IcFollows = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <circle cx="8" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
  <path d="M1.5 20C1.5 16.7 4.5 14 8 14C11.5 14 14.5 16.7 14.5 20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  <path d="M17 9V15M14 12H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
</svg>;

export const IcCommission = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <rect x="3" y="3" width="13" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/>
  <path d="M7 8H12.5M7 11.5H12.5M7 15H10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  <circle cx="17.5" cy="5.5" r="3.5" stroke="currentColor" strokeWidth="1.4" fill="white"/>
  <path d="M17.5 4V7M16 5.5H19" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
</svg>;

export const IcPortfolio = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <rect x="4" y="5.5" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/>
  <rect x="2" y="3.5" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/>
  <path d="M4 9H12M4 12H10M4 15H12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

export const IcDashboard = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M3 12L11 3L19 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M3 12L7 10L11 15L15 8L19 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M2 19H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
</svg>;

export const IcDispute = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M11 2.5V19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M5.5 20H16.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M5.5 5H11L2.5 12C4 13.8 8 14 10 12" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  <path d="M16.5 5H11L19.5 12C18 13.8 14 14 12 12" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
</svg>;

export const IcReport = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M5 3V19.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
  <path d="M5 4C8 2.5 10.5 3 13 4.5C15.5 6 17 5.5 19 4.5V13C17 14 15.5 14.5 13 13C10.5 11.5 8 11 5 12.5V4Z"
    stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
</svg>;

export const IcGift = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <rect x="2.5" y="8" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M2.5 12H19.5" stroke="currentColor" strokeWidth="1.3"/>
  <path d="M11 8V20" stroke="currentColor" strokeWidth="1.3"/>
  <path d="M11 8C11 8 8.5 8 7 6.5C5.5 5 6.5 3 8.5 3C10 3 11 5.5 11 8Z" stroke="currentColor" strokeWidth="1.3"/>
  <path d="M11 8C11 8 13.5 8 15 6.5C16.5 5 15.5 3 13.5 3C12 3 11 5.5 11 8Z" stroke="currentColor" strokeWidth="1.3"/>
</svg>;

// ─ Camera / Media ─────────────────────────────────────────────────────────────

export const IcCamera = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <rect x="2" y="6.5" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
  <path d="M7.5 6.5L8.8 4H13.2L14.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <circle cx="11" cy="12.5" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="11" cy="12.5" r="1.3" fill="currentColor" opacity="0.35"/>
</svg>;

export const IcVideo = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <rect x="2" y="5.5" width="14" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
  <path d="M16 9L21 7V15L16 13V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
</svg>;

// ─ System ─────────────────────────────────────────────────────────────────────

export const IcUpload = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M11 14.5V4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  <path d="M7 8L11 4L15 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M4 17.5H18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
</svg>;

export const IcLock = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <rect x="3.5" y="9" width="13" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M7 9V6.5C7 4.6 8.3 3 10 3C11.7 3 13 4.6 13 6.5V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  <circle cx="10" cy="13.5" r="1.5" fill="currentColor"/>
  <path d="M10 15V16.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
</svg>;

export const IcEye = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M2 10C3.5 6.5 6.5 4.5 10 4.5C13.5 4.5 16.5 6.5 18 10C16.5 13.5 13.5 15.5 10 15.5C6.5 15.5 3.5 13.5 2 10Z"
    stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="10" cy="10" r="1.2" fill="currentColor"/>
</svg>;

export const IcEyeOff = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M3 3L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  <path d="M6.5 5.2C7.6 4.8 8.8 4.5 10 4.5C13.5 4.5 16.5 6.5 18 10C17.4 11.5 16.5 12.7 15.3 13.7"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M5 6.8C3.5 7.9 2.5 8.9 2 10C3.5 13.5 6.5 15.5 10 15.5C11.5 15.5 12.8 15.1 13.9 14.5"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
</svg>;

export const IcWarning = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M10 2.5L18.5 17H1.5L10 2.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  <path d="M10 8.5V12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  <circle cx="10" cy="14.5" r="1.1" fill="currentColor"/>
</svg>;

export const IcInfo = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M10 9.5V14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
  <circle cx="10" cy="7" r="1.1" fill="currentColor"/>
</svg>;

export const IcLink = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M7.5 10.5C8.3 11.5 9.5 12.1 11 12.1C13 12.1 14.5 10.6 14.5 8.6V8.1C14.5 6.1 13 4.6 11 4.6H10"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M10.5 7.5C9.7 6.5 8.5 5.9 7 5.9C5 5.9 3.5 7.4 3.5 9.4V9.9C3.5 11.9 5 13.4 7 13.4H8"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
</svg>;

export const IcTrash = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M3 5H15M6 5V3H12V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M4.5 5.5L5.5 15H12.5L13.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M7.5 8.5V12M10.5 8.5V12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
</svg>;

export const IcCopy = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <rect x="6.5" y="6.5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M5.5 11.5H4C3.2 11.5 2.5 10.8 2.5 10V4C2.5 3.2 3.2 2.5 4 2.5H10C10.8 2.5 11.5 3.2 11.5 4V5.5"
    stroke="currentColor" strokeWidth="1.4"/>
</svg>;

export const IcStats = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M3 15V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  <path d="M7 15V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  <path d="M11 15V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  <path d="M15 15V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  <path d="M1.5 15H16.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
</svg>;

// ─ Special ────────────────────────────────────────────────────────────────────

export const IcStar = ({ n = 0 }) => <div style={{ display: "flex", gap: 2 }}>
  {[1, 2, 3, 4, 5].map(i => <svg key={i} width="13" height="13" viewBox="0 0 16 16"
    fill={i <= n ? "#E8960C" : "none"} stroke={i <= n ? "#E8960C" : "#CCC"} strokeWidth="1.3">
    <path d="M8 1.5L9.6 5.8H14.2L10.5 8.5L11.9 12.8L8 10.1L4.1 12.8L5.5 8.5L1.8 5.8H6.4L8 1.5Z"/>
  </svg>)}
</div>;

export const IcB2B = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M2.5 19.5V9L11 3.5L19.5 9V19.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  <path d="M7.5 19.5V14H14.5V19.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <rect x="7.5" y="9" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
  <rect x="11.5" y="9" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
  <path d="M2.5 19.5H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
</svg>;

export const IcCoupon = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M2 7V4.5C2 3.7 2.7 3 3.5 3H16.5C17.3 3 18 3.7 18 4.5V7C16.9 7 16 7.9 16 9C16 10.1 16.9 11 18 11V13.5C18 14.3 17.3 15 16.5 15H3.5C2.7 15 2 14.3 2 13.5V11C3.1 11 4 10.1 4 9C4 7.9 3.1 7 2 7Z"
    stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  <path d="M8 9H12M7.5 6.5H12.5M7.5 11.5H11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

export const IcPin = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M9 2C6.8 2 5 3.8 5 6C5 8.8 9 14.5 9 14.5C9 14.5 13 8.8 13 6C13 3.8 11.2 2 9 2Z"
    stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="9" cy="6" r="2" stroke="currentColor" strokeWidth="1.3"/>
</svg>;

export const IcCal = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <rect x="2.5" y="4" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M2.5 8H15.5" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M6 2.5V5M12 2.5V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <circle cx="6.5" cy="11.5" r="1" fill="currentColor"/>
  <circle cx="9" cy="11.5" r="1" fill="currentColor"/>
  <circle cx="11.5" cy="11.5" r="1" fill="currentColor"/>
</svg>;

export const IcFlash = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M10.5 2L3.5 10H9.5L7.5 16L14.5 8H8.5L10.5 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
</svg>;

export const IcFire = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M9 16C5.7 16 3 13.3 3 10C3 7 5 5 5 5C5 5 4.5 7 6.5 8.5C6.5 8.5 6 5 9 2C9 2 8 5.5 11 7C11 7 13 5.5 12.5 3.5C12.5 3.5 15 6 15 10C15 13.3 12.3 16 9 16Z"
    stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
</svg>;

export const IcSale = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M6 12L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
  <circle cx="11.5" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
</svg>;

export const IcGlobe = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M10 2C8 4.5 7 7 7 10C7 13 8 15.5 10 18M10 2C12 4.5 13 7 13 10C13 13 12 15.5 10 18"
    stroke="currentColor" strokeWidth="1.2"/>
  <path d="M2 10H18M3 6.5H17M3 13.5H17" stroke="currentColor" strokeWidth="1.1"/>
</svg>;

export const IcKey = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="7.5" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M11 10.5L18 17.5M14.5 14L16.5 16M16 15.5L18 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <circle cx="7.5" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
</svg>;

// ─ Field selection (small 20×20) ──────────────────────────────────────────────

export const IcFieldFashion = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M7 2L5 4.5L4 11L5 18H9L10 12L11 18H15L16 11L15 4.5L13 2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  <path d="M7 2C7 2 8.2 4.5 10 4.5C11.8 4.5 13 2 13 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

export const IcFieldTextile = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M3 5C3 5 7.5 9 10 9C12.5 9 17 5 17 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  <path d="M3 11C3 11 7.5 7 10 7C12.5 7 17 11 17 11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  <path d="M3 15C3 15 7.5 11 10 11C12.5 11 17 15 17 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
</svg>;

export const IcFieldArt = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.3"/>
  <circle cx="7" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
  <circle cx="13" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.1"/>
  <path d="M7 13C8 14.5 12 14.5 13 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

export const IcFieldDirection = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <rect x="2" y="3.5" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="1.3"/>
  <path d="M2 8H18" stroke="currentColor" strokeWidth="1.1" opacity="0.4"/>
  <path d="M5.5 13H14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  <circle cx="10" cy="13" r="2" stroke="currentColor" strokeWidth="1"/>
</svg>;

export const IcFieldGraphic = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M14.5 3L17.5 6L7 16.5L3 17.5L4 13.5L14.5 3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  <path d="M12.5 5L15.5 8" stroke="currentColor" strokeWidth="1.1"/>
</svg>;

export const IcFieldPhoto = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <rect x="2" y="5.5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.3"/>
  <circle cx="10" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.3"/>
  <circle cx="10" cy="11" r="1.3" fill="currentColor" opacity="0.3"/>
  <path d="M7 5.5L8 3.5H12L13 5.5" stroke="currentColor" strokeWidth="1.2"/>
</svg>;

export const IcField3D = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M10 2L18 6.5V13.5L10 18L2 13.5V6.5L10 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  <path d="M10 8L18 6.5M10 8L2 6.5M10 8V18" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
</svg>;

export const IcFieldSpace = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M3 13.5L10 18L17 13.5V7.5L10 3L3 7.5V13.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  <path d="M3 7.5L10 11.5L17 7.5M10 11.5V18" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
</svg>;

export const IcFieldJewelry = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M6 4H14L17.5 8.5L10 17L2.5 8.5L6 4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  <path d="M2.5 8.5H17.5M6 4L10 8.5L14 4" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
</svg>;

export const IcFieldCeramic = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M6.5 4H13.5C13.5 4 15.5 8 15.5 12C15.5 16 13.5 17 10 17C6.5 17 4.5 16 4.5 12C4.5 8 6.5 4 6.5 4Z"
    stroke="currentColor" strokeWidth="1.3"/>
  <path d="M5.5 9H14.5M4.5 13H15.5" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
</svg>;

export const IcFieldWood = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M10 2V15M10 15L5 18.5H15L10 15Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  <path d="M7 6.5L10 5L13 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  <path d="M6 10.5L10 9L14 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

export const IcFieldLeather = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <rect x="3" y="4" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="1.3"/>
  <path d="M3 8.5H17" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
  <circle cx="10" cy="12.5" r="2.2" stroke="currentColor" strokeWidth="1.2"/>
</svg>;

export const IcFieldHome = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M3 10L10 4L17 10V17H3V10Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  <path d="M8 17V12H12V17" stroke="currentColor" strokeWidth="1.2"/>
</svg>;

// ─ Onboarding (large) ─────────────────────────────────────────────────────────

export const IcOnboard2 = () => <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
  <ellipse cx="40" cy="40" rx="30" ry="18" stroke="currentColor" strokeWidth="2"/>
  <circle cx="40" cy="40" r="12" stroke="currentColor" strokeWidth="2"/>
  <circle cx="40" cy="40" r="5" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="40" cy="40" r="2" fill="currentColor"/>
  <path d="M40 22V18M40 62V58M10 40H14M66 40H70" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
</svg>;

export const IcOnboard3 = () => <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
  <path d="M24 24C24 24 24 16 32 16C40 16 40 24 40 24C40 24 40 16 48 16C56 16 56 24 56 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <path d="M24 24C24 24 16 24 16 32C16 40 24 40 24 40C24 40 16 40 16 48C16 56 24 56 24 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <path d="M56 24C56 24 64 24 64 32C64 40 56 40 56 40C56 40 64 40 64 48C64 56 56 56 56 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <path d="M24 56C24 56 24 64 32 64C40 64 40 56 40 56C40 56 40 64 48 64C56 64 56 56 56 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <circle cx="40" cy="40" r="7" stroke="currentColor" strokeWidth="2"/>
  <circle cx="40" cy="40" r="2.5" fill="currentColor"/>
</svg>;

// ─ Empty state (large) ────────────────────────────────────────────────────────

export const IcSearchEmpty = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <circle cx="22" cy="22" r="15" stroke="currentColor" strokeWidth="2"/>
  <path d="M33 33L47 47" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  <path d="M16 22H28M22 16V28" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/>
  <path d="M11 22C11 16 16 11 22 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
</svg>;

export const IcBookmarkEmpty = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <path d="M13 7H39V47L26 37L13 47V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  <path d="M20 22H32M20 30H28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
</svg>;

export const IcCartEmpty = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <path d="M5 9H13L19 41H41L47 19H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <circle cx="23" cy="47" r="4" stroke="currentColor" strokeWidth="2"/>
  <circle cx="37" cy="47" r="4" stroke="currentColor" strokeWidth="2"/>
  <path d="M27 28H38M27 35H34" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
</svg>;

export const IcEmptyWorks = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <rect x="8" y="16" width="36" height="30" rx="4" stroke="currentColor" strokeWidth="2"/>
  <rect x="14" y="8" width="36" height="30" rx="4" stroke="currentColor" strokeWidth="2"/>
  <path d="M26 28L36 21M30 21H36V27" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

export const IcUsersEmpty = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <circle cx="20" cy="18" r="8" stroke="currentColor" strokeWidth="2"/>
  <path d="M4 46C4 38 11.2 32 20 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <circle cx="36" cy="21" r="6" stroke="currentColor" strokeWidth="2"/>
  <path d="M28 46C28 40 31.6 36 36 36C40.4 36 44 40 44 46" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
</svg>;

export const IcFolderEmpty = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <path d="M5 15H22L27 10H47V39C47 40.7 45.7 42 44 42H8C6.3 42 5 40.7 5 39V15Z"
    stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  <path d="M18 28L26 21L34 28M26 21V36" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

export const IcFeedEmpty = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <rect x="6" y="6" width="40" height="28" rx="4" stroke="currentColor" strokeWidth="2"/>
  <path d="M6 42H30M6 48H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  <path d="M13 14H22M13 20H26M13 26H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <rect x="28" y="10" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
</svg>;

export const IcMtEmpty = () => <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
  <path d="M10 52L24 28L32 38L44 18L54 52H10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  <path d="M10 44H54" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
  <circle cx="44" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
</svg>;

export const IcEmptySearch = IcSearchEmpty;
export const IcEmptyBookmark = IcBookmarkEmpty;
export const IcEmptyCart = IcCartEmpty;
export const IcEmptyChatIcon = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <path d="M6 8H46V38H30L24 48V38H6V8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  <path d="M16 22C20 18 28 18 32 21C35 23.5 34 27 31 29C28 31 22 31 20 34" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
</svg>;

// Aliases for backward compat
export const IcEmptyChat = IcEmptyChatIcon;
export const IcEmptyFeed = IcFeedEmpty;
