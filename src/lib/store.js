"use client";

// ══════════════════════════════════════════
// GLOBAL STATE (GS)
// ══════════════════════════════════════════
export const GS = {
  liked: new Set(), saved: new Set(), following: new Set(),
  unreadChat: 0, unreadNotif: 0, cart: [], cartCount: 0,
  // Auth state
  isLoggedIn: false,
  needsProfileSetup: false,
  currentRole: null, // "creator" | "buyer"
  // Conversations
  conversations: [],
  activeChatId: null,
  // User profile
  user: {
    id: null,
    name: "",
    field: "",
    bio: "",
    tags: [],
    photo: null,
    revenue: "₮0",
    works: 0, followers: "0", following_count: 0, rating: 0,
    commOpen: false,
    instagram: "", facebook: "", twitter: "",
    role: "buyer",       // "buyer" | "creator" | "admin"
    verified: false,     // admin-verified creator badge
    bankCode: "",        // Khan Bank code
    bankAccountNo: "",
    bankAccountName: "",
    suspended: false,
  },
  // Dynamic data stores
  myWorks: [],
  orders: [],
  myCommissions: [], // commissions I sent
  receivedCommissions: [], // commissions I received
  notifications: [],
  // Demo seed flag
  seeded: false,
  // Notification read state
  notifRead: new Set(),
  // Recently viewed works
  recentlyViewed: [],
  // Wishlists / Collections
  wishlists: [{ id: 1, name: "Хадгалах жагсаалт", items: [] }],
  // Offers sent
  offers: [],
  // Direct buy (bypass cart)
  directBuyItem: null,
  // Selected order for detail view
  selectedOrderId: null,
  // Override target for ReviewWrite when reviewing a commission (not an order)
  reviewTarget: null,
  // Trust metrics (for Star Seller calculation)
  trustMetrics: { responseRate: 100, onTimeRate: 100, avgRating: 0, totalOrders: 0, memberSince: "" },
  // Pending Supabase writes — retried on next sync
  syncQueue: [],
  publicWorks: [],
  publicCreators: [],
  disputes: [],
  // Transient UI state for FollowList
  viewingFollowsUserId: null,
  viewingFollowsTab: null,
  editingWorkId: null,
};

// ── Dynamic data arrays ──
export const WORKS = [];
export const CREATORS = [];

// ── DYNAMIC BADGE COMPUTATION ──
export function getUnreadChat() {
  return GS.conversations.reduce((s, c) => s + (c.unread || 0), 0);
}
export function getUnreadNotif() {
  return GS.notifications.filter(n => !n.read).length;
}

// ══════════════════════════════════════════
// PERSISTENCE via localStorage
// ══════════════════════════════════════════
const STORAGE_KEY = "toono-app-state";

// Strip heavy base64 URLs from objects to fit in localStorage
function stripBase64(obj) {
  if (!obj) return obj;
  if (typeof obj === "string") {
    return obj.startsWith("data:") && obj.length > 10000 ? null : obj;
  }
  if (Array.isArray(obj)) return obj.map(stripBase64);
  if (typeof obj === "object") {
    const out = {};
    for (const k in obj) out[k] = stripBase64(obj[k]);
    return out;
  }
  return obj;
}

// Internal synchronous write — do not call directly from outside
function _doSaveGS() {
  // photo: keep only Storage URLs, drop base64 blobs
  const safePhoto = (GS.user.photo && !GS.user.photo.startsWith("data:")) ? GS.user.photo : null;

  // cart: drop images/photos but keep fields needed for order creation
  const slimCart = (GS.cart || []).map(({ id, title, price, qty, size, color, creator_id, cid, creator }) => ({
    id, title, price, qty: qty || 1,
    size: size || null, color: color || null,
    creator_id: creator_id || cid || null,
    creator: creator || null,
  }));

  const data = {
    // ── Auth ──────────────────────────────────
    isLoggedIn:        GS.isLoggedIn,
    needsProfileSetup: GS.needsProfileSetup,
    currentRole:       GS.currentRole,
    activeChatId:      GS.activeChatId,
    seeded:            GS.seeded,
    // ── User profile (no base64 photo) ────────
    user: { ...GS.user, photo: safePhoto },
    // ── Interaction state (IDs only) ──────────
    liked:         [...GS.liked],
    saved:         [...GS.saved],
    following:     [...GS.following],
    notifRead:     [...GS.notifRead],
    recentlyViewed: (GS.recentlyViewed || []).slice(0, 20),
    // ── Cart (slim — no images) ───────────────
    cart: slimCart,
    // ── User-owned work IDs (count/ownership) ─
    myWorkIds: (GS.myWorks || []).map(w => w.id),
    // ── Preferences & offline-write queue ─────
    trustMetrics: GS.trustMetrics || {},
    wishlists:    GS.wishlists   || [],
    syncQueue:    GS.syncQueue   || [],
    // ── NOT saved (fetched from server on sync) ─
    // publicWorks, publicCreators, myWorks (full),
    // orders, conversations, notifications,
    // myCommissions, receivedCommissions, disputes
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    if (e?.name === "QuotaExceededError" || /quota/i.test(e?.message || "")) {
      // Tier-2: drop interaction sets and wishlists
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          ...data, liked: [], saved: [], following: [],
          notifRead: [], recentlyViewed: [], wishlists: [], syncQueue: [],
        }));
        console.warn("[store] Saved slim state (quota — dropped interaction sets)");
      } catch (e2) {
        // Tier-3: auth only
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            isLoggedIn: data.isLoggedIn, needsProfileSetup: data.needsProfileSetup,
            currentRole: data.currentRole, seeded: data.seeded,
            user: { ...data.user, photo: null },
          }));
          console.warn("[store] Saved auth-only state (quota exceeded)");
        } catch (e3) { /* give up */ }
      }
    }
  }
}

// Debounced public API — coalesces rapid consecutive saves into one write
let _saveTimer = null;
export function saveGS() {
  if (_saveTimer) clearTimeout(_saveTimer);
  _saveTimer = setTimeout(() => { _saveTimer = null; _doSaveGS(); }, 150);
}

// Immediate flush — use for critical paths (logout, hard nav away)
export function flushSaveGS() {
  if (_saveTimer) { clearTimeout(_saveTimer); _saveTimer = null; }
  _doSaveGS();
}

export function loadGS() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);

    // ── Auth ──────────────────────────────────────────────────────
    GS.isLoggedIn        = data.isLoggedIn        || false;
    GS.needsProfileSetup = data.needsProfileSetup || false;
    GS.currentRole       = data.currentRole       || null;
    GS.activeChatId      = data.activeChatId      || null;
    GS.seeded            = data.seeded            || false;

    // ── User profile ──────────────────────────────────────────────
    if (data.user) Object.assign(GS.user, data.user);

    // ── Interaction state ─────────────────────────────────────────
    GS.liked          = new Set(data.liked          || []);
    GS.saved          = new Set(data.saved          || []);
    GS.following      = new Set(data.following      || []);
    GS.notifRead      = new Set(data.notifRead      || []);
    GS.recentlyViewed = data.recentlyViewed         || [];

    // ── Cart (slim items — images filled in by publicWorks after sync) ──
    GS.cart = data.cart || [];

    // ── Preferences & offline queue ──────────────────────────────
    GS.trustMetrics = data.trustMetrics || { responseRate: 100, onTimeRate: 100, avgRating: 0, totalOrders: 0, memberSince: "" };
    GS.wishlists    = data.wishlists    || [{ id: 1, name: "Хадгалах жагсаалт", items: [] }];
    GS.syncQueue    = data.syncQueue    || [];

    // ── Server-fetched data — always start empty, filled by syncFromSupabase ──
    GS.myWorks             = [];
    GS.orders              = [];
    GS.myCommissions       = [];
    GS.receivedCommissions = [];
    GS.notifications       = [];
    GS.conversations       = [];
    GS.publicWorks         = [];
    GS.publicCreators      = [];
    GS.disputes            = [];
    GS.offers              = [];

    // Badges start at 0; recomputed after sync
    GS.unreadChat  = 0;
    GS.unreadNotif = 0;

    return true;
  } catch (e) { return false; }
}

// Seed demo data for logged-in demo users
export function seedDemoData(role, userName) {
  GS.isLoggedIn = true;
  GS.currentRole = role;
  GS.user.name = userName;
  GS.needsProfileSetup = true; // Always go to profile setup for new accounts

  if (role === "creator") {
    GS.user.commOpen = true;
    GS.trustMetrics = { responseRate: 0, onTimeRate: 0, avgRating: 0, totalOrders: 0, memberSince: new Date().toISOString().slice(0, 7) };
  }
  // Welcome notification
  GS.notifications = [
    { id: Date.now(), icon: "follow", title: "Uliger World-д тавтай морил!", desc: "Профайлаа тохируулаад, бүтээлээ байршуулаарай.", time: "Сая", read: false, to: "me" },
  ];
  GS.seeded = true;
  GS.unreadNotif = getUnreadNotif();
  GS.unreadChat = getUnreadChat();
  _doSaveGS();
}

export function resetGS() {
  GS.isLoggedIn = false;
  GS.needsProfileSetup = false;
  GS.currentRole = null;
  GS.user = { id: null, name: "", field: "", bio: "", tags: [], photo: null, revenue: "₮0", works: 0, followers: "0", following_count: 0, rating: 0, commOpen: false, instagram: "", facebook: "", twitter: "", role: "buyer", verified: false, bankCode: "", bankAccountNo: "", bankAccountName: "", suspended: false };
  GS.myWorks = [];
  GS.orders = [];
  GS.myCommissions = [];
  GS.receivedCommissions = [];
  GS.notifications = [];
  GS.conversations = [];
  GS.activeChatId = null;
  GS.liked = new Set();
  GS.saved = new Set();
  GS.following = new Set();
  GS.cart = [];
  GS.unreadChat = 0;
  GS.unreadNotif = 0;
  GS.seeded = false;
  GS.notifRead = new Set();
  GS.recentlyViewed = [];
  GS.wishlists = [{ id: 1, name: "Хадгалах жагсаалт", items: [] }];
  GS.offers = [];
  GS.trustMetrics = { responseRate: 0, onTimeRate: 0, avgRating: 0, totalOrders: 0, memberSince: "" };
  GS.publicWorks = [];
  GS.publicCreators = [];
  GS.disputes = [];
  GS.syncQueue = [];
  GS.directBuyItem = null;
  GS.editingWorkId = null;
  GS.viewingFollowsUserId = null;
  GS.viewingFollowsTab = null;
  GS.selectedOrderId = null;
  GS.reviewTarget = null;
  _doSaveGS();
}
