# The TOONO — Бүтээлчдийн Зах

Монгол бүтээлчдийн гар урлалыг дэлхийд таниулах дижитал зах.

## 🌐 Live
[https://YOUR_USERNAME.github.io/thetoono](https://YOUR_USERNAME.github.io/thetoono)

## 🚀 Deploy
1. GitHub repo → Settings → Pages → Source: `main` branch → `/ (root)`
2. Save → 1~2분 후 자동 배포

## ⚡ Supabase 연동
1. [supabase.com](https://supabase.com)에서 프로젝트 생성 (Seoul 리전)
2. SQL Editor에서 `supabase-schema.sql` 복붙 → Run
3. Storage에서 `avatars`(public) + `works`(public) 버킷 생성
4. Settings → API에서 URL + anon key 복사
5. `index.html`에서 교체:
```js
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
```

## 📱 Features
- PWA (홈 화면 설치)
- 다크/라이트 테마
- 이미지 크롭 (1:1, 16:9, 4:3, 3:4, 9:16, 사용자 지정)
- 실시간 채팅 (Supabase Realtime)
- 주문 / 커미션 / 결제 시스템
- 반응형 (모바일 + 데스크탑)
- 50개 컴포넌트, 29개 화면

## 🛠 Tech
React 18 (CDN) · Supabase · Single HTML · No build step

© 2026 The TOONO
