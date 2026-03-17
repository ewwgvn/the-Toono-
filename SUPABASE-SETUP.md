# The TOONO — Supabase 연동 가이드

## 1단계: Supabase 프로젝트 만들기 (5분)

1. **supabase.com** 접속 → "Start your project" → GitHub로 로그인
2. "New Project" 클릭
3. 이름: `toono` / 비밀번호 설정 / Region: `Northeast Asia (Seoul)` 선택
4. "Create new project" → 2분 기다리기

## 2단계: 데이터베이스 스키마 만들기 (2분)

1. 왼쪽 메뉴 → **SQL Editor** 클릭
2. `toono-supabase-schema.sql` 파일 내용 전부 복사
3. SQL Editor에 붙여넣기 → **Run** 클릭
4. "Success" 메시지 확인

## 3단계: 스토리지 버킷 만들기 (1분)

1. 왼쪽 메뉴 → **Storage** 클릭
2. "New Bucket" → 이름: `avatars` → Public ✓ → Create
3. "New Bucket" → 이름: `works` → Public ✓ → Create
4. "New Bucket" → 이름: `attachments` → Public ✗ → Create

## 4단계: API 키 복사하기 (30초)

1. 왼쪽 메뉴 → **Settings** → **API**
2. 복사할 것 2개:
   - **Project URL**: `https://xxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (길고 긴 문자열)

## 5단계: 앱에 연결하기 (30초)

`toono-website.html` 파일을 텍스트 편집기로 열고 검색:

```
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_ANON_KEY";
```

여기에 4단계에서 복사한 값을 붙여넣기:

```
const SUPABASE_URL = "https://abcdefgh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIs...";
```

## 6단계: 배포하기

### Netlify (가장 쉬움)
1. netlify.com → 로그인
2. `toono-website.html` 파일을 드래그 앤 드롭
3. 완료 — URL이 생김 (예: `toono-xxx.netlify.app`)

### Vercel
1. vercel.com → 로그인
2. 파일 업로드 → 배포

### 직접 호스팅
아무 웹서버에 HTML 파일 하나 올리면 됩니다.

---

## 작동 방식

```
Supabase 연결됨:
  가입/로그인 → Supabase Auth (이메일/비밀번호)
  프로필 → Supabase profiles 테이블
  작품 업로드 → Supabase works 테이블
  주문 → Supabase orders 테이블
  채팅 → Supabase messages 테이블 (실시간)
  알림 → Supabase notifications 테이블 (실시간)
  
Supabase 미연결 (키 입력 전):
  모든 기능이 localStorage로 작동 (1인 데모 모드)
  데이터는 해당 브라우저에만 저장됨
```

## 비용

| 항목 | 무료 티어 | 충분한 규모 |
|------|----------|------------|
| 데이터베이스 | 500MB, 50,000행 | 사용자 수천 명 |
| 스토리지 | 1GB | 작품 이미지 수백 개 |
| 인증 | 50,000 MAU | 충분 |
| 실시간 | 200 동시접속 | 초기 운영에 충분 |
| 월 비용 | $0 | 유료 전환: $25/월~ |

## 보안

- **RLS (Row Level Security)** 활성화됨: 사용자는 자기 데이터만 수정 가능
- **anon key**는 공개해도 안전 (RLS가 보호)
- 비밀번호는 Supabase Auth가 bcrypt로 해시 처리
- SQL injection 불가 (Supabase 클라이언트가 파라미터화)
