"use client";

// ── ICONS ──
// TOONO — Mongolian-inspired custom icon set
// Design language: geometric, steppe patterns, tengri motifs, monoline

// ─ Nav ─────────────────────────────────────────────────────────────
// IcHome: Ger (yurt) dome with door — тэнгэрийн орон
export const IcHome = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M12 3C8.5 3 5.5 5.5 4 8H20C18.5 5.5 15.5 3 12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <rect x="3.5" y="8" width="17" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M9.5 18V13.5C9.5 12.4 10.4 11.5 11.5 11.5H12.5C13.6 11.5 14.5 12.4 14.5 13.5V18" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M3.5 12H20.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="1.5 1.5"/>
</svg>;

// IcSearch: Mongolian lens with inner cross (тэнгэр нүд)
export const IcSearch = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6"/>
  <path d="M16.5 16.5L20.5 20.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  <path d="M11 8V14M8 11H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  <circle cx="11" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.1"/>
</svg>;

// IcPlus: Upload with Tengri wheel rays
export const IcPlus = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <circle cx="11" cy="11" r="9.5" stroke="white" strokeWidth="1.5"/>
  <path d="M11 5.5V16.5M5.5 11H16.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  <circle cx="11" cy="11" r="2" fill="white" fillOpacity="0.3"/>
</svg>;

// IcMsg: Chat bubble with Mongolian script wave
export const IcMsg = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M3.5 4H20.5V15.5H13L9.5 19.5V15.5H3.5V4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
  <path d="M7.5 9.5C8.5 8.5 9.5 10.5 10.5 9.5C11.5 8.5 12.5 10.5 13.5 9.5C14.5 8.5 15.5 10.5 16.5 9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
</svg>;

// IcProfile: Person with traditional deel collar
export const IcProfile = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6"/>
  <path d="M4 21C4 17.5 7.6 14.5 12 14.5C16.4 14.5 20 17.5 20 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  <path d="M12 12.5L10 14.5L12 16L14 14.5L12 12.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
</svg>;

// ─ UI Controls ──────────────────────────────────────────────────────
export const IcBack = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M15 5L8 12L15 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

export const IcHeart = ({filled}) => <svg width="20" height="20" viewBox="0 0 20 20" fill={filled?"#E04848":"none"}>
  <path d="M10 17C10 17 2.5 12 2.5 7C2.5 4.5 4.5 2.5 7 2.5C8.5 2.5 9.5 3.2 10 4C10.5 3.2 11.5 2.5 13 2.5C15.5 2.5 17.5 4.5 17.5 7C17.5 12 10 17 10 17Z" stroke={filled?"#E04848":"currentColor"} strokeWidth="1.5" strokeLinejoin="round"/>
</svg>;

export const IcBookmark = ({filled}) => <svg width="20" height="20" viewBox="0 0 20 20" fill={filled?"currentColor":"none"}>
  <path d="M5 2.5H15V18.5L10 14.5L5 18.5V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M7.5 7H12.5" stroke={filled?"#08090E":"currentColor"} strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

export const IcShare = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="15" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4"/>
  <circle cx="15" cy="15.5" r="2" stroke="currentColor" strokeWidth="1.4"/>
  <circle cx="5"  cy="10"  r="2" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M6.8 9L13.2 5.5M6.8 11L13.2 14.5" stroke="currentColor" strokeWidth="1.3"/>
</svg>;

export const IcCheck = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M3 9.5L7 13.5L15 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

export const IcX = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M4.5 4.5L13.5 13.5M13.5 4.5L4.5 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
</svg>;

export const IcFilter = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M3 5.5H17M6 10H14M9 14.5H11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
</svg>;

// IcBell / IcNotif: Bell with Mongolian crown top (süld ornament)
export const IcBell = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M10 2.5C7.2 2.5 5 4.7 5 7.5V12.5L3.5 14.5H16.5L15 12.5V7.5C15 4.7 12.8 2.5 10 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  <path d="M8 14.5C8 15.6 8.9 16.5 10 16.5C11.1 16.5 12 15.6 12 14.5" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M8.5 2.5C9 2 9.5 1.5 10 1.5C10.5 1.5 11 2 11.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

export const IcNotif = IcBell;

export const IcChevron = () => <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
  <path d="M6.5 4.5L12 9L6.5 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

// IcCamera: Camera with Tengri eye lens
export const IcCamera = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <rect x="2" y="6.5" width="18" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M7.5 6.5L8.8 3.5H13.2L14.5 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <circle cx="11" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M9.5 12.5C9.5 11.7 10.2 11 11 11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
</svg>;

export const IcSend = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M3 9H15M11 5L15 9L11 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

export const IcDots = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
  <circle cx="4.5" cy="10" r="1.6"/>
  <circle cx="10" cy="10" r="1.6"/>
  <circle cx="15.5" cy="10" r="1.6"/>
</svg>;

export const IcEdit = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M11.5 3.5L14.5 6.5L6.5 14.5H3.5V11.5L11.5 3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  <path d="M9.5 5.5L12.5 8.5" stroke="currentColor" strokeWidth="1.3"/>
</svg>;

export const IcStar = ({n=0}) => <div style={{display:"flex",gap:2}}>
  {[1,2,3,4,5].map(i=><svg key={i} width="13" height="13" viewBox="0 0 16 16" fill={i<=n?"#E8960C":"none"} stroke="#E8960C" strokeWidth="1.2">
    <path d="M8 1.5L9.6 5.8H14.2L10.5 8.5L11.9 12.8L8 10.1L4.1 12.8L5.5 8.5L1.8 5.8H6.4L8 1.5Z"/>
  </svg>)}
</div>;

// ─ Feature Icons ────────────────────────────────────────────────────
// IcCommission: Scroll with Mongolian seal (tamga)
export const IcCommission = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <rect x="3" y="4" width="13" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M6.5 8.5H12.5M6.5 11.5H12.5M6.5 14.5H10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  <circle cx="17" cy="6" r="3.5" fill={`var(--c,#08090E)`} stroke="currentColor" strokeWidth="1.4"/>
  <path d="M17 4.5V7.5M15.5 6H18.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

// IcPortfolio: Stacked frames — архивын дэвтэр
export const IcPortfolio = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <rect x="5" y="6.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  <rect x="3" y="4.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  <rect x="1" y="2.5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M3 8H11M3 10.5H9M3 13H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

// IcDashboard: Mongolian lattice grid (хана pattern)
export const IcDashboard = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M11 2.5L19.5 11L11 19.5L2.5 11L11 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M11 6L16 11L11 16L6 11L11 6Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  <circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="1.2"/>
  <path d="M11 2.5V6M19.5 11H16M11 19.5V16M2.5 11H6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

// IcCart: Mongolian saddlebag (хүрэм)
export const IcCart = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M2.5 3.5H5L7 14H17L19.5 7H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  <circle cx="9" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
  <circle cx="15" cy="17.5" r="1.8" stroke="currentColor" strokeWidth="1.3"/>
  <path d="M10 10.5H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

// IcEvents: Mongolian calendar with moon symbol
export const IcEvents = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <rect x="3" y="5" width="16" height="14.5" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M3 9.5H19" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M7.5 3V6.5M14.5 3V6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  <path d="M10 14C10 12.3 11.1 11 12.5 11C11.7 12 11.7 14 12.5 15C11.1 15 10 15.7 10 14Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
  <circle cx="7.5" cy="14" r="1.3" stroke="currentColor" strokeWidth="1.2"/>
</svg>;

// IcB2B: Corporate building with Mongolian battlements
export const IcB2B = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M2.5 19.5V8.5L11 3L19.5 8.5V19.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M7.5 19.5V14H14.5V19.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  <rect x="7.5" y="9.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
  <rect x="11.5" y="9.5" width="3" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
  <path d="M2.5 19.5H19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
</svg>;

// IcSaved: Mongolian bookmark with knot
export const IcSaved = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M5 3H17V20.5L11 16.5L5 20.5V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M8 7H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  <path d="M9.5 10C10.5 9 11.5 11 12.5 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

// IcFollows: Two connected figures — нийгмийн холбоо
export const IcFollows = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <circle cx="7.5" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M1.5 20C1.5 17 4.2 14.5 7.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <circle cx="16" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M10.5 20C10.5 17.5 13 15.5 16 15.5C19 15.5 21.5 17.5 21.5 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M11.5 9.5L13.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
</svg>;

// IcOrder: Delivery package with Mongolian arrow
export const IcOrder = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M11 3.5L20 8V14L11 18.5L2 14V8L11 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M2 8L11 12.5L20 8" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M11 12.5V18.5" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M6.5 5.8L15.5 10.3" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
</svg>;

// IcReview: Tengri star / шилдэг дүн
export const IcReview = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M11 2L13.5 8H20L14.8 11.8L16.9 18L11 14.2L5.1 18L7.2 11.8L2 8H8.5L11 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M11 7L12.2 10H15.5L12.8 11.8L13.7 15L11 13.2L8.3 15L9.2 11.8L6.5 10H9.8L11 7Z" stroke="currentColor" strokeWidth="1" opacity="0.35"/>
</svg>;

// IcReport: Mongolian tugh (banner/flag)
export const IcReport = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M5 3V19.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  <path d="M5 3.5C8 2 10.5 2.5 13 4C15.5 5.5 17 5 19 4V12C17 13 15.5 13.5 13 12C10.5 10.5 8 10 5 11.5V3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M8 7.5C9 7 10 7 11 7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

// IcDispute: Mongolian scale / justice
export const IcDispute = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M11 3V19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M6 19.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M5 5.5H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M5 5.5L2.5 11.5C4 13 8 13 9.5 11.5L5 5.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  <path d="M17 5.5L14.5 11.5C16 13 20 13 21.5 11.5L17 5.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
</svg>;

// IcGift: Mongolian gift box with Тэнгэр knot ribbon
export const IcGift = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <rect x="2.5" y="8.5" width="17" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M2.5 12H19.5" stroke="currentColor" strokeWidth="1.3"/>
  <path d="M11 8.5V19.5" stroke="currentColor" strokeWidth="1.3"/>
  <path d="M11 8.5C11 8.5 8.5 8.5 7 7C5.5 5.5 6.5 3.5 8.5 3.5C10 3.5 11 5.5 11 8.5Z" stroke="currentColor" strokeWidth="1.3"/>
  <path d="M11 8.5C11 8.5 13.5 8.5 15 7C16.5 5.5 15.5 3.5 13.5 3.5C12 3.5 11 5.5 11 8.5Z" stroke="currentColor" strokeWidth="1.3"/>
</svg>;

// IcSettings: Tengri wheel / шороон дугуй
export const IcSettings = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <circle cx="11" cy="11" r="3" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="11" cy="11" r="7.5" stroke="currentColor" strokeWidth="1.3" strokeDasharray="2.5 2.5"/>
  <path d="M11 3V5M11 17V19M3 11H5M17 11H19M5.1 5.1L6.5 6.5M15.5 15.5L16.9 16.9M5.1 16.9L6.5 15.5M15.5 6.5L16.9 5.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
</svg>;

// IcUpload: Arrow with steppe horizon
export const IcUpload = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M11 14V4M7.5 7.5L11 4L14.5 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M4 17.5H18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  <path d="M4 17.5C6 14.5 8 13.5 11 13.5C14 13.5 16 14.5 18 17.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
</svg>;

// ─ Inline / Decorative ──────────────────────────────────────────────
// IcVideo: Movie camera — бичлэг
export const IcVideo = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <rect x="2" y="6" width="14" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M16 9L20.5 7V15L16 13V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <circle cx="9" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
  <circle cx="9" cy="11" r="1" fill="currentColor" opacity="0.4"/>
</svg>;

// IcMoney: Mongolian Tögrög coin
export const IcMoney = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="11" cy="11" r="5.5" stroke="currentColor" strokeWidth="1.1"/>
  <path d="M8.5 9.5H13.5M8.5 11H13.5M8.5 12.5H13.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  <path d="M9.5 8.5H12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
</svg>;

// IcPackage: Mongolian delivery box
export const IcPackage = () => <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
  <path d="M11 3.5L20 8V14L11 18.5L2 14V8L11 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M2 8L11 12.5L20 8" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M11 12.5V18.5" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M7 5.8L16 10.2" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
</svg>;

// IcEye / IcEyeOff: Password toggle
export const IcEye = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M2 10C3.5 6.5 6.5 4.5 10 4.5C13.5 4.5 16.5 6.5 18 10C16.5 13.5 13.5 15.5 10 15.5C6.5 15.5 3.5 13.5 2 10Z" stroke="currentColor" strokeWidth="1.4"/>
  <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
  <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.5"/>
</svg>;

export const IcEyeOff = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M3 3L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M7 5.5C8 5 9 4.5 10 4.5C13.5 4.5 16.5 6.5 18 10C17.3 11.5 16.3 12.7 15 13.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  <path d="M5.5 6.5C4 7.5 2.8 8.6 2 10C3.5 13.5 6.5 15.5 10 15.5C11.3 15.5 12.5 15.2 13.5 14.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
</svg>;

// IcWarning: Triangle with Mongolian dot pattern
export const IcWarning = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M10 2.5L18.5 17H1.5L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
  <path d="M10 8V11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  <circle cx="10" cy="14" r="1" fill="currentColor"/>
</svg>;

// IcHint: Light bulb — санаа
export const IcHint = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M10 2.5C7 2.5 4.5 5 4.5 8C4.5 10.2 5.8 12.2 7.5 13.2V15H12.5V13.2C14.2 12.2 15.5 10.2 15.5 8C15.5 5 13 2.5 10 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  <path d="M7.5 17.5H12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  <path d="M8.5 15H11.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
  <path d="M9 8.5C9.3 7.5 10.5 7 11 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

// IcMountain: Steppe/mountain — Монгол тал
export const IcMountain = () => <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
  <path d="M5 48L20 24L30 34L42 16L55 48H5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  <path d="M30 34L34 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <circle cx="42" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M5 38H55" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
</svg>;

// IcPalette: Art/Creator — Mongolian бүтээлч (Tengri eye with threads)
export const IcPalette = () => <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
  <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
  <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2"/>
  <circle cx="24" cy="24" r="3" fill="currentColor" opacity="0.4"/>
  <path d="M24 6V12M24 36V42M6 24H12M36 24H42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M11 11L15 15M33 33L37 37M11 37L15 33M33 15L37 11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
</svg>;

// IcHandshake: Partnership — Mongolian хамтын ажиллагаа (interlinked deel knots)
export const IcHandshake = () => <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
  <path d="M8 28C8 28 14 20 20 20C23 20 24 22 24 24C24 22 25 20 28 20C34 20 40 28 40 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M12 32C12 32 17 26 22 28C24 29 24 31 24 31C24 31 24 29 26 28C31 26 36 32 36 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  <circle cx="24" cy="14" r="5" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M22 12L24 14L26 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M16 38H32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
  <path d="M20 36V40M28 36V40" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3"/>
</svg>;

// Onboarding icons — large, refined, Mongolian-inspired
// Slide 1: Ger (yurt) with digital connection — Монгол гэр + дижитал зах
export const IcOnboard1 = () => <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
  <path d="M40 12L12 36V62H68V36L40 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  <path d="M40 12L20 30M40 12L60 30" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
  <circle cx="40" cy="38" r="10" stroke="currentColor" strokeWidth="2"/>
  <circle cx="40" cy="38" r="4" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="40" cy="38" r="1.5" fill="currentColor"/>
  <path d="M30 38H26M54 38H50" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M40 28V24M40 52V48" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M33 50H47V62H33V50Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
  <path d="M40 50V62" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
  <path d="M18 62H62" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
  <path d="M35 31L40 26L45 31" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
  <path d="M35 45L40 50L45 45" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
</svg>;

// Slide 2: Tengri eye (Тэнгэрийн нүд) — discover creators
export const IcOnboard2 = () => <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
  <ellipse cx="40" cy="40" rx="30" ry="18" stroke="currentColor" strokeWidth="2"/>
  <circle cx="40" cy="40" r="12" stroke="currentColor" strokeWidth="2"/>
  <circle cx="40" cy="40" r="5" stroke="currentColor" strokeWidth="1.5"/>
  <circle cx="40" cy="40" r="2" fill="currentColor"/>
  <path d="M10 40C10 40 22 26 40 26C58 26 70 40 70 40" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
  <path d="M10 40C10 40 22 54 40 54C58 54 70 40 70 40" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
  <path d="M40 22V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M40 62V58" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M52 24L54 20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
  <path d="M28 24L26 20" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
  <path d="M52 56L54 60" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
  <path d="M28 56L26 60" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
</svg>;

// Slide 3: Endless knot (Монгол зангилаа) — connection/collaboration
export const IcOnboard3 = () => <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
  <path d="M24 24C24 24 24 16 32 16C40 16 40 24 40 24C40 24 40 16 48 16C56 16 56 24 56 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <path d="M24 24C24 24 16 24 16 32C16 40 24 40 24 40C24 40 16 40 16 48C16 56 24 56 24 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <path d="M56 24C56 24 64 24 64 32C64 40 56 40 56 40C56 40 64 40 64 48C64 56 56 56 56 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <path d="M24 56C24 56 24 64 32 64C40 64 40 56 40 56C40 56 40 64 48 64C56 64 56 56 56 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <path d="M24 40H56" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
  <path d="M40 24V56" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
  <circle cx="40" cy="40" r="6" stroke="currentColor" strokeWidth="2"/>
  <circle cx="40" cy="40" r="2" fill="currentColor"/>
</svg>;

// Field selection icons (small, 20x20)
export const IcFieldFashion = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 2L5 4L4 10L5 18H9L10 12L11 18H15L16 10L15 4L13 2" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 2C7 2 8 4 10 4C12 4 13 2 13 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M5 4L8 6L10 12L12 6L15 4" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/><path d="M4 10H6M14 10H16" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/></svg>;
export const IcFieldTextile = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4C4 4 8 8 10 8C12 8 16 4 16 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M4 10C4 10 8 14 10 14C12 14 16 10 16 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M4 16C4 16 8 12 10 12C12 12 16 16 16 16" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
export const IcFieldArt = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.3"/><circle cx="7" cy="8" r="1.5" stroke="currentColor" strokeWidth="1"/><circle cx="13" cy="8" r="1.5" stroke="currentColor" strokeWidth="1"/><circle cx="10" cy="13" r="1.5" stroke="currentColor" strokeWidth="1"/><circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1"/></svg>;
export const IcFieldDirection = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M2 8H18" stroke="currentColor" strokeWidth="1" opacity="0.4"/><path d="M6 12H14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="10" cy="12" r="2" stroke="currentColor" strokeWidth="1"/></svg>;
export const IcFieldGraphic = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M14 3L17 6L7 16L3 17L4 13L14 3Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M12 5L15 8" stroke="currentColor" strokeWidth="1" opacity="0.5"/></svg>;
export const IcFieldPhoto = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="10" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="10" cy="11" r="1.5" stroke="currentColor" strokeWidth="0.8"/><path d="M7 5L8 3H12L13 5" stroke="currentColor" strokeWidth="1.2"/></svg>;
export const IcField3D = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L18 7V13L10 18L2 13V7L10 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M10 8L18 7M10 8L2 7M10 8V18" stroke="currentColor" strokeWidth="1" opacity="0.4"/></svg>;
export const IcFieldSpace = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 14L10 18L17 14V8L10 4L3 8V14Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M3 8L10 12L17 8" stroke="currentColor" strokeWidth="1" opacity="0.4"/><path d="M10 12V18" stroke="currentColor" strokeWidth="1" opacity="0.4"/></svg>;
export const IcFieldJewelry = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 4H14L17 8L10 17L3 8L6 4Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M3 8H17" stroke="currentColor" strokeWidth="1" opacity="0.4"/><path d="M10 8V17M6 4L10 8L14 4" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/></svg>;
export const IcFieldCeramic = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 4H14C14 4 16 8 16 12C16 16 14 17 10 17C6 17 4 16 4 12C4 8 6 4 6 4Z" stroke="currentColor" strokeWidth="1.3"/><path d="M6 8H14" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/><path d="M5 12H15" stroke="currentColor" strokeWidth="0.8" opacity="0.4"/></svg>;
export const IcFieldWood = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2V14M10 14L5 18H15L10 14Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 6L10 4L13 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M6 10L10 8L14 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>;
export const IcFieldLeather = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="12" rx="3" stroke="currentColor" strokeWidth="1.3"/><path d="M3 8H17" stroke="currentColor" strokeWidth="1" opacity="0.4"/><circle cx="10" cy="12" r="2" stroke="currentColor" strokeWidth="1"/><path d="M6 4V8M14 4V8" stroke="currentColor" strokeWidth="0.8" opacity="0.3"/></svg>;
export const IcFieldHome = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10L10 4L17 10V17H3V10Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M8 17V12H12V17" stroke="currentColor" strokeWidth="1.2"/></svg>;

// IcLock: Security lock
export const IcLock = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <rect x="3.5" y="9" width="13" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M7 9V6.5C7 4.6 8.3 3 10 3C11.7 3 13 4.6 13 6.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <circle cx="10" cy="13.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
  <path d="M10 15V16.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

// Empty state icons (large, decorative)
export const IcEmptySearch = () => <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
  <circle cx="28" cy="28" r="18" stroke="currentColor" strokeWidth="2"/>
  <path d="M41 41L56 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  <path d="M22 28H34M28 22V34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <path d="M14 28C14 20.3 20.3 14 28 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
</svg>;

export const IcEmptyBookmark = () => <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
  <path d="M14 8H50V58L32 46L14 58V8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  <path d="M22 22H42M22 30H36" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <circle cx="32" cy="22" r="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
</svg>;

export const IcEmptyCart = () => <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
  <path d="M6 10H14L20 42H50L56 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <circle cx="26" cy="50" r="5" stroke="currentColor" strokeWidth="2"/>
  <circle cx="44" cy="50" r="5" stroke="currentColor" strokeWidth="2"/>
  <path d="M28 30H44M28 36H40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
</svg>;

export const IcEmptyChat = () => <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
  <path d="M8 10H56V44H36L28 56V44H8V10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  <path d="M20 24C24 20 32 20 36 22C40 24 40 28 36 30C34 31 30 32 28 34C26 36 28 40 32 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <circle cx="32" cy="44" r="2" fill="currentColor" opacity="0.3"/>
</svg>;

export const IcEmptyFeed = () => <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
  <path d="M8 16L32 4L56 16V48L32 60L8 48V16Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  <path d="M8 16L32 28L56 16" stroke="currentColor" strokeWidth="1.8"/>
  <path d="M32 28V60" stroke="currentColor" strokeWidth="1.8"/>
  <circle cx="32" cy="20" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
</svg>;

export const IcEmptyWorks = () => <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
  <rect x="8" y="16" width="38" height="38" rx="4" stroke="currentColor" strokeWidth="2"/>
  <rect x="16" y="8" width="38" height="38" rx="4" stroke="currentColor" strokeWidth="2"/>
  <path d="M30 30L38 22M34 22H38V26" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M20 38C22 34 26 32 30 34C34 36 36 40 34 44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
</svg>;

// Social login brand icons (simple geometric style)
export const IcGoogle = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M18 10.2C18 9.56 17.94 8.93 17.82 8.33H10V11.9H14.56C14.35 12.98 13.74 13.89 12.82 14.5V16.76H15.52C17.12 15.3 18 12.94 18 10.2Z" stroke="currentColor" strokeWidth="1.2"/>
  <path d="M10 18.67C12.3 18.67 14.24 17.92 15.52 16.76L12.82 14.5C12.06 15.02 11.1 15.33 10 15.33C7.78 15.33 5.89 13.83 5.22 11.79H2.43V14.12C3.7 16.65 6.66 18.67 10 18.67Z" stroke="currentColor" strokeWidth="1.2"/>
  <path d="M5.22 11.79C5.05 11.27 4.96 10.72 4.96 10.17C4.96 9.62 5.05 9.07 5.22 8.55V6.22H2.43C1.86 7.34 1.54 8.62 1.54 9.97C1.54 11.32 1.86 12.6 2.43 13.72L5.22 11.39" stroke="currentColor" strokeWidth="1.2"/>
  <path d="M10 4.77C11.21 4.77 12.29 5.2 13.14 6.01L15.57 3.58C14.24 2.34 12.3 1.53 10 1.53C6.66 1.53 3.7 3.55 2.43 6.08L5.22 8.41C5.89 6.37 7.78 4.77 10 4.77Z" stroke="currentColor" strokeWidth="1.2"/>
</svg>;

export const IcApple = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
  <path d="M13.5 3.5C13.5 3.5 14.5 1.5 12.5 1C12.5 1 11 1 11 3C11 3 9 3 8 5C7 7 7.5 9 9 9.5C9 9.5 10 9.5 11 9C11 9 11 10.5 11 11C11 11.5 11 13 11 13.5C11 14 10.5 14 9.5 13.5C8.5 13 7.5 14 7.5 14C7.5 14 6 15.5 6.5 17.5C7 19.5 9 19.5 10 19C11 18.5 11 18.5 12 18.5C13 18.5 13 19 14 19.5C15 20 17 19.5 17 17.5C17 15.5 15.5 14 15.5 14C15.5 14 14.5 13.5 14 11C13.5 8.5 14 8.5 15 8C16 7.5 15.5 5 14 4.5C14 4.5 13.5 4.5 13.5 3.5Z"/>
</svg>;

export const IcFacebook = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M11 18.5V11.5H13L13.5 9H11V7.5C11 7 11.2 6.5 12 6.5H13.5V4C13.5 4 12.3 3.8 11.2 3.8C9 3.8 8 5.2 8 7V9H6V11.5H8V18.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

// ─ Inline / Status icons ─────────────────────────────────────────
export const IcKey = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="7.5" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
  <path d="M11 10.5L18 17M14.5 13.5L16.5 15.5M16 15L18 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <circle cx="7.5" cy="8" r="2" stroke="currentColor" strokeWidth="1.2"/>
</svg>;

export const IcGlobe = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M10 2C8 4.5 7 7 7 10C7 13 8 15.5 10 18M10 2C12 4.5 13 7 13 10C13 13 12 15.5 10 18" stroke="currentColor" strokeWidth="1.2"/>
  <path d="M2 10H18M3 6.5H17M3 13.5H17" stroke="currentColor" strokeWidth="1.1"/>
</svg>;

export const IcInfo = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M10 9V14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  <circle cx="10" cy="6.5" r="1" fill="currentColor"/>
</svg>;

export const IcShield = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M10 2L17.5 5V10C17.5 14 14 17.5 10 18.5C6 17.5 2.5 14 2.5 10V5L10 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

export const IcCopy = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <rect x="6.5" y="6.5" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/>
  <path d="M5 11.5H3.5C2.7 11.5 2.5 10.9 2.5 10.5V3.5C2.5 2.7 3.1 2.5 3.5 2.5H10.5C11.3 2.5 11.5 3.1 11.5 3.5V5" stroke="currentColor" strokeWidth="1.3"/>
</svg>;

export const IcLink = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M7.5 10.5C8.1 11.4 9.2 12 10.5 12C12.4 12 13.9 10.5 13.9 8.6V8.1C13.9 6.2 12.4 4.7 10.5 4.7H9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  <path d="M10.5 7.5C9.9 6.6 8.8 6 7.5 6C5.6 6 4.1 7.5 4.1 9.4V9.9C4.1 11.8 5.6 13.3 7.5 13.3H8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
</svg>;

export const IcTrash = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M3 5H15M6 5V3.5H12V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M4.5 5.5L5.5 14.5H12.5L13.5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M7.5 8V12M10.5 8V12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
</svg>;

export const IcCoupon = () => <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
  <path d="M2 7.5V4.5C2 3.7 2.7 3 3.5 3H16.5C17.3 3 18 3.7 18 4.5V7.5C16.9 7.5 16 8.4 16 9.5C16 10.6 16.9 11.5 18 11.5V14.5C18 15.3 17.3 16 16.5 16H3.5C2.7 16 2 15.3 2 14.5V11.5C3.1 11.5 4 10.6 4 9.5C4 8.4 3.1 7.5 2 7.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  <path d="M8 9.5H12M7 6.5H13M7 12.5H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="1.5 1"/>
</svg>;

export const IcPin = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M9 2C6.8 2 5 3.8 5 6C5 8.5 9 14 9 14C9 14 13 8.5 13 6C13 3.8 11.2 2 9 2Z" stroke="currentColor" strokeWidth="1.4"/>
  <circle cx="9" cy="6" r="1.8" stroke="currentColor" strokeWidth="1.2"/>
</svg>;

export const IcCal = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <rect x="2.5" y="4" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
  <path d="M2.5 8H15.5" stroke="currentColor" strokeWidth="1.3"/>
  <path d="M6 2.5V5M12 2.5V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  <circle cx="6.5" cy="11" r="1" fill="currentColor"/>
  <circle cx="9" cy="11" r="1" fill="currentColor"/>
  <circle cx="11.5" cy="11" r="1" fill="currentColor"/>
</svg>;

export const IcFlash = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M10.5 2L4 10H9L7.5 16L14 8H9L10.5 2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
</svg>;

export const IcFire = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M9 16C5.7 16 3 13.3 3 10C3 7 5 5 5 5C5 5 4.5 7 6.5 8.5C6.5 8.5 6 5 9 2C9 2 8 5.5 11 7C11 7 13 5 12.5 3.5C12.5 3.5 15 6 15 10C15 13.3 12.3 16 9 16Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  <path d="M9 16C7.3 16 6 14.7 6 13C6 11.5 7 10.5 7 10.5C7 10.5 6.8 11.5 7.8 12.2C7.8 12.2 8.5 10.5 10.5 11C10.5 11 11 12 11 13C11 14.7 10.3 16 9 16Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
</svg>;

export const IcStats = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M3 15V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M7 15V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M11 15V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M15 15V3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <path d="M2 15H16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
</svg>;

export const IcSale = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.4"/>
  <path d="M6 12L12 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  <circle cx="6.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
  <circle cx="11.5" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
</svg>;

// Social brand icons — geometric minimal
export const IcAppleB = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <path d="M12.5 3.5C13.2 2.6 13.7 1.5 13.5 0.5C12.5 0.6 11.3 1.2 10.6 2.1C10 2.9 9.3 4 9.6 5C10.6 5.1 11.8 4.4 12.5 3.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
  <path d="M13.5 5.2C12 5.2 11.3 6 10 6C8.7 6 7.8 5.2 6.5 5.2C4.5 5.2 2.5 7 2.5 10.5C2.5 13.5 4.5 17.5 6.5 17.5C7.5 17.5 8 17 9.5 17C11 17 11.5 17.5 12.5 17.5C14.5 17.5 16.5 13.5 16.5 10.5C16.5 7.5 15 5.2 13.5 5.2Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
</svg>;

export const IcFbB = () => <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
  <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.3"/>
  <path d="M10.5 17.9V11.5H12.5L13 9H10.5V7.5C10.5 6.9 10.7 6.5 11.5 6.5H13V4.2C13 4.2 11.8 4 10.7 4C8.5 4 7.5 5.3 7.5 7V9H5.5V11.5H7.5V17.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
</svg>;

// Empty-state large icons (inline SVG 64x64)
export const IcMtEmpty = () => <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
  <path d="M10 52L24 28L32 38L44 18L54 52H10Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  <path d="M10 44H54" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
  <path d="M30 38L34 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
  <circle cx="44" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
</svg>;

export const IcSearchEmpty = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <circle cx="22" cy="22" r="15" stroke="currentColor" strokeWidth="2"/>
  <path d="M33 33L46 46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  <path d="M16 22H28M22 16V28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  <path d="M11 22C11 16 16 11 22 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
</svg>;

export const IcBookmarkEmpty = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <path d="M12 8H40V48L26 38L12 48V8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  <path d="M19 22H33M19 29H28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
</svg>;

export const IcCartEmpty = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <path d="M5 9H12L18 40H40L46 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <circle cx="22" cy="46" r="4" stroke="currentColor" strokeWidth="1.8"/>
  <circle cx="36" cy="46" r="4" stroke="currentColor" strokeWidth="1.8"/>
  <path d="M24 27H36M24 34H32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
</svg>;

export const IcChatEmpty = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <path d="M7 8H45V36H30L24 46V36H7V8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  <path d="M17 20C20 16.5 26 16.5 29 19C32 21.5 31.5 25 28.5 27C26.5 28.2 22.5 29 21 31.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  <circle cx="21" cy="33" r="1.5" fill="currentColor" opacity="0.4"/>
</svg>;

export const IcUsersEmpty = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <circle cx="20" cy="18" r="8" stroke="currentColor" strokeWidth="2"/>
  <path d="M4 46C4 38 11.2 32 20 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <circle cx="36" cy="21" r="6" stroke="currentColor" strokeWidth="1.8"/>
  <path d="M28 46C28 40 31.6 36 36 36C40.4 36 44 40 44 46" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
</svg>;

export const IcFolderEmpty = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <path d="M5 15H22L26 11H47V38C47 39.7 45.7 41 44 41H8C6.3 41 5 39.7 5 38V15Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  <path d="M17 28L26 21L35 28" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M26 21V35" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
</svg>;

export const IcFeedEmpty = () => <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
  <rect x="6" y="6" width="40" height="28" rx="4" stroke="currentColor" strokeWidth="2"/>
  <path d="M6 42H30M6 48H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  <path d="M14 14H22M14 20H26M14 26H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  <rect x="28" y="10" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
</svg>;
