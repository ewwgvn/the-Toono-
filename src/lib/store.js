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
  // Trust metrics (for Star Seller calculation)
  trustMetrics: { responseRate: 100, onTimeRate: 100, avgRating: 0, totalOrders: 0, memberSince: "" },
  // Pending Supabase writes — retried on next sync
  syncQueue: [],
  publicWorks: [],
  publicCreators: [],
  disputes: [],
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

export function saveGS() {
  try {
    const data = {
      isLoggedIn: GS.isLoggedIn,
      needsProfileSetup: GS.needsProfileSetup,
      currentRole: GS.currentRole,
      activeChatId: GS.activeChatId,
      user: { ...GS.user, id: GS.user.id },
      myWorks: GS.myWorks,
      orders: GS.orders,
      myCommissions: GS.myCommissions,
      receivedCommissions: GS.receivedCommissions,
      notifications: GS.notifications,
      conversations: GS.conversations,
      cart: GS.cart,
      seeded: GS.seeded,
      liked: [...GS.liked],
      saved: [...GS.saved],
      following: [...GS.following],
      notifRead: [...GS.notifRead],
      recentlyViewed: GS.recentlyViewed?.slice(0, 20) || [],
      wishlists: GS.wishlists || [],
      offers: GS.offers || [],
      trustMetrics: GS.trustMetrics || {},
      syncQueue: GS.syncQueue || [],
      publicWorks: GS.publicWorks || [],
      publicCreators: GS.publicCreators || [],
      disputes: GS.disputes || [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { /* storage unavailable, silent fail */ }
}

export function loadGS() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    GS.isLoggedIn = data.isLoggedIn || false;
    GS.needsProfileSetup = data.needsProfileSetup || false;
    GS.currentRole = data.currentRole || null;
    GS.activeChatId = data.activeChatId || null;
    if (data.user) Object.assign(GS.user, data.user);
    GS.myWorks = data.myWorks || [];
    GS.orders = data.orders || [];
    GS.myCommissions = data.myCommissions || [];
    GS.receivedCommissions = data.receivedCommissions || [];
    GS.notifications = data.notifications || [];
    GS.conversations = data.conversations || [];
    GS.cart = data.cart || [];
    GS.seeded = data.seeded || false;
    GS.liked = new Set(data.liked || []);
    GS.saved = new Set(data.saved || []);
    GS.following = new Set(data.following || []);
    GS.notifRead = new Set(data.notifRead || []);
    GS.recentlyViewed = data.recentlyViewed || [];
    GS.wishlists = data.wishlists || [{ id: 1, name: "Хадгалах жагсаалт", items: [] }];
    GS.offers = data.offers || [];
    GS.trustMetrics = data.trustMetrics || { responseRate: 100, onTimeRate: 100, avgRating: 0, totalOrders: 0, memberSince: "" };
    GS.syncQueue = data.syncQueue || [];
    GS.publicWorks = data.publicWorks || [];
    GS.publicCreators = data.publicCreators || [];
    GS.disputes = data.disputes || [];
    // Recompute badge counters from actual data
    GS.unreadChat = getUnreadChat();
    GS.unreadNotif = getUnreadNotif();
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
    { id: Date.now(), icon: "follow", title: "The TOONO-д тавтай морил!", desc: "Профайлаа тохируулаад, бүтээлээ байршуулаарай.", time: "Сая", read: false, to: "me" },
  ];
  GS.seeded = true;
  GS.unreadNotif = getUnreadNotif();
  GS.unreadChat = getUnreadChat();
  saveGS();
}

export function resetGS() {
  GS.isLoggedIn = false;
  GS.needsProfileSetup = false;
  GS.currentRole = null;
  GS.user = { name: "", field: "", bio: "", tags: [], photo: null, revenue: "₮0", works: 0, followers: "0", following_count: 0, rating: 0, commOpen: false };
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
  saveGS();
}
