# UI/UX 감사 리포트 — The TOONO (Uliger World)

> 기준 디자인 시스템: **Blue (#2681DA 액센트) + White/Light-Blue** (`src/theme/colors.js`의 `MONO` 토큰).
> "동화세계(Uliger World)" 브랜드에 맞춰 의도적으로 선택된 블루+화이트 톤이며, 이 보고서는 이 시스템에 대한 **일관성**을 점검합니다. CLAUDE.md에 적힌 "Mono Clean(블랙 액센트)" 서술은 실제 구현과 다른 구식 문서이며, 디자인 결함이 아니라 **문서 업데이트 대상**으로만 다룹니다.

정적 코드 분석(grep/Read) 기반 — 샌드박스 네트워크 제약으로 `npm install`/빌드/런타임 테스트 불가, 빌드 검증은 별도로 VS Code 환경에서 진행 필요.

---

## 1. 디자인 토큰 일관성

### 1-1. 토큰 대신 하드코딩된 HEX 값 (~40건, 15개 파일)

`theme/colors.js`에 이미 정의된 색을 화면 컴포넌트에서 문자열로 다시 적은 경우입니다. 기능상 문제는 없지만, 추후 팔레트를 조정할 때 (예: 액센트 블루 톤 변경) 이 값들은 누락되어 **불일치**가 발생합니다.

| 하드코딩 값 | 해당 토큰 | 대표 파일 |
|---|---|---|
| `#FFFFFF` | `T.bg` / `T.s1` | Checkout.jsx, DisputeCenter.jsx 등 다수 |
| `#767676` | `T.textDim` | Settings.jsx (6건) |
| `#D32F2F` | `T.red` | Settings.jsx |
| `#111111` | `T.textH` | Settings.jsx |
| `#F9A825` | `T.yellow` | Checkout.jsx |
| `#2681DA` / `#1A6BC0` | `T.accent` / `T.accentHover` | **WorkDetail.jsx만 해당** |

**WorkDetail.jsx**가 유일하게 블루 액센트(`#2681DA`, `#1A6BC0`)를 직접 하드코딩한 화면입니다 (배지 배경, 히어로 그라디언트). 다른 32개 화면은 모두 `T.accent`/`T.accentHover`를 사용하므로, WorkDetail.jsx만 토큰화하면 전체 시스템의 일관성이 완성됩니다.

```jsx
// WorkDetail.jsx — 현재
background:"#2681DA"
background:`linear-gradient(135deg,${T.accent},#1A6BC0,${T.accent})`

// 권장
background:T.accent
background:`linear-gradient(135deg,${T.accent},${T.accentHover},${T.accent})`
```

### 1-2. 팔레트에 없는 "성공/경고" 색 — 시스템 갭

`MONO`에는 `green`/`red`/`yellow` 텍스트·아이콘 색만 있고, **배경용 success/warning 톤**이 없습니다. 그 결과 화면마다 임의의 색을 즉석으로 만들어 씁니다.

- Checkout.jsx: 결제완료 배너 `background:"#F0FAF0"` (success 배경, 팔레트에 없음) + `border: ${T.green}40` (그린 알파)
- Checkout.jsx: 경고 배너 `background:"#FFF8E1"`, `color:"#7B4F00"` — 팔레트에 전혀 없는 다크 앰버 텍스트색

**권장**: `theme/colors.js`에 다음 토큰을 추가해 모든 화면이 재사용하도록 합니다.

```js
greenBg: "#F0FAF0",
yellowBg: "#FFF8E1",
yellowText: "#7B4F00",
```

이렇게 하면 "Blue+White, Uliger World" 톤 안에서 success/warning 컬러가 통일되고, 향후 다크모드(`isDark` 필드가 이미 존재) 확장 시에도 한 곳만 바꾸면 됩니다.

### 1-3. 중성 배경 두 개가 혼용됨 (`#F7F7F7`, `#DADADA`)

Settings.jsx의 아이콘 배경 `#F7F7F7`, WorkDetail.jsx의 플레이스홀더 아이콘 색 `#DADADA`도 팔레트 밖 값입니다. `T.s2`(#F0F7FD, 라이트블루)나 `T.border`(#C8DFF2)로 대체하면 "화이트가 아니라 라이트블루 톤"이라는 Uliger World 정체성이 디테일까지 일관되게 적용됩니다.

### 1-4. 캔버스 배경 vs. 카드 배경의 투-톤 화이트

`globals.css`의 루트 배경은 `#FDFCFA`(웜 오프화이트)인데, `theme/colors.js`의 `T.bg`/`T.s1`과 `.toono-surface`는 순수 `#FFFFFF`입니다.

```css
html, body, #__next { background: #FDFCFA; }   /* 캔버스 */
```
```js
bg: "#FFFFFF", s1: "#FFFFFF"                     /* 카드/표면 */
```

이 자체는 "카드가 배경보다 살짝 밝게 떠 보이는" 흔한 레이어링 기법이라 의도적이라면 괜찮지만, **`theme/colors.js`에 문서화되어 있지 않아** 다음 사람이 실수로 `#FFFFFF`를 캔버스에도 써버릴 위험이 있습니다. `MONO`에 `canvas: "#FDFCFA"` 토큰을 추가해 명시하는 것을 권장합니다.

### 1-5. 폰트 패밀리 — 양호 (수정 불필요)

33개 화면 전부 `const F = "'Helvetica Neue', Arial, sans-serif"`를 동일하게 선언해 사용 중입니다 (재확인 결과 일관성 확보). WorkDetail.jsx도 자체 `F`를 갖고 있으나, 배지/그라디언트 블록 2곳에서만 `F`를 안 쓰고 풀스트링을 다시 적었습니다 — 위 1-1 수정과 함께 `fontFamily:F`로 정리하면 됩니다.

---

## 2. 반응형 / 접근성

### 2-1. 반응형 브레이크포인트 — 양호

`globals.css`는 모바일 퍼스트로 768 / 1024 / 1400 / 1280 / 1700px 브레이크포인트를 체계적으로 운용하며, 네비게이션(`toono-mobile-nav`↔`toono-desktop-nav`), 그리드(`toono-grid-2`, `feed-grid`, `portfolio-gallery`), 콘텐츠 폭(`toono-readable`, `toono-form`, `profile-content`)까지 화면 유형별로 잘 분리되어 있습니다. 구조적 결함 없음.

### 2-2. 포커스 상태 — 토큰 불일치 (작은 항목)

`globals.css`의 `:focus-visible` 아웃라인이 `#111111`(검정)로 고정되어 있습니다:

```css
button:focus-visible, a:focus-visible, ... { outline: 2px solid #111111; outline-offset: 2px; }
.toono-btn:focus-visible { outline: 2px solid #111111; outline-offset: 2px; }
```

반면 입력 포커스는 블루 액센트를 씁니다 (`.toono-input:focus { border-color: #2681DA !important; box-shadow: 0 0 0 3px rgba(38,129,218,0.12); }`). 검정 포커스 링 자체는 대비(접근성) 기준으로는 충분하지만, "Blue+White" 톤에서 갑자기 검은 테두리가 튀어 보입니다. 브랜드 일관성을 위해 포커스 링도 `#2681DA`/`rgba(38,129,218,.35)` 계열로 통일하는 것을 권장합니다 (접근성 대비비는 흰 배경에서 블루도 충분히 확보됨, WCAG AA 통과).

### 2-3. 이미지 alt 텍스트 — 양호

WorkDetail.jsx의 `<img>` 4개 전부 적절한 `alt` 보유 (`alt={w.title}`, `alt={creatorName}`, `alt={ww.title}`, 라이트박스 줌 이미지는 `alt=""`로 장식적 이미지 처리 — 적절). 다른 화면들도 별도 이상 신호 없음. **접근성 alt 텍스트 이슈 없음.**

### 2-4. 터치 타겟

아이콘 버튼류(32px 전후) 컴포넌트가 11개 파일에서 16건 발견됩니다 — iOS/Android 권장 최소 터치 타겟(44×44px)보다 작습니다. 다만 `globals.css`에 `button:active { transform: scale(0.97) }`, `.toono-pressable:active { transform: scale(0.94) }` 등 탭 피드백이 잘 갖춰져 있어 "작아서 못 누른다"는 체감 문제는 완화되어 있습니다. 다음 단계 개선으로, 32px 비주얼 크기는 유지하되 `padding`이나 `::before` 히트영역 확장으로 실제 탭 영역을 44px까지 늘리는 것을 권장합니다 (특히 Explore/CartScreen/Portfolio처럼 그리드 밀도가 높은 화면).

---

## 3. 화면별 UX 흐름

### 3-1. 빈 상태(Empty state) 커버리지 — 11/33 화면만 적용

`Empty` 컴포넌트(atoms)를 사용하는 화면은 11개뿐입니다: Explore, WorkDetail(×3 — 후기/관련작품 등 여러 섹션), CreatorProfile, EditProfile, Upload(×2), SavedWorks, Portfolio(×2), OrderDetail, Checkout, Referral, CartScreen.

리스트형 화면 중 `Empty`가 안 보이는 곳들 — ChatList, FollowList, Notifications, CommManage, CommStatus, OrderList — 은 데이터가 0건일 때 사용자에게 "왜 비어있는지"를 안내하는 화면이 없을 가능성이 있습니다. 특히 **OrderList**(주문 0건), **Notifications**(알림 0건), **ChatList**(대화 0건)는 신규 유저가 처음 마주할 확률이 높은 화면이라 빈 상태 안내 우선 적용을 권장합니다.

### 3-2. 토스트 피드백 — 23/33 화면에서 사용, 적절히 분포

`toast()` 호출이 23개 화면, 89건 분포되어 있어 주요 액션(결제/제출/오류)에 대한 피드백은 충분히 갖춰진 편입니다. AdminPanel(10건), WorkDetail(6건), OrderDetail(6건), CommManage(6건) 등 트랜잭션이 많은 화면에 집중되어 있어 자연스러운 분포입니다. 별도 이슈 없음.

### 3-3. 네비게이션/탭 일관성

`App.jsx`의 라우터는 `screen`/`tab` 상태 기반으로 `PROTECTED`/`PROTECTED_TABS` 세트를 통해 인증 화면을 분리하고, `.toono-nav-pip`(블루 점, `#2681DA`)로 활성 탭을 표시합니다 — 톤 일관성 양호. lazy-loading + `ErrorBoundary`로 청크 로드 실패에 대한 폴백도 마련되어 있어 구조적으로 안정적입니다.

---

## 4. 문서 vs. 구현 불일치 (수정 대상 아님 — 문서 업데이트만)

`CLAUDE.md`의 "Design System: Mono Clean" 섹션은 다음과 같이 기술되어 있으나 실제 구현과 다릅니다:

```md
## Design System: Mono Clean
- Colors: #FFFFFF bg, #111111 accent/text, #666666 secondary, #999999 tertiary
- No gradients, no colorful accents
```

실제로는:
- 액센트 컬러는 `#2681DA`(블루)이며 `#111111`은 텍스트 헤딩에만 쓰입니다.
- `T.s2`(#F0F7FD), `T.s3`(#E3F0FA), `T.border`(#C8DFF2) 등 **라이트블루 계열 표면/테두리**가 카드·배지·강조 영역에 광범위하게 쓰입니다.
- WorkDetail.jsx에는 블루 그라디언트 히어로(`linear-gradient(135deg, accent, accentHover, accent)`)가 존재 — "No gradients" 서술과 불일치.

이는 사용자가 명시한 대로 **"동화세계(Uliger World)" 브랜드에 맞춘 의도적 변경**이므로 디자인을 되돌릴 필요는 없습니다. `CLAUDE.md`의 "Design System" 섹션만 다음처럼 갱신을 권장합니다:

```md
## Design System: Blue + White (Uliger World)
- Colors: #FFFFFF/#FDFCFA bg, #2681DA accent, #F0F7FD/#E3F0FA light-blue surfaces,
  #C8DFF2 borders, #111111 heading text, #666666/#767676 secondary text
- Gradients allowed for hero/feature accents (accent → accentHover)
- Error #D32F2F, success #2E7D32, warning #F9A825
```

---

## 5. 우선순위 정리

| 우선순위 | 항목 | 작업량 |
|---|---|---|
| 높음 | WorkDetail.jsx 블루 액센트 하드코딩 → `T.accent`/`T.accentHover`/`F` 토큰화 (1-1) | 매우 작음 |
| 높음 | `theme/colors.js`에 success/warning 배경 토큰 추가 + Checkout.jsx 적용 (1-2) | 작음 |
| 중간 | OrderList / Notifications / ChatList에 `Empty` 빈 상태 추가 (3-1) | 중간 |
| 중간 | `:focus-visible` 아웃라인을 블루 톤으로 통일 (2-2) | 작음 |
| 낮음 | 32px 아이콘 버튼 히트영역 44px로 확장 (2-4) | 중간 (다수 파일) |
| 낮음 | `MONO`에 `canvas:"#FDFCFA"` 토큰 추가, 중성 배경(#F7F7F7/#DADADA) → `T.s2`/`T.border` 정리 (1-3, 1-4) | 작음 |
| 문서 | `CLAUDE.md` Design System 섹션을 "Blue+White/Uliger World"로 갱신 (4) | 매우 작음 |

---

## 6. 종합 평가

전체적으로 **"Blue (#2681DA) + White/Light-Blue, Uliger World" 톤은 화면 전반에 잘 적용**되어 있고, 구조적인 반응형/접근성 기반(브레이크포인트, 탭 피드백, alt 텍스트, 에러 바운더리)도 견고합니다. 발견된 문제는 대부분 "토큰화 누락"과 "팔레트에 없는 색의 즉석 사용" 같은 **유지보수성 이슈**로, 디자인 자체를 재작업할 필요는 없습니다. WorkDetail.jsx 한 파일과 `theme/colors.js` 토큰 2~3개 추가만으로 시스템 일관성이 크게 개선됩니다.
