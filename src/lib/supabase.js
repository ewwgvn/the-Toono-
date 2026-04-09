"use client";

import { createClient } from "@supabase/supabase-js";
import { GS, saveGS, WORKS, CREATORS, getUnreadChat, getUnreadNotif } from "./store";

// ══════════════════════════════════════════
// SUPABASE CONFIG
// ══════════════════════════════════════════
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

export function initSupabase() {
  if (typeof window !== "undefined" && SUPABASE_URL && SUPABASE_ANON_KEY) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
  }
  return false;
}

export const isSupabaseReady = () => supabase !== null;

// ══════════════════════════════════════════
// DB — Data layer (Supabase with localStorage fallback)
// ══════════════════════════════════════════
export const DB = {
  // Auth
  async signUp(email, password, name, role) {
    if (!isSupabaseReady()) return { user: { id: "local-" + Date.now() }, error: null };
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, role } }
    });
    if (!error && data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, name, role, comm_open: role === "creator" }, { onConflict: "id" });
    }
    return { user: data?.user, error };
  },

  async signIn(email, password) {
    if (!isSupabaseReady()) return { user: null, error: { message: "Supabase тохиргоо хийгдээгүй. localStorage ашиглаж байна." } };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { user: data?.user, error };
  },

  async signOut() {
    if (isSupabaseReady()) await supabase.auth.signOut();
  },

  async getSession() {
    if (!isSupabaseReady()) return null;
    const { data } = await supabase.auth.getSession();
    return data?.session;
  },

  async getCurrentUser() {
    if (!isSupabaseReady()) return null;
    const { data } = await supabase.auth.getUser();
    return data?.user;
  },

  // Profile
  async getProfile(userId) {
    if (!isSupabaseReady()) return null;
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    return data;
  },

  async updateProfile(userId, updates) {
    if (!isSupabaseReady()) return null;
    const { data } = await supabase.from("profiles").update(updates).eq("id", userId).select().single();
    return data;
  },

  // Works
  async getWorks(filters = {}) {
    if (!isSupabaseReady()) return [];
    let query = supabase.from("works").select("*, profiles!creator_id(name, field, rating, comm_open, photo)").eq("status", "published").order("created_at", { ascending: false });
    if (filters.category) query = query.eq("category", filters.category);
    if (filters.material) query = query.eq("material", filters.material);
    if (filters.creator_id) query = query.eq("creator_id", filters.creator_id);
    if (filters.search) query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    if (filters.limit) query = query.limit(filters.limit);
    const { data } = await query;
    return data || [];
  },

  async getWork(id) {
    if (!isSupabaseReady()) return null;
    const { data } = await supabase.from("works").select("*, profiles!creator_id(name, field, rating, comm_open, photo)").eq("id", id).single();
    if (data) supabase.from("works").update({ views_count: (data.views_count || 0) + 1 }).eq("id", id).then(() => {});
    return data;
  },

  async createWork(work) {
    if (!isSupabaseReady()) return null;
    const { data, error } = await supabase.from("works").insert(work).select().single();
    if (error) console.error("createWork error:", error.message, error.code);
    return data;
  },

  async updateWork(id, updates) {
    if (!isSupabaseReady()) return null;
    const { data } = await supabase.from("works").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    return data;
  },

  async deleteWork(id) {
    if (!isSupabaseReady()) return;
    await supabase.from("works").delete().eq("id", id);
  },

  // My works (for creator)
  async getMyWorks(userId) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("works").select("*").eq("creator_id", userId).order("created_at", { ascending: false });
    return data || [];
  },

  // Orders
  async createOrder(order) {
    if (!isSupabaseReady()) return null;
    const { data } = await supabase.from("orders").insert(order).select().single();
    return data;
  },

  async getMyOrders(userId) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("orders").select("*").eq("buyer_id", userId).order("created_at", { ascending: false });
    return data || [];
  },

  async getReceivedOrders(userId) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("orders").select("*").eq("seller_id", userId).order("created_at", { ascending: false });
    return data || [];
  },

  async updateOrder(id, updates) {
    if (!isSupabaseReady()) return null;
    const { data } = await supabase.from("orders").update(updates).eq("id", id).select().single();
    return data;
  },

  // Likes / Saves / Follows
  async toggleLike(userId, workId) {
    if (!isSupabaseReady()) return;
    const { data } = await supabase.from("likes").select().eq("user_id", userId).eq("work_id", workId);
    if (data && data.length > 0) {
      await supabase.from("likes").delete().eq("user_id", userId).eq("work_id", workId);
      await supabase.rpc("decrement_likes", { wid: workId }).catch(() => {});
    } else {
      await supabase.from("likes").insert({ user_id: userId, work_id: workId });
      await supabase.rpc("increment_likes", { wid: workId }).catch(() => {});
    }
  },

  async toggleSave(userId, workId) {
    if (!isSupabaseReady()) return;
    const { data } = await supabase.from("saves").select().eq("user_id", userId).eq("work_id", workId);
    if (data && data.length > 0) {
      await supabase.from("saves").delete().eq("user_id", userId).eq("work_id", workId);
    } else {
      await supabase.from("saves").insert({ user_id: userId, work_id: workId });
    }
  },

  async toggleFollow(followerId, followingId) {
    if (!isSupabaseReady()) return;
    const { data } = await supabase.from("follows").select().eq("follower_id", followerId).eq("following_id", followingId);
    if (data && data.length > 0) {
      await supabase.from("follows").delete().eq("follower_id", followerId).eq("following_id", followingId);
    } else {
      await supabase.from("follows").insert({ follower_id: followerId, following_id: followingId });
    }
  },

  async getFollowerCount(userId) {
    if (!isSupabaseReady()) return 0;
    const { count } = await supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", userId);
    return count || 0;
  },

  async getFollowingCount(userId) {
    if (!isSupabaseReady()) return 0;
    const { count } = await supabase.from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", userId);
    return count || 0;
  },

  async getFollowers(userId) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("follows").select("follower_id, profiles!follower_id(id, name, photo, field)").eq("following_id", userId);
    return (data || []).map(d => ({ id: d.profiles?.id, name: d.profiles?.name || "", photo: d.profiles?.photo || null, field: d.profiles?.field || "" }));
  },

  async getFollowingList(userId) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("follows").select("following_id, profiles!following_id(id, name, photo, field)").eq("follower_id", userId);
    return (data || []).map(d => ({ id: d.profiles?.id, name: d.profiles?.name || "", photo: d.profiles?.photo || null, field: d.profiles?.field || "" }));
  },

  async getMyLikes(userId) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("likes").select("work_id").eq("user_id", userId);
    return (data || []).map(d => d.work_id);
  },

  async getMySaves(userId) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("saves").select("work_id").eq("user_id", userId);
    return (data || []).map(d => d.work_id);
  },

  async getMyFollows(userId) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("follows").select("following_id").eq("follower_id", userId);
    return (data || []).map(d => d.following_id);
  },

  // Comments
  async getComments(workId, limit = 20) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("comments").select("*, profiles!user_id(name, photo)").eq("work_id", workId).order("created_at", { ascending: false }).limit(limit);
    return data || [];
  },

  async addComment(workId, userId, text) {
    if (!isSupabaseReady() || !text.trim()) return null;
    const { data } = await supabase.from("comments").insert({ work_id: workId, user_id: userId, text: text.trim() }).select("*, profiles!user_id(name, photo)").single();
    return data;
  },

  async deleteComment(commentId) {
    if (!isSupabaseReady()) return;
    await supabase.from("comments").delete().eq("id", commentId);
  },

  async getCommentCount(workId) {
    if (!isSupabaseReady()) return 0;
    const { count } = await supabase.from("comments").select("id", { count: "exact", head: true }).eq("work_id", workId);
    return count || 0;
  },

  // Notifications
  async getNotifications(userId) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
    return data || [];
  },

  async markNotificationRead(id) {
    if (!isSupabaseReady()) return;
    await supabase.from("notifications").update({ read: true }).eq("id", id);
  },

  async createNotification(notif) {
    if (!isSupabaseReady()) return;
    await supabase.from("notifications").insert(notif);
  },

  // Commissions
  async createCommission(comm) {
    if (!isSupabaseReady()) return null;
    const { data } = await supabase.from("commissions").insert(comm).select().single();
    return data;
  },

  async updateCommission(id, updates) {
    if (!isSupabaseReady()) return null;
    const { data } = await supabase.from("commissions").update(updates).eq("id", id).select().single();
    return data;
  },

  async getMyCommissions(userId) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("commissions").select("*").eq("buyer_id", userId).order("created_at", { ascending: false });
    return data || [];
  },

  async getReceivedCommissions(userId) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("commissions").select("*").eq("seller_id", userId).order("created_at", { ascending: false });
    return data || [];
  },

  // Reviews
  async getReviews(sellerId) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("reviews").select("*, profiles!reviewer_id(name)").eq("seller_id", sellerId).order("created_at", { ascending: false });
    return data || [];
  },

  // Messages (realtime)
  async getConversations(userId) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("conversations").select("*, user_a_profile:profiles!user_a(id, name, photo), user_b_profile:profiles!user_b(id, name, photo)").or(`user_a.eq.${userId},user_b.eq.${userId}`).order("last_at", { ascending: false });
    return data || [];
  },

  async getMessages(conversationId) {
    if (!isSupabaseReady()) return [];
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
    return data || [];
  },

  async sendMessage(conversationId, senderId, text, image = null) {
    if (!isSupabaseReady()) return;
    await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: senderId, text, image });
    await supabase.from("conversations").update({ last_message: text || "Зураг", last_at: new Date().toISOString() }).eq("id", conversationId);
  },

  // Realtime subscriptions
  subscribeToMessages(conversationId, callback) {
    if (!isSupabaseReady()) return null;
    return supabase.channel(`messages:${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, payload => callback(payload.new))
      .subscribe();
  },

  subscribeToNotifications(userId, callback) {
    if (!isSupabaseReady()) return null;
    return supabase.channel(`notifs:${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, payload => callback(payload.new))
      .subscribe();
  },

  unsubscribe(channel) {
    if (channel && isSupabaseReady()) supabase.removeChannel(channel);
  },

  async getOrCreateConversation(userA, userB) {
    if (!isSupabaseReady()) return null;
    try {
      const { data } = await supabase.from("conversations").select("*")
        .or(`and(user_a.eq.${userA},user_b.eq.${userB}),and(user_a.eq.${userB},user_b.eq.${userA})`)
        .maybeSingle();
      if (data) return data;
      const { data: created } = await supabase.from("conversations")
        .insert({ user_a: userA, user_b: userB }).select().single();
      return created;
    } catch (e) { return null; }
  },

  // Upload file to Supabase Storage
  async uploadFile(bucket, path, base64Url) {
    if (!isSupabaseReady()) return null;
    try {
      const res = await fetch(base64Url);
      const blob = await res.blob();
      const { error } = await supabase.storage.from(bucket).upload(path, blob, { upsert: true, contentType: blob.type || "image/jpeg" });
      if (error) { console.error(`[Storage] ${bucket}/${path}:`, error.message); return null; }
      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    } catch (e) { console.error("[Storage] uploadFile exception:", e.message); return null; }
  },

  // Creators list
  async getCreators(filters = {}) {
    if (!isSupabaseReady()) return [];
    let query = supabase.from("profiles").select("*").eq("role", "creator").order("rating", { ascending: false });
    if (filters.search) query = query.or(`name.ilike.%${filters.search}%,field.ilike.%${filters.search}%`);
    if (filters.limit) query = query.limit(filters.limit);
    const { data } = await query;
    return data || [];
  },

  // Offers
  async createOffer(offer) {
    if (!isSupabaseReady()) return null;
    const { data } = await supabase.from("offers").insert(offer).select().single();
    return data;
  },

  // Search all users by name
  async searchProfiles(query) {
    if (!isSupabaseReady() || !query) return [];
    const { data } = await supabase.from("profiles").select("id,name,field,photo,role,bio,followers_count,rating").ilike("name", `%${query}%`).limit(30);
    return data || [];
  },
};

// ══════════════════════════════════════════
// SYNC — Load Supabase data into GS (local cache)
// ══════════════════════════════════════════
export async function syncFromSupabase() {
  if (!isSupabaseReady()) return false;
  try {
    const user = await DB.getCurrentUser();
    if (!user) return false;

    let profile = await DB.getProfile(user.id);
    // Profile missing — create it (handles cases where trigger failed)
    if (!profile) {
      const meta = user.user_metadata || {};
      await supabase.from("profiles").upsert({
        id: user.id,
        name: meta.name || "",
        role: meta.role || "buyer",
        comm_open: meta.role === "creator",
      }, { onConflict: "id" });
      profile = await DB.getProfile(user.id);
    }
    if (!profile) return false;

    GS.isLoggedIn = true;
    GS.currentRole = profile.role || "buyer";
    GS.user = {
      id: user.id,
      name: profile.name || "",
      field: profile.field || "",
      bio: profile.bio || "",
      tags: profile.tags || [],
      photo: profile.photo || null,
      revenue: "₮0",
      works: 0,
      followers: String(profile.followers_count || 0),
      following_count: profile.following_count || 0,
      rating: profile.rating || 0,
      commOpen: profile.comm_open || false,
    };
    GS.trustMetrics = {
      responseRate: profile.response_rate || 100,
      onTimeRate: profile.on_time_rate || 100,
      avgRating: profile.rating || 0,
      totalOrders: profile.total_orders || 0,
      memberSince: profile.created_at?.slice(0, 7) || "",
    };

    // Load user data in parallel — each wrapped so one failure doesn't abort all
    const safe = (p) => p.catch(() => []);
    const [myWorks, allWorks, orders, likes, saves, follows, notifs, comms, receivedComms, convos, allCreators] = await Promise.all([
      safe(DB.getMyWorks(user.id)),
      safe(DB.getWorks()),
      safe(DB.getMyOrders(user.id)),
      safe(DB.getMyLikes(user.id)),
      safe(DB.getMySaves(user.id)),
      safe(DB.getMyFollows(user.id)),
      safe(DB.getNotifications(user.id)),
      safe(DB.getMyCommissions(user.id)),
      safe(DB.getReceivedCommissions(user.id)),
      safe(DB.getConversations(user.id)),
      safe(DB.getCreators()),
    ]);
    // Populate global WORKS array with all published works from Supabase
    WORKS.length = 0;
    allWorks.forEach(w => WORKS.push({
      ...w,
      creator: w.profiles?.name || w.creator || "\u2014",
      comm: w.profiles?.comm_open || false,
    }));
    // Populate global CREATORS array with all creator profiles from Supabase
    CREATORS.length = 0;
    allCreators.forEach(p => {
      if (p.id !== user.id) CREATORS.push(p);
    });

    GS.myWorks = myWorks;
    GS.user.works = myWorks.length;
    GS.orders = orders;
    GS.liked = new Set(likes);
    GS.saved = new Set(saves);
    GS.following = new Set(follows);
    GS.notifications = notifs.map(n => ({
      id: n.id, icon: n.icon, title: n.title, desc: n.description,
      time: new Date(n.created_at).toLocaleDateString(), read: n.read, to: n.link,
    }));
    GS.myCommissions = comms;
    GS.receivedCommissions = receivedComms;
    // Load conversations
    GS.conversations = convos.map(cv => {
      const isA = cv.user_a === user.id;
      const other = isA ? cv.user_b_profile : cv.user_a_profile;
      const otherUnread = isA ? cv.unread_a : cv.unread_b;
      return {
        id: cv.id, dbId: cv.id,
        creatorId: other?.id || null,
        name: other?.name || "\u2014",
        photo: other?.photo || null,
        accent: "#111111",
        online: false,
        unread: otherUnread || 0,
        msgs: cv.last_message ? [{ id: 0, mine: false, text: cv.last_message, time: "", status: "read" }] : [],
      };
    });
    GS.unreadChat = GS.conversations.reduce((s, c) => s + c.unread, 0);
    GS.unreadNotif = notifs.filter(n => !n.read).length;
    GS.seeded = true;
    GS.needsProfileSetup = !profile.name || profile.name.length === 0;

    // Revenue calculation
    const totalRev = orders.filter(o => o.status === "done").reduce((s, o) => s + o.total_price, 0);
    GS.user.revenue = "\u20AE" + totalRev.toLocaleString();

    // Flush any pending writes from previous sessions
    setTimeout(() => SQ.flush(), 2000);

    console.log(`[Sync] done works=${WORKS.length} creators=${CREATORS.length} myWorks=${GS.myWorks.length} orders=${orders.length}`);
    return true;
  } catch (e) {
    console.error("[Sync] Supabase sync error:", e);
    return false;
  }
}

// ══════════════════════════════════════════
// fetchPublicData — Load public works & creators
// ══════════════════════════════════════════
export async function fetchPublicData() {
  if (!isSupabaseReady()) return;
  try {
    const [works, creators] = await Promise.all([
      DB.getWorks(),
      DB.getCreators()
    ]);
    GS.publicWorks = (works || []).map(w => ({
      id: w.id,
      title: w.title,
      creator: w.profiles?.name || "\u0411\u04AF\u0442\u044D\u044D\u043B\u0447",
      creatorPhoto: w.profiles?.photo || null,
      cid: w.creator_id,
      price: w.price || 0,
      accent: w.accent || "#111111",
      likes: w.likes_count || 0,
      desc: w.description || "",
      sizes: w.sizes || [],
      colors: w.colors || [],
      stock: w.stock || 1,
      cat: w.category || "",
      medium: w.material || w.medium || "",
      duration: "",
      tags: w.tags || [],
      images: w.images || [],
      video: w.video || null,
      creator_id: w.creator_id,
      createdAt: w.created_at || null,
      year: w.created_at ? new Date(w.created_at).getFullYear() : 2026,
      status: w.status || "published",
      sales: w.sales_count || 0,
      views: w.views_count || 0,
      digital: w.digital || false,
      badge: w.badge || null,
    }));
    GS.publicCreators = (creators || []).map(c => ({
      id: c.id,
      name: c.name || "",
      field: c.field || "\u0411\u04AF\u0442\u044D\u044D\u043B\u0447",
      followers: String(c.followers_count || 0),
      works: 0,
      comm: c.comm_open || false,
      rating: c.rating || 0,
      accent: "#111111",
      level: c.rating >= 4.8 ? "top" : c.rating >= 3 ? "verified" : "rising",
      photo: c.photo || null,
      bio: c.bio || "",
      tags: c.tags || [],
    }));
  } catch (e) {
    console.error("fetchPublicData error:", e);
  }
}

// ══════════════════════════════════════════
// SQ — Sync Queue: Never lose data to Supabase
// If a write fails, it's queued and retried
// ══════════════════════════════════════════
export const SQ = {
  // Add a pending operation
  push(op, payload) {
    const item = { id: Date.now() + Math.random(), op, payload, retries: 0, ts: new Date().toISOString() };
    GS.syncQueue.push(item);
    saveGS();
    // Try immediately in background
    SQ.flush();
    return item.id;
  },

  // Remove successfully synced item
  done(id) {
    GS.syncQueue = GS.syncQueue.filter(i => i.id !== id);
    saveGS();
  },

  // Retry all pending items
  async flush() {
    if (!isSupabaseReady() || !GS.isLoggedIn || GS.syncQueue.length === 0) return;
    const queue = [...GS.syncQueue];
    for (const item of queue) {
      try {
        let ok = false;
        switch (item.op) {
          case 'createWork': {
            const { data, error } = await supabase.from('works').insert(item.payload).select().single();
            if (data) {
              // Update local work with real Supabase ID
              [GS.myWorks, WORKS].forEach(arr => {
                const w = arr.find(w => w._sqId === item.id);
                if (w) { w.id = data.id; delete w._sqId; }
              });
              ok = true;
            } else if (error) console.error('[SQ] createWork:', error.message);
            break;
          }
          case 'updateProfile': {
            const { error } = await supabase.from('profiles').upsert(item.payload, { onConflict: 'id' });
            if (!error) ok = true;
            else console.error('[SQ] updateProfile:', error.message);
            break;
          }
          case 'createOrder': {
            const { data, error } = await supabase.from('orders').insert(item.payload).select().single();
            if (data) {
              const o = GS.orders.find(o => o._sqId === item.id);
              if (o) { o.id = data.id; delete o._sqId; }
              ok = true;
            } else if (error) console.error('[SQ] createOrder:', error.message);
            break;
          }
          case 'createCommission': {
            const { data, error } = await supabase.from('commissions').insert(item.payload).select().single();
            if (data) ok = true;
            else if (error) console.error('[SQ] createCommission:', error.message);
            break;
          }
          case 'updateWork': {
            const { error } = await supabase.from('works').update(item.payload.updates).eq('id', item.payload.id);
            if (!error) ok = true;
            break;
          }
        }
        if (ok) SQ.done(item.id);
        else {
          item.retries = (item.retries || 0) + 1;
          // Drop after 10 failed attempts
          if (item.retries >= 10) SQ.done(item.id);
          else saveGS();
        }
      } catch (e) {
        item.retries = (item.retries || 0) + 1;
        if (item.retries >= 10) SQ.done(item.id);
        else saveGS();
      }
    }
  },
};

export { supabase };
