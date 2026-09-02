# MSW Mock Backend 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** MSW(Mock Service Worker) v2를 도입하여 Supabase BaaS(Auth + PostgREST + Edge Function)의 모든 HTTP 호출을 가로채고, seed.sql 기반 mock 데이터로 프론트엔드 개발/데모 환경을 구축한다.

**Architecture:** Supabase JS SDK는 내부적으로 fetch를 사용하여 PostgREST(`/rest/v1/`), Auth(`/auth/v1/`), Functions(`/functions/v1/`) 엔드포인트로 HTTP 요청을 보낸다. MSW v2의 Service Worker가 이 요청들을 네트워크에 보내기 전에 가로채어 mock 응답을 반환한다. 코드 변경은 `main.tsx`에 MSW 워커 시작 코드를 추가하는 것뿐, 기존 API 계층(`src/**/api/*.ts`)은 전혀 수정하지 않는다.

**Tech Stack:** MSW v2, TypeScript, Vite, Supabase JS SDK v2

**Spec:** `docs/architecture-analysis.md` (프로젝트 아키텍처 분석), `supabase/seed.sql` (mock 데이터 원본)

## Global Constraints

- MSW는 `VITE_USE_MOCK=true` 환경변수가 설정된 경우에만 활성화된다.
- 기존 API 코드(`src/**/api/*.ts`, `src/shared/lib/supabaseClient.ts`, `src/shared/lib/aiConsult.ts`)는 수정하지 않는다.
- Mock 데이터는 `supabase/seed.sql`의 값을 그대로 사용한다.
- 모든 코드 주석은 한국어로 작성한다.
- 기존 코드 스타일(Prettier, ESLint 규칙)을 준수한다.
- MSW v2 API(`http.get/http.post/http.patch` + `HttpResponse`)를 사용한다.

## Supabase SDK HTTP 호출 패턴 (구현 기준)

### PostgREST (`/rest/v1/{table}`)

| SDK 메서드                | HTTP  | URL 패턴                                                     | 헤더                                   |
| ------------------------- | ----- | ------------------------------------------------------------ | -------------------------------------- |
| `.select()`               | GET   | `/rest/v1/{table}?select=...&{col}=eq.{val}&order={col}.asc` | `Accept: application/json` (배열 응답) |
| `.select().single()`      | GET   | 동일 + `Accept: application/vnd.pgrst.object+json`           | 단일 객체 응답, 0행 시 406             |
| `.select().maybeSingle()` | GET   | 동일 + `Accept: application/vnd.pgrst.object+json`           | 단일 객체 또는 null, 0행 시 200 null   |
| `.insert()`               | POST  | `/rest/v1/{table}?select=...`                                | `Prefer: return=representation`        |
| `.upsert()`               | POST  | `/rest/v1/{table}`                                           | `Prefer: resolution=merge-duplicates`  |
| `.update()`               | PATCH | `/rest/v1/{table}?{col}=eq.{val}`                            | `Content-Type: application/json`       |

### Auth (`/auth/v1/{endpoint}`)

| SDK 메서드             | HTTP                            | URL                                       |
| ---------------------- | ------------------------------- | ----------------------------------------- |
| `getSession()`         | (로컬 스토리지 읽기, HTTP 없음) | -                                         |
| `getUser()`            | GET                             | `/auth/v1/user`                           |
| `signInWithPassword()` | POST                            | `/auth/v1/token?grant_type=password`      |
| `signUp()`             | POST                            | `/auth/v1/signup`                         |
| `signOut()`            | POST                            | `/auth/v1/logout`                         |
| `onAuthStateChange()`  | (클라이언트 이벤트, HTTP 없음)  | -                                         |
| 토큰 갱신              | POST                            | `/auth/v1/token?grant_type=refresh_token` |

### Edge Functions (`/functions/v1/{name}`)

| SDK 메서드                       | HTTP | URL                        |
| -------------------------------- | ---- | -------------------------- |
| `functions.invoke('ai-consult')` | POST | `/functions/v1/ai-consult` |

---

## 파일 구조

```
src/mocks/
├── browser.ts              # MSW 워커 초기화 (setupWorker)
├── db.ts                   # 인메모리 mock DB (seed.sql 기반 모든 테이블)
├── utils.ts                # PostgREST 쿼리 파라미터 파싱·필터링·정렬 유틸
├── handlers/
│   ├── index.ts            # 모든 핸들러 통합 export
│   ├── auth.ts             # /auth/v1/* 엔드포인트
│   ├── plans.ts            # plans, current_plans, users 테이블
│   ├── usage.ts            # usage_monthly 테이블
│   ├── reward.ts           # attendances, attendance_streaks, user_badges, game_results, coupons, products, exchanges
│   ├── consult-report.ts   # consultation_reports, report_recommendations
│   ├── subscription.ts     # subscription_applications, subscription_status_logs, terms_consents
│   └── ai-consult.ts       # Edge Function ai-consult
public/
└── mockServiceWorker.js    # MSW Service Worker (npx msw init으로 생성)
```

**각 파일의 책임:**

- `db.ts`: 모든 테이블의 mock 데이터를 메모리에 보관. 상태 변경(insert/update/upsert)도 여기에 반영.
- `utils.ts`: URL search params에서 PostgREST 필터(`eq`, `gte`, `lte`, `lt`, `gt`, `not`, `in`)와 `order`, `select`를 파싱. mock 데이터에 필터를 적용하고 정렬.
- `handlers/*.ts`: HTTP 메서드 + URL 패턴으로 요청을 매칭하고, `db.ts` + `utils.ts`를 사용해 응답.

---

## Task 1: MSW 패키지 설치 및 Service Worker 생성

**Files:**

- Create: `public/mockServiceWorker.js` (자동 생성)
- Modify: `package.json` (dependency 추가)

**Interfaces:**

- Produces: `msw` 패키지, `public/mockServiceWorker.js` 파일

- [ ] **Step 1: msw 패키지 설치**

```bash
npm install msw --save-dev
```

- [ ] **Step 2: Service Worker 파일 생성**

```bash
npx msw init public/ --save
```

이 명령은 `public/mockServiceWorker.js` 파일을 생성하고 `package.json`에 `msw.workerDirectory` 필드를 추가한다.

- [ ] **Step 3: .env.example에 VITE_USE_MOCK 추가**

`.env.example` 파일 끝에 추가:

```env
# ───────────────────────────────────────────
# MSW Mock Backend
# ───────────────────────────────────────────
# true로 설정하면 MSW가 Supabase API 호출을 가로채어 mock 데이터로 응답합니다.
# .env.local에 VITE_USE_MOCK=true를 추가해서 사용하세요.
VITE_USE_MOCK=false
```

- [ ] **Step 4: 커밋**

```bash
git add package.json package-lock.json public/mockServiceWorker.js .env.example
git commit -m "chore: MSW 패키지 설치 및 Service Worker 생성"
```

---

## Task 2: 인메모리 Mock DB 생성

**Files:**

- Create: `src/mocks/db.ts`

**Interfaces:**

- Produces: `mockDb` 객체 — 모든 테이블의 배열 데이터를 보관. handlers가 읽고 쓴다.

**참고 파일 (데이터 원본):**

- `supabase/seed.sql` — 모든 mock 데이터의 원본
- `src/entities/plan/model/plan.ts` — PlanRow 타입
- `src/entities/reward/model/reward.ts` — CouponRow 타입

- [ ] **Step 1: db.ts 작성**

`supabase/seed.sql`의 데이터를 TypeScript 객체로 변환. 주요 테이블:

```typescript
// src/mocks/db.ts
import type { PlanRow } from '@/entities/plan/model/plan';

// mock 세션 상태 (auth 핸들러가 관리)
export let mockSession: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: {
    id: string;
    aud: string;
    role: string;
    email: string;
    app_metadata: Record<string, unknown>;
    user_metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
  };
} | null = null;

export function setMockSession(session: typeof mockSession) {
  mockSession = session;
}

export function clearMockSession() {
  mockSession = null;
}

// mock 사용자 ID (로그인 시 이 값으로 고정)
export const MOCK_USER_ID = '11111111-1111-1111-1111-111111111111';
export const MOCK_USER_EMAIL = 'user1@example.com';
export const MOCK_USER_PASSWORD = 'password';

// plans 테이블 (seed.sql의 40개 요금제)
export const plans: PlanRow[] = [
  {
    id: 1,
    name: '데이터플랜300MB',
    carrier: 'LG U+',
    category: '통합요금제',
    target_age: '일반',
    data_tier: '소용량',
    monthly_fee: 28000,
    data: '300MB',
    data_amount_gb: 0.29296875,
    data_speed_after: '400Kbps',
    voice: '125분',
    call_amount_min: 125,
    message: '150건',
    sms_amount: 150,
    share_data: '월제공량 내 차감',
    tethering: '월제공량 300MB 초과 시 차단',
    notes: '데이터 소진 후 400Kbps로 무제한 이용 가능',
    benefits: [],
    ott_benefits: [],
    add_ons: [],
    contract_period_months: null,
    is_active: true,
    sort_order: 1,
  },
  // ... 나머지 39개 요금제 (seed.sql에서 변환)
];

// users 테이블
export const users = [
  {
    id: MOCK_USER_ID,
    email: MOCK_USER_EMAIL,
    phone: '010-1111-1111',
    nickname: 'UserOne',
    age_group: '일반',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'user2@example.com',
    phone: '010-2222-2222',
    nickname: 'UserTwo',
    age_group: '청년',
  },
];

// current_plans 테이블
export const currentPlans = [
  { user_id: MOCK_USER_ID, plan_id: 1, started_at: '2025-01-15' },
  {
    user_id: '22222222-2222-2222-2222-222222222222',
    plan_id: 5,
    started_at: '2024-11-01',
  },
];

// usage_monthly 테이블
export const usageMonthly = [
  {
    id: 'u1',
    user_id: MOCK_USER_ID,
    year_month: '2025-03',
    data_used_gb: 3.5,
    call_used_min: 120,
    sms_used_count: 30,
    created_at: '2025-03-01',
    updated_at: '2025-03-01',
  },
  {
    id: 'u2',
    user_id: MOCK_USER_ID,
    year_month: '2025-04',
    data_used_gb: 4.2,
    call_used_min: 150,
    sms_used_count: 45,
    created_at: '2025-04-01',
    updated_at: '2025-04-01',
  },
  {
    id: 'u3',
    user_id: MOCK_USER_ID,
    year_month: '2025-05',
    data_used_gb: 5.1,
    call_used_min: 110,
    sms_used_count: 25,
    created_at: '2025-05-01',
    updated_at: '2025-05-01',
  },
  {
    id: 'u4',
    user_id: MOCK_USER_ID,
    year_month: '2025-06',
    data_used_gb: 4.8,
    call_used_min: 130,
    sms_used_count: 35,
    created_at: '2025-06-01',
    updated_at: '2025-06-01',
  },
  {
    id: 'u5',
    user_id: MOCK_USER_ID,
    year_month: '2025-07',
    data_used_gb: 5.5,
    call_used_min: 140,
    sms_used_count: 40,
    created_at: '2025-07-01',
    updated_at: '2025-07-01',
  },
  {
    id: 'u6',
    user_id: MOCK_USER_ID,
    year_month: '2025-08',
    data_used_gb: 4.9,
    call_used_min: 125,
    sms_used_count: 32,
    created_at: '2025-08-01',
    updated_at: '2025-08-01',
  },
];

// attendances 테이블
export const attendances = [
  {
    id: 'a1',
    user_id: MOCK_USER_ID,
    date: '2025-08-19',
    reward_type: 'badge',
    reward_value: 1,
  },
  {
    id: 'a2',
    user_id: MOCK_USER_ID,
    date: '2025-08-20',
    reward_type: 'badge',
    reward_value: 1,
  },
  {
    id: 'a3',
    user_id: MOCK_USER_ID,
    date: '2025-08-21',
    reward_type: 'badge',
    reward_value: 1,
  },
];

// attendance_streaks 테이블
export const attendanceStreaks = [
  {
    user_id: MOCK_USER_ID,
    current_streak: 3,
    longest_streak: 3,
    last_attended_at: '2025-08-21',
  },
];

// badges 테이블
export const badges = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    name: '첫 출석',
    description: '첫 출석 보상',
    type: 'attendance',
  },
  {
    id: 'b2222222-2222-2222-2222-222222222222',
    name: '첫 상담',
    description: '첫 AI 상담 완료',
    type: 'consultation',
  },
  {
    id: 'b3333333-3333-3333-3333-333333333333',
    name: '첫 교환',
    description: '첫 쿠폰 교환',
    type: 'exchange',
  },
];

// user_badges 테이블
export const userBadges = [
  {
    user_id: MOCK_USER_ID,
    badge_id: 'b1111111-1111-1111-1111-111111111111',
    balance: 3,
    total_earned: 3,
    updated_at: '2025-08-21',
  },
  {
    user_id: MOCK_USER_ID,
    badge_id: 'b2222222-2222-2222-2222-222222222222',
    balance: 1,
    total_earned: 1,
    updated_at: '2025-08-21',
  },
  {
    user_id: MOCK_USER_ID,
    badge_id: 'b3333333-3333-3333-3333-333333333333',
    balance: 0,
    total_earned: 0,
    updated_at: '2025-08-21',
  },
];

// 게임 보상 배지 ID (getGameResult.ts 참고)
export const GAME_REWARD_BADGE_ID = '8f2a1c10-6c9d-4e0d-9f2f-9c4e9db6f201';
export const ATTENDANCE_REWARD_BADGE_ID =
  '1498c68c-7d17-4c8e-9217-e22c5c1298bd';

// games 테이블
export const games = [
  {
    id: 'g1111111-1111-1111-1111-111111111111',
    type: 'quiz',
    name: '요금제 퀴즈',
  },
  {
    id: 'g2222222-2222-2222-2222-222222222222',
    type: 'roulette',
    name: '룰렛 이벤트',
  },
];

// game_results 테이블
export const gameResults = [
  {
    id: 'gr1',
    user_id: MOCK_USER_ID,
    game_id: 'g1111111-1111-1111-1111-111111111111',
    score: 100,
    played_at: new Date().toISOString(),
  },
];

// products 테이블
export const products = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    name: '스타벅스 아메리카노',
    description: '스타벅스 아메리카노 기프티콘',
    required_badges: 3,
    stock: 100,
    is_active: true,
    image: null,
  },
  {
    id: 'p2222222-2222-2222-2222-222222222222',
    name: '베스킨라빈스 싱글레귤러',
    description: '베스킨라빈스 싱글레귤러 쿠폰',
    required_badges: 5,
    stock: 50,
    is_active: true,
    image: null,
  },
];

// exchanges 테이블
export const exchanges: Array<{
  id: string;
  user_id: string;
  product_id: string;
  used_badges: number;
}> = [
  {
    id: 'e1111111-1111-1111-1111-111111111111',
    user_id: MOCK_USER_ID,
    product_id: 'p1111111-1111-1111-1111-111111111111',
    used_badges: 3,
  },
];

// coupons 테이블
export const coupons: Array<Record<string, unknown>> = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    exchange_id: 'e1111111-1111-1111-1111-111111111111',
    user_id: MOCK_USER_ID,
    product_id: 'p1111111-1111-1111-1111-111111111111',
    barcode: '1234567890',
    encrypted_code: 'enc_1234567890',
    status: 'used',
    used_at: '2025-08-21',
    expired_at: '2026-08-21',
    created_at: '2025-08-21',
    updated_at: '2025-08-21',
  },
];

// consultation_reports 테이블
export const consultationReports: Array<Record<string, unknown>> = [
  {
    id: 'r1111111-1111-1111-1111-111111111111',
    user_id: MOCK_USER_ID,
    summary_title: '요금제 추천 결과',
    summary: '현재 요금제보다 월 9,000원 절약 가능한 옵션을 찾았습니다.',
    analysis_input: {
      usageType: '일반',
      currentPlan: '데이터플랜300MB',
      recommendedPlans: ['데이터플랜750MB', '데이터플랜5GB'],
      monthlySavingAmount: 9000,
      recommendationReason: '데이터 5GB로 월 9,000원 절약',
      importantConditions: ['데이터 증량', '월 정액 절감'],
      qaPairs: [],
    },
    current_plan_id: 1,
    total_savings: 9000,
    created_at: '2025-08-15',
    updated_at: '2025-08-15',
  },
];

// report_recommendations 테이블
export const reportRecommendations = [
  {
    report_id: 'r1111111-1111-1111-1111-111111111111',
    plan_id: 2,
    reason: '데이터 5GB로 월 9,000원 절약',
    savings: 9000,
    sort_order: 1,
  },
  {
    report_id: 'r1111111-1111-1111-1111-111111111111',
    plan_id: 4,
    reason: '데이터 여유롭고 혜택 풍부',
    savings: 3000,
    sort_order: 2,
  },
];

// subscription_applications 테이블
export const subscriptionApplications: Array<Record<string, unknown>> = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    user_id: MOCK_USER_ID,
    target_plan_id: 2,
    current_plan_id: 1,
    status: 'completed',
    identity_verified: false,
    terms_agreed_at: '2025-08-18',
    requested_at: '2025-08-18',
  },
];

// subscription_status_logs 테이블
export const subscriptionStatusLogs: Array<Record<string, unknown>> = [
  {
    id: 'sl1',
    application_id: 'a1111111-1111-1111-1111-111111111111',
    status: 'submitted',
    changed_at: '2025-08-18',
    note: '신청 접수',
  },
  {
    id: 'sl2',
    application_id: 'a1111111-1111-1111-1111-111111111111',
    status: 'in_review',
    changed_at: '2025-08-19',
    note: '서류 검토 중',
  },
  {
    id: 'sl3',
    application_id: 'a1111111-1111-1111-1111-111111111111',
    status: 'completed',
    changed_at: '2025-08-20',
    note: '가입 완료',
  },
];

// terms_consents 테이블
export const termsConsents: Array<Record<string, unknown>> = [
  {
    id: 'tc1',
    user_id: MOCK_USER_ID,
    application_id: 'a1111111-1111-1111-1111-111111111111',
    term_type: 'privacy',
    version: 'v1.0',
    agreed_at: '2025-08-18',
    ip: '127.0.0.1',
  },
  {
    id: 'tc2',
    user_id: MOCK_USER_ID,
    application_id: 'a1111111-1111-1111-1111-111111111111',
    term_type: 'service',
    version: 'v1.0',
    agreed_at: '2025-08-18',
    ip: '127.0.0.1',
  },
];
```

> **주의**: plans 배열의 나머지 39개 요금제는 `supabase/seed.sql`의 INSERT 문을 TypeScript 객체로 변환하여 채운다. 모든 필드값은 seed.sql과 정확히 일치해야 한다.

- [ ] **Step 2: 커밋**

```bash
git add src/mocks/db.ts
git commit -m "feat: 인메모리 mock DB 추가 (seed.sql 기반)"
```

---

## Task 3: PostgREST 유틸리티 함수

**Files:**

- Create: `src/mocks/utils.ts`

**Interfaces:**

- Produces: `parseFilters`, `applyFilters`, `applyOrder`, `isSingleRequest`, `transformSelect` 함수

- [ ] **Step 1: utils.ts 작성**

```typescript
// src/mocks/utils.ts
import { HttpResponse } from 'msw';

// PostgREST 쿼리 파라미터에서 필터 조건을 파싱
// 예: user_id=eq.11111111&year_month=eq.2025-08&is_active=eq.true
export type FilterCondition = {
  column: string;
  operator: string; // eq, neq, gt, gte, lt, lte, in, is, not
  value: string;
};

export function parseFilters(url: URL): FilterCondition[] {
  const filters: FilterCondition[] = [];
  url.searchParams.forEach((value, key) => {
    // order, select, offset, limit은 필터가 아님
    if (['order', 'select', 'offset', 'limit', 'and', 'or'].includes(key))
      return;
    // key 형태: "column=operator" 이지만 URL searchParams에서는 "column" = "operator.value"
    // Supabase SDK는 ?column=eq.value 형태로 보냄
    const match = value.match(
      /^(eq|neq|gt|gte|lt|lte|in|is|not\.eq|not\.gt|not\.gte|not\.lt|not\.lte|not\.in|not\.is)\.(.+)$/,
    );
    if (match) {
      filters.push({ column: key, operator: match[1], value: match[2] });
    }
  });
  return filters;
}

// 필터 조건에 따라 데이터 필터링
export function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: FilterCondition[],
): T[] {
  return data.filter((row) =>
    filters.every((filter) => {
      const colValue = row[filter.column];
      const filterValue = filter.value;

      switch (filter.operator) {
        case 'eq':
          // boolean 문자열 처리
          if (filterValue === 'true')
            return colValue === true || colValue === 'true';
          if (filterValue === 'false')
            return colValue === false || colValue === 'false';
          return String(colValue) === filterValue;
        case 'neq':
          return String(colValue) !== filterValue;
        case 'gt':
          return Number(colValue) > Number(filterValue);
        case 'gte':
          return Number(colValue) >= Number(filterValue);
        case 'lt':
          return Number(colValue) < Number(filterValue);
        case 'lte':
          return Number(colValue) <= Number(filterValue);
        case 'in':
          return filterValue.split(',').includes(String(colValue));
        case 'is':
          if (filterValue === 'null') return colValue == null;
          if (filterValue === 'not.null') return colValue != null;
          return false;
        case 'not.eq':
          return String(colValue) !== filterValue;
        case 'not.is':
          if (filterValue === 'null') return colValue != null;
          return false;
        default:
          return true;
      }
    }),
  );
}

// order 파라미터 파싱 및 정렬 적용
// 예: order=sort_order.asc,created_at.desc
export function applyOrder<T extends Record<string, unknown>>(
  data: T[],
  orderParam: string | null,
): T[] {
  if (!orderParam) return data;

  const orders = orderParam.split(',').map((o) => {
    const [column, direction] = o.split('.');
    return { column, ascending: direction !== 'desc' };
  });

  return [...data].sort((a, b) => {
    for (const { column, ascending } of orders) {
      const aVal = a[column];
      const bVal = b[column];
      if (aVal === bVal) continue;
      const comparison = aVal < bVal ? -1 : 1;
      return ascending ? comparison : -comparison;
    }
    return 0;
  });
}

// Accept 헤더로 single/maybeSingle 요청인지 확인
export function isObjectRequest(request: Request): boolean {
  const accept = request.headers.get('Accept') ?? '';
  return accept.includes('application/vnd.pgrst.object+json');
}

// PostgREST 응답 생성 — single/maybeSingle 여부에 따라 배열 또는 단일 객체 반환
export function postgrestResponse<T>(
  data: T[],
  request: Request,
  isMaybeSingle = false,
): Response {
  if (isObjectRequest(request)) {
    if (data.length === 0) {
      // maybeSingle: 200 with null, single: 406
      if (isMaybeSingle) {
        return HttpResponse.json(null, { status: 200 });
      }
      return new HttpResponse(null, { status: 406 });
    }
    return HttpResponse.json(data[0]);
  }
  return HttpResponse.json(data);
}

// select 파라미터에서 조인된 테이블 이름 추출
// 예: "plan_id, plans(*)" → ["plans"]
export function extractJoinTables(selectParam: string | null): string[] {
  if (!selectParam) return [];
  const joins: string[] = [];
  // 패턴: tablename(*) 또는 tablename(columns)
  const regex = /(\w+)\([^)]*\)/g;
  let match;
  while ((match = regex.exec(selectParam)) !== null) {
    joins.push(match[1]);
  }
  return joins;
}

// select 파라미터에서 최상위 컬럼 목록 추출
// 예: "plan_id, plans(*)" → ["plan_id"]
export function extractTopColumns(selectParam: string | null): string[] {
  if (!selectParam) return [];
  // 조인 부분을 제거하고 최상위 컬럼만 추출
  const cleaned = selectParam.replace(/\w+\([^)]*\)/g, '');
  return cleaned
    .split(',')
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}
```

- [ ] **Step 2: 커밋**

```bash
git add src/mocks/utils.ts
git commit -m "feat: PostgREST 쿼리 파싱 유틸리티 추가"
```

---

## Task 4: Auth 핸들러

**Files:**

- Create: `src/mocks/handlers/auth.ts`

**참고 파일:**

- `src/entities/user/model/AuthProvider.tsx` — getSession, onAuthStateChange 사용
- `src/features/auth/api/postSignin.ts` — signInWithPassword
- `src/features/auth/api/postSignup.ts` — signUp
- `src/features/auth/api/postLogout.ts` — signOut
- `src/entities/plan/api/getCurrentPlan.ts` — getUser (여러 API에서 사용)

**핵심:** Supabase SDK는 `signInWithPassword` 응답으로 session 객체를 받으면 내부적으로 저장하고 `onAuthStateChange`를 트리거한다. `getSession()`은 로컬 스토리지를 읽으므로 HTTP 요청이 없다. `getUser()`는 HTTP GET 요청을 보낸다.

- [ ] **Step 1: auth.ts 작성**

```typescript
// src/mocks/handlers/auth.ts
import { http, HttpResponse } from 'msw';

import {
  MOCK_USER_ID,
  MOCK_USER_EMAIL,
  MOCK_USER_PASSWORD,
  mockSession,
  setMockSession,
  clearMockSession,
} from '../db';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// mock 세션 객체 생성
function createMockSession(userId: string, email: string) {
  const now = Date.now();
  return {
    access_token: `mock-access-token-${now}`,
    refresh_token: `mock-refresh-token-${now}`,
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: userId,
      aud: 'authenticated',
      role: 'authenticated',
      email,
      app_metadata: {},
      user_metadata: {
        name: 'UserOne',
        phone: '010-1111-1111',
        age_group: '일반',
      },
      created_at: new Date(now - 86400000).toISOString(),
      updated_at: new Date(now).toISOString(),
    },
  };
}

export const authHandlers = [
  // signInWithPassword — POST /auth/v1/token?grant_type=password
  http.post(`${SUPABASE_URL}/auth/v1/token`, async ({ request }) => {
    const url = new URL(request.url);
    const grantType = url.searchParams.get('grant_type');

    if (grantType === 'password') {
      const body = (await request.json()) as {
        email: string;
        password: string;
      };
      if (
        body.email === MOCK_USER_EMAIL &&
        body.password === MOCK_USER_PASSWORD
      ) {
        const session = createMockSession(MOCK_USER_ID, MOCK_USER_EMAIL);
        setMockSession(session);
        return HttpResponse.json(session);
      }
      return HttpResponse.json(
        {
          error: 'invalid_credentials',
          error_description: 'Invalid login credentials',
        },
        { status: 400 },
      );
    }

    // 토큰 갱신 — grant_type=refresh_token
    if (grantType === 'refresh_token') {
      if (mockSession) {
        const session = createMockSession(
          mockSession.user.id,
          mockSession.user.email,
        );
        setMockSession(session);
        return HttpResponse.json(session);
      }
      return HttpResponse.json(
        { error: 'invalid_grant', error_description: 'Invalid refresh token' },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      { error: 'unsupported_grant_type' },
      { status: 400 },
    );
  }),

  // signUp — POST /auth/v1/signup
  http.post(`${SUPABASE_URL}/auth/v1/signup`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      data?: Record<string, unknown>;
    };

    // 이미 존재하는 이메일이면 에러
    if (body.email === MOCK_USER_EMAIL) {
      return HttpResponse.json(
        {
          error: 'user_already_exists',
          error_description: 'User already registered',
        },
        { status: 400 },
      );
    }

    // 새 사용자 가입 — 세션 없이 반환 (email confirmation 필요 없이)
    const newUserId = crypto.randomUUID();
    const session = createMockSession(newUserId, body.email);
    session.user.user_metadata = body.data ?? {};
    setMockSession(session);

    return HttpResponse.json({
      id: newUserId,
      aud: 'authenticated',
      role: 'authenticated',
      email: body.email,
      app_metadata: {},
      user_metadata: body.data ?? {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }),

  // getUser — GET /auth/v1/user
  http.get(`${SUPABASE_URL}/auth/v1/user`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !mockSession) {
      return HttpResponse.json(
        { error: 'auth_session_missing' },
        { status: 401 },
      );
    }
    return HttpResponse.json(mockSession.user);
  }),

  // signOut — POST /auth/v1/logout
  http.post(`${SUPABASE_URL}/auth/v1/logout`, () => {
    clearMockSession();
    return HttpResponse.json({}, { status: 200 });
  }),
];
```

- [ ] **Step 2: 커밋**

```bash
git add src/mocks/handlers/auth.ts
git commit -m "feat: Auth mock 핸들러 추가"
```

---

## Task 5: Plans 핸들러 (plans, current_plans, users)

**Files:**

- Create: `src/mocks/handlers/plans.ts`

**참고 파일:**

- `src/entities/plan/api/getPlanCatalog.ts` — `supabaseAnon.from('plans').select('*').eq('is_active', true).order('sort_order', { ascending: true })`
- `src/features/plan-detail/api/getPlans.ts` — `supabaseAnon.from('plans').select('*').eq('is_active', true).order('sort_order', { ascending: true })`
- `src/entities/plan/api/getCurrentPlan.ts` — `supabase.from('current_plans').select('plan_id, plans(*)').maybeSingle()`
- `src/entities/plan/api/postChangePlan.ts` — `supabase.from('users').select('id').eq('id', userId).maybeSingle()` + `supabase.from('users').upsert(...)` + `supabase.from('current_plans').upsert(...)`
- `src/features/consult-report/api/getReport.ts` — `supabaseAnon.from('plans').select('*').in('id', ids)` 또는 `.in('name', names)`
- `src/features/consult-report/api/saveReport.ts` — `supabaseAnon.from('plans').select('id, name').in('name', missingNames)`

- [ ] **Step 1: plans.ts 작성**

```typescript
// src/mocks/handlers/plans.ts
import { http, HttpResponse } from 'msw';

import { plans, currentPlans, users, mockSession } from '../db';
import {
  parseFilters,
  applyFilters,
  applyOrder,
  postgrestResponse,
  extractJoinTables,
} from '../utils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const plansHandlers = [
  // plans 테이블 — GET (getPlanCatalog, getPlans, getReport에서 사용)
  http.get(`${SUPABASE_URL}/rest/v1/plans`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');

    let result = applyFilters(
      plans as unknown as Record<string, unknown>[],
      filters,
    );
    result = applyOrder(result, orderParam);

    return postgrestResponse(result, request);
  }),

  // plans 테이블 — POST (일반적으로 사용하지 않지만 방어용)
  http.post(`${SUPABASE_URL}/rest/v1/plans`, () => {
    return HttpResponse.json([], { status: 201 });
  }),

  // current_plans 테이블 — GET (getCurrentPlan에서 사용)
  // select='plan_id, plans(*)' — 조인 쿼리
  http.get(`${SUPABASE_URL}/rest/v1/current_plans`, ({ request }) => {
    const url = new URL(request.url);
    const selectParam = url.searchParams.get('select') ?? '';
    const joinTables = extractJoinTables(selectParam);

    // RLS: 로그인한 사용자의 current_plan만 반환
    const userId = mockSession?.user.id;
    if (!userId) {
      return postgrestResponse([], request, true);
    }

    let result = currentPlans.filter((cp) => cp.user_id === userId);

    // plans 조인 처리 — plans(*)가 포함된 경우
    if (joinTables.includes('plans')) {
      result = result.map((cp) => ({
        ...cp,
        plans: plans.find((p) => p.id === cp.plan_id) ?? null,
      }));
    }

    return postgrestResponse(
      result as unknown as Record<string, unknown>[],
      request,
      true,
    );
  }),

  // current_plans 테이블 — POST (upsert, postChangePlan에서 사용)
  http.post(`${SUPABASE_URL}/rest/v1/current_plans`, async ({ request }) => {
    const body = (await request.json()) as {
      user_id: string;
      plan_id: number;
      started_at: string;
    };
    const prefer = request.headers.get('Prefer') ?? '';

    if (prefer.includes('merge-duplicates')) {
      // upsert — 기존 row가 있으면 업데이트, 없으면 삽입
      const idx = currentPlans.findIndex((cp) => cp.user_id === body.user_id);
      if (idx >= 0) {
        currentPlans[idx] = { ...currentPlans[idx], ...body };
      } else {
        currentPlans.push(body);
      }
    } else {
      currentPlans.push(body);
    }

    return HttpResponse.json(body, { status: 201 });
  }),

  // users 테이블 — GET (ensureUserProfile에서 select id만 조회)
  http.get(`${SUPABASE_URL}/rest/v1/users`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const result = applyFilters(
      users as unknown as Record<string, unknown>[],
      filters,
    );
    return postgrestResponse(result, request, true);
  }),

  // users 테이블 — POST (upsert, ensureUserProfile에서 사용)
  http.post(`${SUPABASE_URL}/rest/v1/users`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const prefer = request.headers.get('Prefer') ?? '';

    if (prefer.includes('merge-duplicates')) {
      const idx = users.findIndex((u) => u.id === body.id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...body };
      } else {
        users.push(body as (typeof users)[0]);
      }
    } else {
      users.push(body as (typeof users)[0]);
    }

    return HttpResponse.json(body, { status: 201 });
  }),
];
```

- [ ] **Step 2: 커밋**

```bash
git add src/mocks/handlers/plans.ts
git commit -m "feat: Plans/current_plans/users mock 핸들러 추가"
```

---

## Task 6: Usage 핸들러 (usage_monthly)

**Files:**

- Create: `src/mocks/handlers/usage.ts`

**참고 파일:**

- `src/entities/usage/api/getUsage.ts` — `.select('*').eq('user_id', userId).eq('year_month', currentYearMonth).order('year_month', { ascending: false })`
- `src/entities/usage/api/getUsageTrend.ts` — `.select('*').eq('user_id', userId).lt('year_month', currentYearMonth).order('year_month', { ascending: true })`
- `src/entities/usage/api/postUsageMonthly.ts` — `.select('id').eq('user_id', userId).eq('year_month', yearMonth).maybeSingle()` + `.insert({...})`

- [ ] **Step 1: usage.ts 작성**

```typescript
// src/mocks/handlers/usage.ts
import { http, HttpResponse } from 'msw';

import { usageMonthly, mockSession } from '../db';
import {
  parseFilters,
  applyFilters,
  applyOrder,
  postgrestResponse,
} from '../utils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const usageHandlers = [
  // usage_monthly — GET (getUsage, getUsageTrend에서 사용)
  http.get(`${SUPABASE_URL}/rest/v1/usage_monthly`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');

    let result = applyFilters(
      usageMonthly as unknown as Record<string, unknown>[],
      filters,
    );
    result = applyOrder(result, orderParam);

    return postgrestResponse(result, request);
  }),

  // usage_monthly — POST (insert, ensureCurrentMonthUsage에서 사용)
  http.post(`${SUPABASE_URL}/rest/v1/usage_monthly`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newRow = {
      id: crypto.randomUUID(),
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    usageMonthly.push(newRow as (typeof usageMonthly)[0]);
    return HttpResponse.json(newRow, { status: 201 });
  }),
];
```

- [ ] **Step 2: 커밋**

```bash
git add src/mocks/handlers/usage.ts
git commit -m "feat: Usage monthly mock 핸들러 추가"
```

---

## Task 7: Reward 핸들러 (attendances, attendance_streaks, user_badges, game_results, coupons, products, exchanges)

**Files:**

- Create: `src/mocks/handlers/reward.ts`

**참고 파일:**

- `src/features/reward/api/getAttendance.ts` — attendances select + attendance_streaks select(maybeSingle)
- `src/features/reward/api/postCheckIn.ts` — attendances insert + attendance_streaks upsert + addBadgeBalance
- `src/features/reward/api/getBadge.ts` — user_badges select + user_badges select(maybeSingle) + user_badges upsert
- `src/features/reward/api/getGameResult.ts` — game_results select + game_results insert + addBadgeBalance
- `src/features/reward/api/getMyCoupons.ts` — coupons select with products join
- `src/features/reward/api/getExpiringCoupons.ts` — coupons select with products join + 날짜 필터
- `src/features/reward/api/getProducts.ts` — products select
- `src/features/reward/api/postExchange.ts` — user_badges select + update + exchanges insert + coupons insert

- [ ] **Step 1: reward.ts 작성**

```typescript
// src/mocks/handlers/reward.ts
import { http, HttpResponse } from 'msw';

import {
  attendances,
  attendanceStreaks,
  userBadges,
  gameResults,
  coupons,
  products,
  exchanges,
  mockSession,
  GAME_REWARD_BADGE_ID,
  ATTENDANCE_REWARD_BADGE_ID,
} from '../db';
import {
  parseFilters,
  applyFilters,
  applyOrder,
  postgrestResponse,
  extractJoinTables,
} from '../utils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// 배지 잔액 증가 (addBadgeBalance 로직 재현)
function addBadgeBalance(userId: string, badgeId: string, amount: number) {
  if (amount <= 0) return;
  const existing = userBadges.find(
    (ub) => ub.user_id === userId && ub.badge_id === badgeId,
  );
  if (existing) {
    existing.balance += amount;
    existing.total_earned += amount;
    existing.updated_at = new Date().toISOString();
  } else {
    userBadges.push({
      user_id: userId,
      badge_id: badgeId,
      balance: amount,
      total_earned: amount,
      updated_at: new Date().toISOString(),
    });
  }
}

export const rewardHandlers = [
  // === attendances ===
  // GET (getAttendances에서 사용)
  http.get(`${SUPABASE_URL}/rest/v1/attendances`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');
    let result = applyFilters(
      attendances as unknown as Record<string, unknown>[],
      filters,
    );
    result = applyOrder(result, orderParam);
    return postgrestResponse(result, request);
  }),

  // POST (postCheckIn에서 insert + select)
  http.post(`${SUPABASE_URL}/rest/v1/attendances`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const userId = body.user_id as string;
    const today = body.date as string;

    // 중복 출석 체크 (23505 unique violation 재현)
    const existing = attendances.find(
      (a) => a.user_id === userId && a.date === today,
    );
    if (existing) {
      return HttpResponse.json(
        {
          code: '23505',
          message: 'duplicate key value violates unique constraint',
        },
        { status: 409 },
      );
    }

    const newRow = { id: crypto.randomUUID(), ...body };
    attendances.push(newRow as (typeof attendances)[0]);

    // select('reward_value').single() 응답
    return HttpResponse.json(
      { reward_value: body.reward_value },
      { status: 201 },
    );
  }),

  // === attendance_streaks ===
  // GET (getAttendanceStreak에서 maybeSingle 사용)
  http.get(`${SUPABASE_URL}/rest/v1/attendance_streaks`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const result = applyFilters(
      attendanceStreaks as unknown as Record<string, unknown>[],
      filters,
    );
    return postgrestResponse(result, request, true);
  }),

  // POST (postCheckIn에서 upsert 사용)
  http.post(
    `${SUPABASE_URL}/rest/v1/attendance_streaks`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      const prefer = request.headers.get('Prefer') ?? '';
      const userId = body.user_id as string;

      if (prefer.includes('merge-duplicates')) {
        const idx = attendanceStreaks.findIndex((s) => s.user_id === userId);
        if (idx >= 0) {
          attendanceStreaks[idx] = { ...attendanceStreaks[idx], ...body };
        } else {
          attendanceStreaks.push(body as (typeof attendanceStreaks)[0]);
        }
      }

      return HttpResponse.json(body, { status: 201 });
    },
  ),

  // === user_badges ===
  // GET (getBadgeBalance, addBadgeBalance, postExchange에서 사용)
  http.get(`${SUPABASE_URL}/rest/v1/user_badges`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');
    let result = applyFilters(
      userBadges as unknown as Record<string, unknown>[],
      filters,
    );
    result = applyOrder(result, orderParam);
    return postgrestResponse(result, request, true);
  }),

  // POST (addBadgeBalance에서 upsert 사용)
  http.post(`${SUPABASE_URL}/rest/v1/user_badges`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const prefer = request.headers.get('Prefer') ?? '';
    const userId = body.user_id as string;
    const badgeId = body.badge_id as string;

    if (prefer.includes('merge-duplicates')) {
      const idx = userBadges.findIndex(
        (ub) => ub.user_id === userId && ub.badge_id === badgeId,
      );
      if (idx >= 0) {
        userBadges[idx] = { ...userBadges[idx], ...body };
      } else {
        userBadges.push(body as (typeof userBadges)[0]);
      }
    }

    return HttpResponse.json(body, { status: 201 });
  }),

  // PATCH (postExchange에서 balance 차감에 사용)
  http.patch(`${SUPABASE_URL}/rest/v1/user_badges`, async ({ request }) => {
    const url = new URL(request.url);
    const body = (await request.json()) as Record<string, unknown>;
    const filters = parseFilters(url);

    // 필터에 맞는 row 업데이트
    userBadges.forEach((ub) => {
      const matches = filters.every((f) => {
        const val = ub[f.column as keyof typeof ub];
        return String(val) === f.value;
      });
      if (matches) {
        Object.assign(ub, body);
      }
    });

    return HttpResponse.json(body);
  }),

  // === game_results ===
  // GET (getTodayPlayedGameIds에서 사용)
  http.get(`${SUPABASE_URL}/rest/v1/game_results`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    let result = applyFilters(
      gameResults as unknown as Record<string, unknown>[],
      filters,
    );
    return postgrestResponse(result, request, true);
  }),

  // POST (recordGamePlay에서 insert 사용)
  http.post(`${SUPABASE_URL}/rest/v1/game_results`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newRow = {
      id: crypto.randomUUID(),
      played_at: new Date().toISOString(),
      ...body,
    };
    gameResults.push(newRow as (typeof gameResults)[0]);

    // 게임 보상 배지 적립 (recordGamePlay 로직 재현)
    const score = body.score as number;
    if (score > 0) {
      addBadgeBalance(body.user_id as string, GAME_REWARD_BADGE_ID, score);
    }

    return HttpResponse.json(newRow, { status: 201 });
  }),

  // === products ===
  // GET (getProducts에서 사용)
  http.get(`${SUPABASE_URL}/rest/v1/products`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');
    let result = applyFilters(
      products as unknown as Record<string, unknown>[],
      filters,
    );
    result = applyOrder(result, orderParam);
    return postgrestResponse(result, request);
  }),

  // === coupons ===
  // GET (getMyCoupons, getExpiringCoupons에서 사용 — products 조인 포함)
  http.get(`${SUPABASE_URL}/rest/v1/coupons`, ({ request }) => {
    const url = new URL(request.url);
    const selectParam = url.searchParams.get('select') ?? '';
    const joinTables = extractJoinTables(selectParam);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');

    let result = applyFilters(coupons, filters);
    result = applyOrder(result, orderParam);

    // products 조인 처리
    if (joinTables.includes('products')) {
      result = result.map((c) => ({
        ...c,
        products: products.find((p) => p.id === c.product_id) ?? null,
      }));
    }

    return postgrestResponse(result, request);
  }),

  // POST (postExchange에서 insert 사용)
  http.post(`${SUPABASE_URL}/rest/v1/coupons`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newRow = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...body,
    };
    coupons.push(newRow);
    return HttpResponse.json(newRow, { status: 201 });
  }),

  // === exchanges ===
  // POST (postExchange에서 insert + select('id').single() 사용)
  http.post(`${SUPABASE_URL}/rest/v1/exchanges`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newRow = { id: crypto.randomUUID(), ...body };
    exchanges.push(newRow as (typeof exchanges)[0]);
    return HttpResponse.json(newRow, { status: 201 });
  }),
];
```

- [ ] **Step 2: 커밋**

```bash
git add src/mocks/handlers/reward.ts
git commit -m "feat: Reward 도메인 mock 핸들러 추가"
```

---

## Task 8: Consult Report 핸들러 (consultation_reports, report_recommendations)

**Files:**

- Create: `src/mocks/handlers/consult-report.ts`

**참고 파일:**

- `src/features/consult-report/api/getReport.ts` — consultation_reports select + report_recommendations select + plans select (in 쿼리)
- `src/features/consult-report/api/saveReport.ts` — consultation_reports insert(select('id').single()) + report_recommendations insert + plans select

- [ ] **Step 1: consult-report.ts 작성**

```typescript
// src/mocks/handlers/consult-report.ts
import { http, HttpResponse } from 'msw';

import { consultationReports, reportRecommendations, mockSession } from '../db';
import {
  parseFilters,
  applyFilters,
  applyOrder,
  postgrestResponse,
} from '../utils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const consultReportHandlers = [
  // consultation_reports — GET (getReport에서 사용)
  http.get(`${SUPABASE_URL}/rest/v1/consultation_reports`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');
    let result = applyFilters(consultationReports, filters);
    result = applyOrder(result, orderParam);
    return postgrestResponse(result, request);
  }),

  // consultation_reports — POST (saveReport에서 insert + select('id').single())
  http.post(
    `${SUPABASE_URL}/rest/v1/consultation_reports`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      const newRow = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...body,
      };
      consultationReports.push(newRow);
      // select('id').single() 응답
      return HttpResponse.json({ id: newRow.id }, { status: 201 });
    },
  ),

  // report_recommendations — GET (getReport에서 사용)
  http.get(`${SUPABASE_URL}/rest/v1/report_recommendations`, ({ request }) => {
    const url = new URL(request.url);
    const filters = parseFilters(url);
    const orderParam = url.searchParams.get('order');
    let result = applyFilters(
      reportRecommendations as unknown as Record<string, unknown>[],
      filters,
    );
    result = applyOrder(result, orderParam);
    return postgrestResponse(result, request);
  }),

  // report_recommendations — POST (saveReport에서 insert 배열)
  http.post(
    `${SUPABASE_URL}/rest/v1/report_recommendations`,
    async ({ request }) => {
      const body = await request.json();
      const rows = Array.isArray(body) ? body : [body];
      for (const row of rows) {
        reportRecommendations.push(row as (typeof reportRecommendations)[0]);
      }
      return HttpResponse.json(rows, { status: 201 });
    },
  ),
];
```

- [ ] **Step 2: 커밋**

```bash
git add src/mocks/handlers/consult-report.ts
git commit -m "feat: Consult report mock 핸들러 추가"
```

---

## Task 9: Subscription 핸들러 (subscription_applications, subscription_status_logs, terms_consents)

**Files:**

- Create: `src/mocks/handlers/subscription.ts`

**참고 파일:**

- `src/features/plan-subscription/api/submitSubscription.ts` — subscription_applications insert(select('id').single()) + subscription_status_logs insert + terms_consents insert(배열)

- [ ] **Step 1: subscription.ts 작성**

```typescript
// src/mocks/handlers/subscription.ts
import { http, HttpResponse } from 'msw';

import {
  subscriptionApplications,
  subscriptionStatusLogs,
  termsConsents,
} from '../db';
import { parseFilters, applyFilters, postgrestResponse } from '../utils';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export const subscriptionHandlers = [
  // subscription_applications — POST (submitSubscription에서 insert + select('id').single())
  http.post(
    `${SUPABASE_URL}/rest/v1/subscription_applications`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      const newRow = {
        id: crypto.randomUUID(),
        requested_at: new Date().toISOString(),
        ...body,
      };
      subscriptionApplications.push(newRow);
      return HttpResponse.json({ id: newRow.id }, { status: 201 });
    },
  ),

  // subscription_status_logs — POST (submitSubscription에서 insert)
  http.post(
    `${SUPABASE_URL}/rest/v1/subscription_status_logs`,
    async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      const newRow = {
        id: crypto.randomUUID(),
        changed_at: new Date().toISOString(),
        ...body,
      };
      subscriptionStatusLogs.push(newRow);
      return HttpResponse.json(newRow, { status: 201 });
    },
  ),

  // terms_consents — POST (submitSubscription에서 insert 배열)
  http.post(`${SUPABASE_URL}/rest/v1/terms_consents`, async ({ request }) => {
    const body = await request.json();
    const rows = Array.isArray(body) ? body : [body];
    for (const row of rows) {
      termsConsents.push({ id: crypto.randomUUID(), ...row });
    }
    return HttpResponse.json(rows, { status: 201 });
  }),
];
```

- [ ] **Step 2: 커밋**

```bash
git add src/mocks/handlers/subscription.ts
git commit -m "feat: Subscription mock 핸들러 추가"
```

---

## Task 10: AI Consult Edge Function 핸들러

**Files:**

- Create: `src/mocks/handlers/ai-consult.ts`

**참고 파일:**

- `src/shared/lib/aiConsult.ts` — `requestConsult` (mode=recommend/compare/general), `generateReport` (mode=report)
- `src/shared/lib/aiConsult.ts` — ConsultInput, ConsultResponse, ReportOutput, CompareResult 타입
- `supabase/functions/ai-consult/recommend.ts` — 실제 Edge Function 로직 (mock 응답의 참고용)

**핵심:** Edge Function은 POST `/functions/v1/ai-consult`로 body를 받아 모드에 따라 다른 응답을 반환. mock에서는 LLM 호출 없이 미리 정의된 응답 패턴을 반환.

- [ ] **Step 1: ai-consult.ts 작성**

```typescript
// src/mocks/handlers/ai-consult.ts
import { http, HttpResponse } from 'msw';

import { plans } from '../db';
import type {
  ConsultInput,
  ConsultResponse,
  ReportOutput,
} from '@/shared/lib/aiConsult';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// 요금제 추천 mock 응답 생성
function buildRecommendResponse(input: ConsultInput): ConsultResponse {
  // 입력 조건에 따라 상위 3개 요금제 선택 (간단한 필터링)
  let candidates = plans.filter((p) => p.is_active);

  if (input.budget && input.budget > 0) {
    candidates = candidates.filter((p) => p.monthly_fee <= input.budget!);
  }
  if (input.dataUsage && input.dataUsage > 0) {
    candidates = candidates.filter((p) => p.data_amount_gb >= input.dataUsage!);
  }

  // 후보가 부족하면 전체에서 상위 3개
  if (candidates.length < 3) {
    candidates = plans.filter((p) => p.is_active);
  }

  // sort_order 순으로 상위 3개
  candidates = candidates.slice(0, 3);

  const recommendations = candidates.map((p) => ({
    planId: String(p.id),
    planName: p.name,
    reason: p.notes,
    savingAmount: 0,
    monthlyFee: p.monthly_fee,
    data: p.data,
    dataAmountGb: p.data_amount_gb,
    benefits: p.benefits,
    category: p.category,
    targetAge: p.target_age,
    dataSpeedAfter: p.data_speed_after,
    voice: p.voice,
    callAmountMin: p.call_amount_min,
    message: p.message,
    smsAmount: p.sms_amount,
    shareData: p.share_data,
    tethering: p.tethering,
    notes: p.notes,
  }));

  return {
    recommendations,
    notice: '고객님의 사용 패턴을 분석한 결과, 다음 요금제를 추천드립니다.',
    quickReplies: ['요금제 비교하기', '레포트 받기', '다른 요금제 보기'],
    mode: 'recommend',
  };
}

// 요금제 비교 mock 응답
function buildCompareResponse(input: ConsultInput): ConsultResponse {
  const planA = plans.find((p) => p.name === input.comparePlanA);
  const planB = plans.find((p) => p.name === input.comparePlanB);

  if (!planA || !planB) {
    return {
      recommendations: [],
      notice: '비교할 요금제를 찾을 수 없습니다.',
      mode: 'compare',
    };
  }

  const toRec = (p: typeof planA) => ({
    planId: String(p.id),
    planName: p.name,
    reason: p.notes,
    savingAmount: 0,
    monthlyFee: p.monthly_fee,
    data: p.data,
    dataAmountGb: p.data_amount_gb,
    benefits: p.benefits,
  });

  return {
    recommendations: [],
    mode: 'compare',
    compareResult: {
      summary: `${planA.name}과 ${planB.name}를 비교한 결과입니다.`,
      planAAdvantage: `${planA.name}은 월 ${planA.monthly_fee.toLocaleString()}원으로 ${planA.data} 데이터를 제공합니다.`,
      planBAdvantage: `${planB.name}은 월 ${planB.monthly_fee.toLocaleString()}원으로 ${planB.data} 데이터를 제공합니다.`,
      recommendedPlanId:
        planA.monthly_fee <= planB.monthly_fee
          ? String(planA.id)
          : String(planB.id),
      reason: '더 나은 가성비를 제공하는 요금제입니다.',
      planA: toRec(planA),
      planB: toRec(planB),
    },
  };
}

// 레포트 생성 mock 응답
function buildReportResponse(input: ReportInput): {
  report: ReportOutput;
  mode: 'report';
} {
  return {
    mode: 'report',
    report: {
      summary: '상담 내용을 바탕으로 요금제 추천 레포트를 생성했습니다.',
      usageType: '일반 사용자',
      currentPlan: input.currentPlan || '미확인',
      recommendedPlans: input.recommendationResult
        ? input.recommendationResult.split(',').map((s) => s.trim())
        : ['데이터플랜5GB', '데이터플랜9GB'],
      recommendationReason:
        '현재 사용 패턴을 기준으로 더 나은 가성비의 요금제를 추천드립니다.',
      monthlySavingAmount: 9000,
      importantConditions: ['데이터 용량', '월 정액', '속도 제한'],
      qaPairs: [],
    },
  };
}

export const aiConsultHandlers = [
  http.post(`${SUPABASE_URL}/functions/v1/ai-consult`, async ({ request }) => {
    const body = (await request.json()) as ConsultInput & { mode?: string };

    // 약간의 지연 시뮬레이션 (500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (body.mode === 'report') {
      const reportInput: ReportInput = {
        conversation: body.conversation ?? '',
        currentPlan: body.currentPlan ?? '',
        recommendationResult: body.recommendationResult ?? '',
        reportKind: body.reportKind,
        userProfile: body.userProfile,
      };
      return HttpResponse.json(buildReportResponse(reportInput));
    }

    if (body.mode === 'compare' || (body.comparePlanA && body.comparePlanB)) {
      return HttpResponse.json(buildCompareResponse(body));
    }

    // 기본: recommend 모드
    return HttpResponse.json(buildRecommendResponse(body));
  }),
];
```

- [ ] **Step 2: 커밋**

```bash
git add src/mocks/handlers/ai-consult.ts
git commit -m "feat: AI consult Edge Function mock 핸들러 추가"
```

---

## Task 11: 핸들러 통합 및 main.tsx 연동

**Files:**

- Create: `src/mocks/handlers/index.ts`
- Create: `src/mocks/browser.ts`
- Modify: `src/main.tsx`

**Interfaces:**

- Produces: `setupWorker` 호출, main.tsx에서 MSW 시작

- [ ] **Step 1: handlers/index.ts 작성**

```typescript
// src/mocks/handlers/index.ts
import { authHandlers } from './auth';
import { plansHandlers } from './plans';
import { usageHandlers } from './usage';
import { rewardHandlers } from './reward';
import { consultReportHandlers } from './consult-report';
import { subscriptionHandlers } from './subscription';
import { aiConsultHandlers } from './ai-consult';

export const handlers = [
  ...authHandlers,
  ...plansHandlers,
  ...usageHandlers,
  ...rewardHandlers,
  ...consultReportHandlers,
  ...subscriptionHandlers,
  ...aiConsultHandlers,
];
```

- [ ] **Step 2: browser.ts 작성**

```typescript
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';

import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

- [ ] **Step 3: main.tsx 수정**

```typescript
// src/main.tsx
import { StrictMode } from 'react';

import { createRoot } from 'react-dom/client';

import './index.css';
import { AuthProvider } from '@/entities/user';

import App from './app/App.tsx';
import { QueryProvider } from './app/QueryProvider';

// MSW mock 백엔드 — VITE_USE_MOCK=true일 때만 활성화
async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return;
  const { worker } = await import('./mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass', // Supabase 외 요청은 그대로 통과
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryProvider>
    </StrictMode>,
  );
});
```

- [ ] **Step 4: 커밋**

```bash
git add src/mocks/handlers/index.ts src/mocks/browser.ts src/main.tsx
git commit -m "feat: MSW 워커 통합 및 main.tsx 연동"
```

---

## Task 12: 검증

- [ ] **Step 1: .env.local에 VITE_USE_MOCK=true 추가**

사용자가 `.env.local`에 다음 라인을 추가:

```
VITE_USE_MOCK=true
```

- [ ] **Step 2: dev 서버 실행**

```bash
npm run dev
```

- [ ] **Step 3: 브라우저에서 확인**

1. 콘솔에 `[MSW] Mocking enabled` 메시지 확인
2. 요금제 카탈로그가 정상 로드되는지 확인 (plans 테이블)
3. 로그인 화면에서 `user1@example.com` / `password` 로 로그인 시도
4. 로그인 성공 후 출석 체크, 게임, 쿠폰함 등 기능 확인
5. AI 상담 메시지 전송 시 mock 응답 확인

- [ ] **Step 4: lint 및 build 확인**

```bash
npm run lint
npm run build
```

- [ ] **Step 5: 최종 커밋**

```bash
git add -A
git commit -m "test: MSW mock 백엔드 검증 완료"
```

---

## Self-Review

### 1. Spec coverage

- ✅ Auth: getSession(로컬), getUser, signIn, signUp, signOut, 토큰 갱신 → Task 4
- ✅ Plans: getPlanCatalog, getPlans, getCurrentPlan, postChangePlan → Task 5
- ✅ Usage: getUsage, getUsageTrend, ensureCurrentMonthUsage → Task 6
- ✅ Reward: getAttendances, getAttendanceStreak, postCheckIn, getBadgeBalance, addBadgeBalance, getTodayPlayedGameIds, recordGamePlay, getMyCoupons, getExpiringCoupons, getProducts, postExchange → Task 7
- ✅ Consult Report: getReport, saveReport → Task 8
- ✅ Subscription: submitSubscription → Task 9
- ✅ AI Consult: requestConsult, generateReport → Task 10
- ✅ MSW setup & integration → Tasks 1, 11
- ✅ Verification → Task 12

### 2. Placeholder scan

- plans 배열의 "나머지 39개 요금제"는 seed.sql에서 변환하라고 명시 — 구현자가 seed.sql을 읽고 변환. 이는 placeholder가 아닌 참조.
- 모든 핸들러에 실제 코드 포함됨.

### 3. Type consistency

- `mockSession` 타입이 auth.ts와 plans.ts에서 일관됨
- `postgrestResponse` 함수가 모든 GET 핸들러에서 동일하게 사용됨
- `parseFilters` / `applyFilters` / `applyOrder`가 utils.ts에서 정의되고 모든 핸들러에서 import됨
