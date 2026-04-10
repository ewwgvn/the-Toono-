# The TOONO — Project Context

## Project Overview
- Mongolian creator marketplace (Монгол бүтээлчдийн дижитал зах)
- Next.js 16 + React 19 + Supabase
- Mono Clean design (white bg, black accents, Helvetica Neue)
- PWA ready

## Tech Stack
- Next.js 16.2 (App Router, client-side rendering via `dynamic(() => import(...), { ssr: false })`)
- React 19 (hooks, functional components)
- Supabase (Auth + PostgreSQL + Storage + Realtime)
- CSS-in-JS (inline styles, mono clean system)
- Deployed on Vercel (auto-deploy from main)

## File Structure
```
src/
├── app/
│   ├── layout.jsx        — Root layout (fonts, meta, OG tags)
│   ├── page.jsx           — Entry (dynamic import of App, SSR disabled)
│   └── globals.css        — Global styles, responsive breakpoints
├── components/
│   ├── App.jsx            — Main router, nav, screen rendering
│   ├── atoms/             — PBtn, Crd, Avt, Inp, Pill, Empty, Toono
│   ├── layout/            — Toast, BottomSheet, Simple, NetworkStatus
│   ├── shared/            — WorkCard, CreatorRow, ImageCropper, PWAInstall
│   └── icons/             — 82 custom Mongolian-motif SVG icons
├── screens/               — 33 screen components (all "use client")
├── lib/
│   ├── store.js           — Global state (GS), persistence (saveGS/loadGS)
│   ├── supabase.js        — DB layer (40+ methods), sync queue (SQ)
│   └── utils.js           — getAllWorks, getCreators, fmtP, compressImage
└── theme/
    └── colors.js          — Mono clean color system (#FFF/#111/#666)
```

## Key Patterns
- `GS.xxx` — Global state direct access
- `refresh()` — Force re-render after GS mutation
- `saveGS()` — Persist to localStorage (MUST call after GS changes)
- `nav("screen")` — Screen navigation
- `toast("msg", "type")` — Import from `@/components/layout/Toast`
- `T.xxx` — Theme colors from `@/theme/colors`
- `DB.method()` — Supabase API wrapper from `@/lib/supabase`

## Design System: Mono Clean
- Colors: #FFFFFF bg, #111111 accent/text, #666666 secondary, #999999 tertiary
- Font: 'Helvetica Neue', Arial, sans-serif
- Card: border-radius 8px, no shadows. Button: border-radius 20px
- No gradients, no colorful accents (error #D32F2F, success #2E7D32 only)

## Categories (English, unified across all screens)
Fashion Design, Interior Design, Jewelry Design, Industrial Design,
Graphic Design, Textile Design, Fine Art, 3D Design, Photography

## Brand
- Name: The TOONO / Тооно (ger skylight)
- URL: the-toono.vercel.app
- GitHub: ewwgvn/the-Toono-
