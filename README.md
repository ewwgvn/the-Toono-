# The TOONO — Бүтээлчдийн Зах

Монгол бүтээлчдийн гар урлалыг дэлхийд таниулах дижитал зах.

## 🌐 Live
[https://the-toono.vercel.app](https://the-toono.vercel.app)

## 🚀 Deploy
Auto-deploys to Vercel from `main` branch.

```bash
npm install
npm run dev    # Local dev at http://localhost:3000
npm run build  # Production build
```

Required env vars (`.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## ⚡ Supabase Setup
1. Create project at [supabase.com](https://supabase.com) (Seoul region)
2. SQL Editor → paste `supabase-schema.sql` → Run
3. Storage → create `avatars` (public) + `works` (public) buckets
4. Settings → API → copy URL and anon key to `.env.local`

## 📱 Features
- PWA (install to home screen)
- Mono Clean design (white/black, Helvetica Neue)
- 33 screens, 82 custom Mongolian icons
- Instagram-style feed + 2-column grid
- Realtime chat (Supabase Realtime)
- Commissions / orders / payments
- Responsive (mobile + desktop)
- Followers/following, likes, saves, comments

## 🛠 Tech Stack
- Next.js 16 (App Router)
- React 19
- Supabase (Auth + Postgres + Storage + Realtime)
- CSS-in-JS (inline styles)
- Vercel deployment

© 2026 The TOONO
