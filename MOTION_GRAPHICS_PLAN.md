# TOONO 모션 그래픽 계획 (Uliger World)

> 작성일: 2026-06-13
> 범위: 앱/웹사이트 전체 — 화면 전환, 네비게이션, 카드·리스트, 로딩, 인터랙션 디테일

---

## 1. 모션 무드 — "토오노(Тооно)가 열리는 느낌"

TOONO는 게르의 천장 채광창(тооно)에서 이름을 따왔다. 게르 안에서 위를 보면 토오노를 통해 하늘과 빛이 한 점으로 모였다가 퍼져나간다. 이 프로젝트의 모션은 그 이미지를 기준으로 삼는다.

- **느리게 열리고, 빠르게 반응한다** — 화면이 전환되거나 콘텐츠가 나타날 때는 0.3~0.5초의 부드러운 확장/페이드(토오노가 열리는 느낌). 버튼·좋아요 같은 즉각 반응은 0.1~0.2초로 짧고 탄력있게.
- **과하지 않은 디테일** — Blue+White 미니멀 시스템 위에서 모션은 "장식"이 아니라 "방향 안내"와 "확인 피드백" 역할. 큰 바운스나 회전은 지양.
- **빛/원형 모티프** — 로딩, 강조 효과에 원형 확산(scale + opacity), 부드러운 그라데이션 글로우(`accentGlow #C8DFF2`) 활용.
- **접근성** — 모든 신규 모션은 `prefers-reduced-motion: reduce`에서 즉시 정적 상태로 전환.

---

## 2. 현재 보유 자산 (재사용 우선)

`src/app/globals.css`에 이미 정의됨:

| keyframe | 용도 | 현재 사용처 |
|---|---|---|
| `fadeIn` | 화면 전환 | App.jsx 메인 컨텐츠 래퍼 |
| `fadeUp` | 카드 등장 | 벤토 그리드 (Explore/Portfolio) |
| `scaleIn` | 모달/팝업 등장 | 일부 다이얼로그 |
| `slideUp` | 바텀시트 | BottomSheet |
| `shimmer` / `skeletonPulse` | 로딩 스켈레톤 | `.toono-skeleton` |
| `feedHeartPop` | 더블탭 좋아요 | FeedScreen |
| `shagaiBounce` | 좋아요 토글 | `.shagai-liked` |
| `pulse` | 배지/알림 강조 | 일부 뱃지 |

→ **새 keyframe을 늘리기보다, 이 8개를 일관된 규칙으로 전체 화면에 확산 적용하는 것이 1차 목표.**

---

## 3. 영역별 계획

### P0 — 즉시 효과 크고 비용 낮음 (1차 작업 추천)

| 영역 | 현재 상태 | 제안 | 파일 |
|---|---|---|---|
| **화면 전환** | `key={screen+tab}` + `fadeIn .2s` (페이드만) | 방향성 추가: 하위 화면 진입(`nav()`)은 우→좌 슬라이드+페이드, 뒤로가기(`goBack()`)는 좌→우. 탭 전환(`home/explore/feed/me`)은 현재처럼 페이드만 유지 | `App.jsx` |
| **바텀 네비게이션** | 정적 아이콘, `toono-nav-pip` 점만 표시 | 탭 선택 시 아이콘 살짝 scale-up(1→1.08→1) + pip가 슬라이드로 이동(translateX transition) | `App.jsx`, `globals.css` |
| **모바일 글래스 오버레이 버그** | hover 전용이라 터치 디바이스에서 안 보임 | 모바일에서는 항상 약하게 표시(opacity 0.85) 또는 탭 시 표시로 전환 | `WorkCard.jsx`, `globals.css` |
| **버튼/카드 탭 피드백 통일** | `.toono-btn`, `.toono-card-tap`, `.toono-pressable` 가 화면별로 혼용 | 모든 클릭 가능 요소에 `.toono-pressable` 계열 일관 적용 + active 시 `transform: scale(0.97)` 통일 | 전 화면 (점진적) |

### P1 — 체감 임팩트 중간, 작업량 중간

| 영역 | 현재 상태 | 제안 | 파일 |
|---|---|---|---|
| **Splash 화면** | 정적 로고 | 토오노 모티프: 원형 빛이 중심에서 확산(scale 0.8→1, opacity 0→1, 0.6s) 후 로고 페이드인 | `Splash.jsx` |
| **Home 히어로/배너** | 정적 카드 | 진입 시 `fadeUp` stagger (배너 → 카테고리 → 추천 작품 순으로 80ms 간격) | `Home.jsx` |
| **스크롤 reveal** | 없음 | `IntersectionObserver` 기반 — 뷰포트 진입 시 `fadeUp` 1회 재생 (Explore/Portfolio/Home 리스트 공통 훅으로 구현) | 신규 `lib/useRevealOnScroll.js` |
| **좋아요/저장 토글** | `shagaiBounce`, `feedHeartPop` 일부 화면만 | WorkDetail, Explore 카드의 좋아요/저장 버튼에도 동일 마이크로 인터랙션 확산 | `WorkCard.jsx`, `WorkDetail.jsx` |
| **Toast/BottomSheet** | `slideUp` 적용됨 | 닫힐 때 역방향 애니메이션(slide-down + fade-out) 추가 — 현재는 즉시 사라짐 | `Toast.jsx`, `BottomSheet.jsx` |
| **알림 배지** | `pulse` 일부만 | 새 알림 도착 시 배지에 짧은 `scaleIn` + `pulse` 1회 | `App.jsx` (nav badge) |

### P2 — 디테일/완성도 (여유 있을 때)

| 영역 | 제안 |
|---|---|
| **이미지 캐러셀 전환** (FeedScreen, WorkDetail 다중 이미지) | 슬라이드 간 crossfade 또는 부드러운 translateX 전환 + 인디케이터 dot 애니메이션 |
| **Empty 상태** | `Empty` atom에 미묘한 호흡 애니메이션(아이콘 `scale 1↔1.03`, 4s loop)으로 "비어있지만 죽어있지 않은" 느낌 |
| **Pull-to-refresh** | 당기는 정도에 따라 토오노 원형 아이콘이 회전/확산되는 커스텀 인디케이터 |
| **로딩 스켈레톤 통일** | 현재 일부 화면만 `.toono-skeleton` 사용 — 전 화면 데이터 로딩 지점에 적용 |
| **카테고리 필터 전환** (Explore) | 필터 변경 시 그리드 아이템 재배치를 `FLIP` 애니메이션으로 부드럽게 |

---

## 4. 로드맵

1. **Phase 1 (P0)** — 화면 전환 방향성, 바텀 네비 인터랙션, 모바일 오버레이 버그 수정, 버튼/카드 탭 피드백 통일. *체감 효과 가장 큼, 전체 앱 톤이 달라짐.*
2. **Phase 2 (P1)** — Splash, Home 히어로 stagger, 스크롤 reveal 공통 훅, 좋아요/저장 인터랙션 확산, Toast/BottomSheet 닫힘 애니메이션.
3. **Phase 3 (P2)** — 캐러셀, Empty 상태, pull-to-refresh, 스켈레톤 통일, FLIP 그리드 전환.

각 Phase는 독립적으로 커밋/배포 가능하도록 설계 — Phase 1만 먼저 VS Code 클로드에게 보내서 적용 후 확인하고, 이상 없으면 Phase 2로 진행하는 방식 추천.

---

## 5. 다음 단계

Phase 1(P0) 항목을 VS Code 클로드용 복붙 프롬프트로 정리해 드릴 수 있습니다. 포함 범위 확인 부탁드려요:

- [ ] 화면 전환 슬라이드 방향성 (App.jsx)
- [ ] 바텀 네비 탭 인터랙션 (App.jsx + globals.css)
- [ ] 모바일 글래스 오버레이 버그 수정 (WorkCard.jsx)
- [ ] 버튼/카드 탭 피드백 통일 (전 화면 점진 적용 — 범위가 크면 별도 Phase로 분리 가능)
