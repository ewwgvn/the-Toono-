# The TOONO — 프로젝트 컨텍스트

## 이 파일은 Claude에게 프로젝트를 설명하는 파일입니다.
## Claude Code나 VS Code에서 작업할 때 이 파일을 먼저 읽게 하세요.

## 프로젝트 개요
- Монгол бүтээлчдийн дижитал зах (몽골 크리에이터 마켓플레이스)
- Single HTML file (index.html) — React 18 + Supabase
- 5,200+ lines, 50 components, 29 screens

## 기술 스택
- React 18 (CDN, Babel in-browser)
- Supabase (Auth + PostgreSQL + Storage + Realtime)
- CSS-in-JS (inline styles)
- PWA ready

## 파일 구조
```
index.html          — 앱 전체 (유일한 소스 파일)
supabase-schema.sql — DB 테이블 + RLS
SUPABASE-SETUP.md   — Supabase 설정 가이드
README.md           — 프로젝트 설명
CLAUDE.md           — 이 파일 (Claude 컨텍스트)
```

## index.html 코드 구조 (순서대로)
1. **Theme** (line ~3) — DARK/LIGHT 테마 객체
2. **Supabase Config** (line ~50) — URL + anon key
3. **DB Layer** (line ~67) — Supabase API 래퍼 (30+ methods)
4. **Global State (GS)** (line ~415) — 앱 전체 상태
5. **Persistence** (line ~460) — saveGS/loadGS
6. **Icons** (line ~575) — 61개 커스텀 SVG 아이콘
7. **Atoms** (line ~1120) — PBtn, Crd, Avt, Inp, Pill, Toono 등
8. **ImageCropper** (line ~1254) — 이미지 크롭 (비율 선택 + 핀치줌)
9. **Toast/Loading/PWA** (line ~1350) — 유틸리티 컴포넌트
10. **Splash → Onboarding → Login → ProfileSetup** (line ~1620)
11. **Home** (line ~1940)
12. **Explore** (line ~2250)
13. **WorkDetail** (line ~2370)
14. **CreatorProfile** (line ~2550)
15. **Commission** (line ~2650)
16. **ChatList → ChatRoom** (line ~2800)
17. **MyProfile** (line ~2970)
18. **Notifications** (line ~3170)
19. **Settings** (line ~3220)
20. **EditProfile** (line ~3290)
21. **Dashboard** (line ~3390)
22. **OrderDetail → OrderList** (line ~3470)
23. **SavedWorks → Follows** (line ~3600)
24. **Checkout** (line ~3710)
25. **Upload** (line ~3830)
26. **CommManage** (line ~4130)
27. **CartScreen** (line ~4350)
28. **DisputeCenter** (line ~4690)
29. **Referral** (line ~4770)
30. **FeedScreen** (line ~4840)
31. **Portfolio** (line ~4920)
32. **App (main)** (line ~5090) — 라우터, nav(), 반응형 레이아웃

## 주요 패턴
- `GS.xxx` — 글로벌 상태 직접 접근 (useState 아님)
- `refresh()` — 강제 리렌더 (GS 변경 후)
- `saveGS()` — localStorage + window.storage에 저장
- `nav("screen")` — 화면 전환
- `toast("메시지", "success"|"error"|"info")` — 알림
- `T.accent`, `T.bg`, `T.textH` — 테마 색상

## 브랜드
- 이름: The TOONO
- 몽골어: Тооно (게르 천창)
- 주 색상: #5B8FE8 (accent blue)

## 배포
- GitHub: ewwgvn/the-Toono-
- Vercel: the-toono.vercel.app
- Supabase: The Toono project
