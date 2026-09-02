# 에피라(Ephyra) 프로젝트 기술 분석 — 상세본

> AI 기반 통신 요금제 상담·가입 플랫폼
> 분석 일자: 2026-09-02 / 분석 대상: compProject 메인 브랜치 HEAD (f751395)

---

## 1. 아키텍처 구조

### 1.1 전체 시스템 구조

에피라는 **프론트엔드 단일 채팅 페이지 + Supabase BaaS + Edge Function 기반 LLM 파이프라인**으로 구성된 BaaS 중심 아키텍처다. 별도 백엔드 서버 없이 Supabase가 인증·DB·서버리스 함수를 모두 담당한다.

```
┌─────────────────────────────────────────────────────────────┐
│  Vite SPA (React 19)                                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  App (단일 ChatPage)                                  │  │
│  │  QueryProvider → AuthProvider → Layout → ChatPage     │  │
│  │  useChat 허브 훅이 모든 도메인 흐름을 조율              │  │
│  └───────────────────────────────────────────────────────┘  │
└───────────────┬─────────────────────────────────────────────┘
                │ Supabase JS SDK (PostgREST + Auth + Functions)
┌───────────────▼─────────────────────────────────────────────┐
│  Supabase                                                 │
│  ├─ Auth (JWT, Kakao OAuth, 세션 자동 갱신)                │
│  ├─ PostgreSQL 17 + RLS (행 수준 보안)                    │
│  │   └─ 11개 도메인 그룹 / 20+ 테이블                     │
│  └─ Edge Functions (Deno)                                 │
│      └─ ai-consult: OpenAI /v1/chat/completions 호출        │
└───────────────┬─────────────────────────────────────────────┘
                │ fetch (Bearer OPENAI_API_KEY)
┌───────────────▼─────────────────────────────────────────────┐
│  OpenAI API (gpt-4o-mini 기본, 환경변수로 교체 가능)        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 프론트엔드 디렉터리 구조 — Feature-Sliced Design (FSD)

`src/`는 FSD의 6개 레이어를 따른다. codebase-memory 분석 결과 레이어 간 호출 방향은 아래와 같이 단방향으로 정리돼 있다.

| 레이어     | 역할                                         | fan-in | fan-out | 비고                       |
| ---------- | -------------------------------------------- | ------ | ------- | -------------------------- |
| `app`      | 앱 셸, Provider 조합                         | 0      | 0       | 진입점                     |
| `pages`    | 페이지 조립                                  | 0      | 4       | outbound only (entry)      |
| `widgets`  | 페이지 단위 조립 블록(Layout)                | 1      | 3       | Header/Footer/Layout/Modal |
| `features` | 도메인 기능 단위                             | 3      | 48      | 12개 피처, 핵심 계층       |
| `entities` | 비즈니스 엔티티(요금제·사용량·리워드·사용자) | 32     | 0       | core, 외부 의존 없음       |
| `shared`   | 범용 UI·유틸·store                           | 16     | 0       | core                       |

- **경계(boundaries)**: `features → entities`(31 호출), `features → shared`(14), `pages → features`(3) 등 FSD 규칙을 위반하는 역방향 의존은 없다.
- **핫스팟**: `useAuth`/`useIsLoggedIn`(fan-in 11), `useModalStore.close`(fan-in 6) — 인증과 전역 모달이 가장 널리 참조된다.
- 각 피처는 내부적으로 `api / model / ui / lib / constants` 하위 폴더로 세분화돼 데이터 접근·상태·뷰·로직을 분리한다.

### 1.3 Provider 중첩 구조

`main.tsx` 한 곳에서 Provider 순서가 결정된다.

```tsx
<StrictMode>
  <QueryProvider>
    {' '}
    // TanStack Query — 최상단 (어디서든 서버 상태 접근)
    <AuthProvider>
      {' '}
      // React Context — 인증 세션 (Query 아래, 인증 기반 쿼리가 위에 있어야 함)
      <App /> // Layout → ChatPage → useChat
    </AuthProvider>
  </QueryProvider>
</StrictMode>
```

`QueryProvider`가 `AuthProvider`보다 바깥에 있는 이유는 인증 상태 변화를 구독하는 TanStack Query 훅들이 `AuthProvider` 내부에서 `useAuth()`를 통해 `enabled`를 받기 때문이다. 순서가 바뀌면 인증 의존 쿼리가 초기 렌더에서 누락될 수 있다.

### 1.4 데이터베이스 스키마

초기 마이그레이션(`20260820000001_initial_schema.sql`)에 11개 도메인 그룹의 테이블이 정의돼 있으며, 모두 RLS(Row Level Security)가 활성화돼 있다.

| 그룹        | 핵심 테이블                                                                    | RLS 정책                  |
| ----------- | ------------------------------------------------------------------------------ | ------------------------- |
| 사용자      | `users`, `accessibility_settings`                                              | 본인 only (SELECT/UPDATE) |
| 요금제      | `plans`                                                                        | active 전체 공개 SELECT   |
| 요금제 관리 | `saved_plans`, `current_plans`                                                 | 본인 only                 |
| AI 상담     | `consultation_reports`, `report_recommendations`, `consultation_satisfactions` | 본인 only (report 경유)   |
| 사용량      | `usage_monthly`, `usage_patterns`                                              | 본인 only                 |
| 출석        | `attendances`, `attendance_streaks`                                            | 본인 only                 |
| 배지·미션   | `badges`, `user_badges`, `missions`, `user_missions`                           | 배지는 공개, 나머지 본인  |
| 추천인      | `referrals`                                                                    | 본인 only                 |
| 게임        | `games`, `game_results`                                                        | games 공개, results 본인  |
| 상품·교환   | `products`, (교환 내역)                                                        | active 공개               |
| 쿠폰        | (마이그레이션 확장)                                                            | 본인 only                 |

설계 특징:

- `users.id`가 `auth.users(id)`를 직접 참조 → Supabase Auth와 1:1 매핑, `ON DELETE CASCADE`로 인증 탈퇴 시 자동 정리.
- `plans`는 `BIGINT IDENTITY`를 쓰며 `plans.json`의 integer id와 호환 (`recommend.ts`가 `String(plan.id)`로 비교).
- `report_recommendations`·`consultation_satisfactions`은 부모 report를 경유하는 EXISTS 정책으로 권한을 위임 — 중첩 RLS 패턴.
- `benefits`, `ott_benefits`, `add_ons`는 JSONB + GIN 인덱스로 OTT 매칭·혜택 검색 가속.

> 주의: 초기 스키마 주석에 "v2 간소화: 상담 세션/메시지 제거, 최종 레포트만 유지"라고 명시돼 있다. 채팅 메시지는 DB에 저장하지 않고 클라이언트 메모리에만 존재한다(→ 상태관리 딜레마와 직결).

---

## 2. 핵심 기능 구현 분석

### 2.1 AI 상담 파이프라인 (핵심)

가장 복잡한 흐름이다. 프론트 `useChat` → `requestConsult` → Edge Function `ai-consult` → `recommend.ts` → OpenAI로 이어진다.

**프론트엔드 측 (`src/features/ai-consult`)**:

- `useChat.tsx`가 627줄짜리 허브 훅. 메시지 상태, 프로필(사용자 조건) 누적, 로딩·중단·재생성·편집, 게임·퀴즈·비교·가입·스크래치·레포트 생성까지 모든 도메인 흐름을 한 훅에서 조율한다.
- `routeQuickReply`(`quickReplyRouter.ts`)가 퀵 리플라이 텍스트를 패턴 매칭해 "게임 하기", "출석체크", "요금제 비교하기", "다른 요금제 보기" 등을 AI 호출 없이 로컬 분기 처리 → LLM 호출 비용 절감.
- `postQuestion` → `requestConsult`(`aiConsult.ts`)가 `supabase.functions.invoke('ai-consult', { signal, timeout })`로 Edge Function 호출. `AbortController`로 사용자 중단 지원, 상담 30초·레포트 60초 타임아웃.

**Edge Function 측 (`supabase/functions/ai-consult`)**:

- `index.ts`는 얇은 디스패처. `mode === 'report'`면 `generateReport`, 아니면 `recommendPlan` + `generateQuickReplies`.
- `recommend.ts`(727줄+)이 실제 로직. LangChain 없이 `openai.ts`로 `/v1/chat/completions`를 직접 fetch.
- **하이브리드 추천 전략**: 코드 기반 필터링(`buildCandidateFilters` → `scoreCandidates`)으로 후보 5개를 좁힌 뒤, LLM은 `recommendPrompt`로 후보 중 상위 3개의 `planId`만 선택. 그 후 `reasonPrompt`로 추천 사유를 별도 LLM 호출로 생성.
- **LLM 환각 방지**: `sanitizeRecommendations`가 LLM이 반환한 `planId`를 실제 `plans` 데이터로 보정하고, 존재하지 않는 요금제는 제외. 추천 사유 LLM 호출이 실패하면 `buildCodeReason`이 코드 기반 fallback 문구 생성.
- **안전 JSON 파싱**: `safeJsonParse`가 마크다운 코드 블록(```json) 제거 후, 실패 시 첫 `{`~마지막 `}` 슬라이스로 재시도 — LLM이 불완전 JSON을 내놓아도 복구.
- **모드 라우팅**: `resolveNextMode`가 정규식으로 "요금제 추천/비교/가입/게임/출석/레포트" 의도를 분류하고, 통신 외 입력은 `out_of_scope`로 분기. `TELECOM_KEYWORDS`는 프론트 `telecomKeywords.ts`에서 `sync:keywords` 스크립트로 자동 생성돼 양쪽이 동기화됨.

### 2.2 요금제 비교 흐름

`useChatCompare.ts`가 2단계 플로우 상태 머신을 관리한다:

- `compareFlow: 'idle' | 'selectingCurrent' | 'selectingTarget'`
- 현재 요금제가 없으면 드롭다운으로 먼저 선택(`planSelector` 메시지), 그 후 비교 대상 선택.
- `fetchCompare`가 `requestConsult`에 `comparePlanA/comparePlanB`를 넘기고, Edge Function의 `comparePlans`가 LLM 비교 + 코드 fallback(`buildCodeCompareResult`)을 제공.

### 2.3 상담 레포트 생성

`useChatReport.ts`:

- `buildConversationLog`가 게임/출석 맥락 메시지를 제외한 대화 로그를 문자열로 직렬화.
- 추천 요금제가 있으면 `reportKind: 'plan'`, 없으면 `general`.
- 레포트 생성 후 `saveReport`로 DB 저장(`consultation_reports` + `report_recommendations`), 이후 채팅을 초기화하고 결과 메시지만 남김(`resetChat({ showGreeting: false })`).

### 2.4 리워드·게임 시스템

- `useGameStore`(Zustand)가 활성 게임·소스(chat/reward)·reveal 타이밍을 관리. `REVEAL_DELAY=500ms`로 카드 뒤집기 애니메이션 타이밍 제어.
- `useMissionCompletion`(TanStack Query)가 오늘 플레이한 게임을 조회하고 `recordGamePlay` mutation으로 배지 적립. `submittedRef`(useRef Set)로 서버 응답 전 중복 onWin을 동기적으로 차단 — 낙관적 중복 방지 패턴.
- 스크래치/룰렛 보상은 1~5 랜덤(git 기록상 고정값에서 랜덤화로 수정됨).

### 2.5 인증

- `AuthProvider`가 `supabase.auth.getSession()` + `onAuthStateChange`로 세션을 구독. Context value에 `user/session/isLoading/isLoggedIn` 노출.
- 카카오 OAuth + 이메일 회원가입. `users.kakao_id`는 초기엔 `NOT NULL UNIQUE`였으나 마이그레이션 `20260825000001`로 nullable이 되고 `20260825000002`에서 컬럼 자체가 drop됨 — 카카오 외 가입 경로 확장에 따른 스키마 진화.

### 2.6 비로그인 게이팅

`useChat`의 `aiResponseCount >= 5` 임계값으로 비로그인 사용자를 5회 대화 후 로그인 모달로 유도(`hasPromptedLoginRef`로 1회만 자동 팝업). 게임·가입 등 기능도 로그인 게이팅.

---

## 3. 트러블슈팅 정리

README의 트러블슈팅 섹션은 "// 추후 작성"으로 비어 있으나, git 히스토리와 코드 주석에서 실제 해결한 문제들을 역추적할 수 있다.

| #   | 문제                                                                   | 해결 커밋            | 해결 방식                                                               |
| --- | ---------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------- |
| 1   | 라우팅 구조가 단일 채팅에 비해 과도하게 복잡                           | ab7c1ae              | react-router 제거, 단일 ChatPage 구조로 전환                            |
| 2   | `current_plans` 조회 시 406 에러                                       | 9fd6220              | RLS 정책/조회 방식 수정 + 레포트 생성 전 확인 모달 추가                 |
| 3   | 비로그인 무한 대화 남용                                                | 5f79b76              | 5회 대화 후 로그인 유도 + 회원가입 통합 모달                            |
| 4   | 스크래치/룰렛 보상이 고정값                                            | 2c5e632              | 1~5 랜덤화                                                              |
| 5   | 비교 컴포넌트 빈 상태·대표 혜택 미처리                                 | 645a252              | 빈 상태·혜택 처리 보완(코드래빗 리뷰 반영)                              |
| 6   | 카드 게임 버그                                                         | f745f27              | 카드 게임 수정                                                          |
| 7   | 로그아웃 시 세션 잔류                                                  | 4f96796              | 로그아웃 세션 정리 + 회원가입 검증 강화                                 |
| 8   | 요금제 가입 step 2가 불필요                                            | 2c657a2              | step 2 제거, 완료 화면·스크롤 개선                                      |
| 9   | 채팅 메시지 말풍선 줄바꿈 버그·여백 불일치                             | 620f052              | 여백 통일, 말풍선 줄바꿈 수정, 로딩 인디케이터 교체                     |
| 10  | 쿠폰 바코드 모달 스크롤 불가                                           | 0c40498              | 모달 content 스크롤 허용                                                |
| 11  | AbortController 경쟁 상태 (이전 요청 finally가 신규 컨트롤러 덮어쓰기) | 코드 주석            | `clearRequest(signal)`에서 자신의 signal과 비교 후에만 null 처리        |
| 12  | 게임 onWin 중복 호출로 배지 중복 적립                                  | useMissionCompletion | `submittedRef`(Set)로 세션 내 1회만 기록 + 서버 쿼리로 오늘 플레이 필터 |
| 13  | LLM이 존재하지 않는 요금제/가격 환각                                   | recommend.ts         | `sanitizeRecommendations`로 실제 데이터 보정 + 코드 fallback            |
| 14  | LLM이 마크다운 코드 블록으로 JSON 감싸 출력                            | recommend.ts         | `safeJsonParse`로 코드 블록 제거 + 부분 슬라이스 복구                   |

---

## 4. 기술·방법 선택 이유

### 4.1 BaaS(Supabase) 단일 선택

별도 백엔드 서버 운영 비용을 피하고, RLS로 DB 보안을 선언적으로 처리하며, Edge Function으로 service role이 필요한 AI 호출만 최소화. 프론트엔드 4인 팀에 적합한 선택.

### 4.2 LangChain 미사용 — OpenAI 직접 호출

`openai.ts`는 47줄로 `/v1/chat/completions`를 직접 fetch. LangChain 추상화 비용(번들·런타임·디버깅 복잡도) 없이 온전한 제어권 확보. Edge Function(Deno) 환경에서 의존성 최소화가 결정적.

### 4.3 하이브리드 추천(코드 필터 + LLM 선택)

LLM에 전체 요금제를 넘기지 않고 코드로 후보 5개를 좁힌 뒤 LLM은 선택만 수행. 토큰 비용·지연·환각을 동시에 절감. 추천 사유는 별도 LLM 호출로 품질을 분리 관리.

### 4.4 FSD 아키텍처

도메인 응집·레이어 단방향 의존으로 12개 피처가 독립 성장. `entities`(core, fan-out 0)와 `features`(fan-out 48)의 분리가 경계를 명확히 함.

### 4.5 단일 ChatPage 구조 (react-router 제거)

서비스가 채팅 중심 단일 화면이므로 라우팅 오버헤드를 제거하고 모든 흐름을 채팅 내 시트/모달로 처리. git ab7c1ae에서 명시적 전환.

### 4.6 Zustand + TanStack Query + Context 3종 상태관리

각 상태의 성격에 맞춰 도구를 분리(→ 6절 상세).

### 4.7 퀵 리플라이 로컬 라우팅

자주 쓰는 메뉴 진입은 AI 호출 없이 `routeQuickReply`에서 로컬 분기 → 응답 지연·비용 절감.

---

## 5. 주목할 만한 기술적 딜레마 및 개선 사항

### 딜레마 1: 채팅 메시지를 DB에 저장하지 않는 구조

초기 스키마 주석이 "상담 세션/메시지 제거, 최종 레포트만 유지"라고 명시. 메시지는 클라이언트 메모리(`useState`)에만 존재.

- **장점**: 스키마 단순, 실시간 스트리밍·편집·재생성이 자유로움, DB 부하 없음.
- **단점**: 새로고침 시 대화 손실(→ `RefreshCheckModal`·`beforeunload`로 우회), 멀티 디바이스 동기화 불가, 상담 이력 분석 어려움.
- **개선 방향**: (a) 세션/메시지 테이블 재도입 + 낙관적 로컬 우선 동기화, (b) IndexedDB에 임시 저장해 새로고침 복구, (c) 레포트만 DB에 두는 현 구조 유지하되 클라이언트에 `sessionStorage` 백업 추가.

### 딜레마 2: useChat 허브 훅의 비대

`useChat.tsx` 627줄이 12개 도메인(추천·비교·가입·게임·퀴즈·스크래치·레포트·인증 게이팅·재생성·편집·중단)을 모두 조율. 하위 훅(`useChatCompare`·`useChatReport`·`useChatSubscription`)으로 일부 분리했지만 여전히 거대.

- **리스크**: 의존성 배열 과다(20+), 재렌더 범위 확대, 테스트 단위 분리 어려움.
- **개선 방향**: (a) 도메인별 reducer로 전환해 `useReducer`로 통합, (b) 채팅 상태를 Zustand store로 분리해 컴포넌트 트리 외부에서 관리, (c) `useChat`을 facade로 두고 내부를 도메인 슬라이스로 분할.

### 딜레마 3: LLM 환각 vs 응답 품질

코드 보정(`sanitizeRecommendations`)으로 안전성은 확보했지만, 추천 사유 품질은 LLM에 의존. LLM 실패 시 fallback 문구는 건조함.

- **개선 방향**: fallback 문구 템플릿 다양화, 사유 품질 평가 메트릭 도입, `temperature: 0.1`을 상황별 조정.

### 딜레마 4: Edge Function `@ts-nocheck`

`index.ts`·`recommend.ts`·프롬프트 파일 최상단에 `@ts-nocheck`. Deno 환경 타입 정의 부족으로 인한 선택이나 타입 안전성 포기.

- **개선 방향**: `deno-globals.d.ts`를 확장해 `Deno`·`supabase` 타입을 보강하고 점진적으로 `@ts-nocheck` 제거.

### 딜레마 5: 단일 Edge Function에 모든 AI 로직 집중

`ai-consult` 하나가 추천·비교·레포트·Quick Reply 생성을 모두 처리. 확장 시 함수가 비대해지고 콜드스타트 영향이 집중.

- **개선 방향**: 기능별 함수 분리(`ai-recommend`, `ai-compare`, `ai-report`) 또는 내부 라우터 명확화.

### 기타 개선 사항

- `useChat` 의존성 배열에 `messages`가 포함돼 `handleSend`가 매 메시지마다 재생성 → `messages` ref 패턴으로 최적화 가능.
- `Date.now()` 기반 메시지 id가 동시 추가 시 충돌 위험 → `crypto.randomUUID()` 또는 증분 카운터 권장.
- `plans_select_active`가 `authenticated` 전용이라 비로그인 요금제 조회가 불가 → anon 정책 추가 검토(현재는 AI 호출로만 비로그인 추천 가능).

---

## 6. 상태관리 3종 사용 분석 + 딜레마 해소 방안 + 특징적 코드 분석

### 6.1 상태관리 3종 역할 분담

| 도구               | 상태 성격                            | 담당 영역                                       | 사용 위치                                                                           |
| ------------------ | ------------------------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------- |
| **React Context**  | 인증 세션 (전역, 드물게 변화)        | user/session/isLoading/isLoggedIn               | `AuthProvider` (1곳), `useAuth`/`useIsLoggedIn` (11곳 참조)                         |
| **TanStack Query** | 서버 상태 (캐싱·동기화·무효화)       | 요금제·사용량·리워드·쿠폰·레포트·게임 결과·배지 | 15개 파일 (useQuery/useMutation/useQueryClient)                                     |
| **Zustand**        | 클라이언트 전역 UI 상태 (동기, 빈번) | 모달·회원가입 의도·게임 시트·구독 현재 요금제   | 4개 store (useModalStore, useSignupIntentStore, useGameStore, useSubscriptionStore) |

Provider 중첩 순서(`QueryProvider > AuthProvider > App`)는 "서버 상태 캐시가 인증 의존 쿼리의 enabled를 받을 수 있도록" 설계된 것이다.

### 6.2 4번째 사실상의 상태 — useChat 로컬 상태 (딜레마의 핵심)

위 3종 외에 **`useChat`의 `useState`/`useRef` 기반 로컬 채팅 상태**가 사실상의 4번째 상태 계층이다. 메시지 배열(`messages`)·입력값(`input`)·프로필(`profile`)·로딩·중단 컨트롤러·마지막 입력 ref 등이 모두 컴포넌트 로컬 상태로 관리된다.

**딜레마**: 채팅 상태는 (a) 빈번하게 변하고(동기), (b) 여러 자식 컴포넌트가 구독하며, (c) 새로고침에 날아가지만, (d) DB에 저장하지 않기로 한 아키텍처 결정 때문에 TanStack Query로 옮기기도 애매하다. Zustand로 옮기면 되려나 싶지만, 그러면 `useChat`의 20+ 의존성 배열과 도메인 로직 응집이 깨진다.

### 6.3 딜레마 해소 방안

**방안 A — Zustand 채팅 store 도입 (추천)**

```ts
// shared/store/useChatStore.ts
interface ChatState {
  messages: ChatMessage[];
  profile: ConsultInput;
  input: string;
  isLoading: boolean;
  // actions...
}
export const useChatStore = create<ChatState>((set, get) => ({ ... }));
```

- `useChat`은 store를 구독하는 얇은 액션 디스패처로 전환.
- 메시지 변경이 `useChat` 재렌더를 유발하지 않음 → `handleSend` 재생성 문제 해소.
- `sessionStorage` persist 미들웨어 추가로 새로고침 복구까지 한 번에 해결.
- 단점: 도메인 로직이 store로 흩어질 수 있으므로 슬라이스 분할 필요.

**방안 B — useReducer 통합**

- `messages`/`profile`/`input`을 하나의 reducer로 통합해 `useChat`의 useState 개수를 줄이고 전이를 명시화.
- 상태는 여전히 로컬이지만 전이가 선언적이 됨.
- 새로고침 복구는 별도 처리 필요.

**방안 C — 하이브리드 (즉시 적용 가능한 최소 변경)**

- `messages`는 로컬 유지하되 `useRef`로 최신값을 보관해 `handleSend` 의존성에서 `messages` 제거 → 재생성 최적화.
- `sessionStorage`에 메시지를 debounce 저장해 새로고침 복구.
- DB 저장 여부는 별도 결정.

### 6.4 특징적 코드 분석

#### 6.4.1 Zustand — useModalStore (전역 단일 모달 패턴)

```ts
export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  options: null,
  open: (options) => set({ isOpen: true, options }),
  close: () => set({ isOpen: false }),
}));
```

- 화면에 모달은 한 번에 하나만 떠 있으면 되므로 각 기능이 자기 state로 Modal을 따로 마운트하는 대신 전역 store 하나로 다룸.
- 실제 렌더링은 `Layout`의 `<Modal />` 한 번만. `Header`·`ChatPage`·여러 피처가 `open()`만 호출.
- **선택 이유**: 모달 중첩 z-index·포커스 트랩 경쟁을 원천 차단, 번들에서 모달 인스턴스 중복 제거.

#### 6.4.2 Zustand — useSignupIntentStore (크로스 컴포넌트 의도 전달)

```ts
export const useSignupIntentStore = create<SignupIntentState>((set) => ({
  pending: false,
  requestSignup: () => set({ pending: true }),
  consumeSignup: () => set({ pending: false }),
}));
```

- Header(채팅 트리 밖)에서 회원가입 버튼을 눌렀을 때, 항상 마운트된 ChatPage의 가입 플로우를 열어달라고 "의도"를 잠깐 들고 있음.
- ChatPage의 effect가 `pending`을 감지해 `openSignupChat()` 후 `consumeSignup()`.
- **선택 이유**: props 드릴링이나 이벤트 버스 없이 "의도 전달"을 17줄로 해결. 전역 상태를 이벤트 신호로 쓰는 패턴.

#### 6.4.3 Zustand — useGameStore (타이머 + 소스 추적)

```ts
openGame: (gameId, params = {}) => {
  if (revealTimer) clearTimeout(revealTimer);
  set({ activeGameId: gameId, params, source: params.source ?? 'chat', revealed: false, backOverride: null });
  revealTimer = setTimeout(() => set({ revealed: true }), REVEAL_DELAY);
},
```

- `source: 'chat' | 'reward'`로 게임을 어디서 시작했는지 추적 → 종료 후 돌아갈 시트 결정.
- 모듈 스코프 `revealTimer`로 카드 뒤집기 애니메이션 타이밍을 store 외부에서 관리(컴포넌트 언마운트와 무관하게 동작).
- **선택 이유**: 게임 상태를 전역으로 두어 ChatPage의 BottomSheet와 RewardSheet가 같은 store를 공유.

#### 6.4.4 Zustand — useSubscriptionStore (Zustand 안의 비동기)

```ts
loadCurrentPlan: async () => {
  const plan = await getCurrentPlan();
  set({ currentPlan: plan });
},
submitApplication: async (plan, form) => {
  const applicationId = await submitSubscription({ ... });
  set((state) => ({ currentPlan: plan, planHistory: [...state.planHistory, { plan, subscribedAt: new Date().toISOString() }] }));
  return applicationId;
},
```

- Zustand store 내부에서 `entities/plan`의 `getCurrentPlan`을 직접 호출해 서버 데이터를 클라이언트 전역 상태로 캐시.
- **주의점**: 이 패턴은 TanStack Query의 캐시 무효화·재시도·stale 관리를 우회함. `useCurrentPlan`(TanStack Query)과 `useSubscriptionStore.currentPlan`이 같은 출처를 다른 캐시에 중복 보관 → 일관성 딜레마 발생 가능. 개선 시 하나로 통일 권장.

#### 6.4.5 TanStack Query — useMissionCompletion (낙관적 중복 방지)

```ts
const submittedRef = useRef<Set<string>>(new Set());
const recordPlay: typeof recordPlayMutation.mutate = (variables, options) => {
  if (
    playedGameIds.includes(variables.gameId) ||
    submittedRef.current.has(variables.gameId)
  ) {
    return;
  }
  submittedRef.current.add(variables.gameId);
  recordPlayMutation.mutate(variables, options);
};
```

- 서버 응답(쿼리 무효화)이 오기 전 같은 게임의 onWin이 짧은 시간에 여러 번 불려도 세션 내 최초 1번만 기록.
- `useQuery`로 오늘 플레이한 게임을 조회하고, `useMutation` onSuccess에서 `game-results/today`·`badge/balance` 쿼리 무효화.
- **선택 이유**: useRef Set으로 동기적 차단 + TanStack Query로 서버 상태 동기화를 결합 — 순수 TanStack Query만으로는 막기 어려운 "동시 다발 onWin"을 해결.

#### 6.4.6 TanStack Query — useCurrentPlan (enabled 게이팅)

```ts
export function useCurrentPlan(isLoggedIn: boolean) {
  return useQuery({
    queryKey: ['plans', 'current'],
    queryFn: getCurrentPlan,
    enabled: isLoggedIn,
  });
}
```

- `enabled: isLoggedIn`로 비로그인 시 호출 자체를 차단. 인증 Context 값이 쿼리 실행 조건으로 직결.
- `QueryProvider` 기본값: `retry: 1`, `staleTime: 5분`, `refetchOnWindowFocus: false` — 모바일 채팅 앱 특성에 맞춰 윈도우 포커스 재조회를 끔.

#### 6.4.7 React Context — AuthProvider (세션 구독)

```ts
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session);
    setUser(session?.user ?? null);
    setIsLoading(false);
  });
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setIsLoading(false);
  });
  return () => subscription.unsubscribe();
}, []);
const value = useMemo<AuthContextValue>(
  () => ({ user, session, isLoading, isLoggedIn: !!user }),
  [user, session, isLoading],
);
```

- 마운트 시 1회 초기 세션 로드 + `onAuthStateChange` 구독. 언마운트 시 구독 해제.
- `useMemo`로 value 참조 안정화 → Context 소비자 불필요 재렌더 방지.
- `useAuth()`는 Provider 내부에서만 호출 가능하도록 가드 → 잘못된 사용을 런타임에 즉시 발견.
- **선택 이유**: 인증은 앱 전역·드물게 변화·Provider 생명주기와 일치 → Context가 Zustand보다 적합. TanStack Query로 옮기면 세션 갱신 구독을 직접 짜야 함.

### 6.5 상태관리 선택 기준 요약

| 상태 성격                            | 선택            | 이유                                         |
| ------------------------------------ | --------------- | -------------------------------------------- |
| 전역, 드물게 변화, Provider 생명주기 | React Context   | 세션 구독·언마운트 정리가 자연스러움         |
| 서버 출처, 캐싱·무효화·재시도 필요   | TanStack Query  | 선언적 캐시, enabled 게이팅, mutation 동기화 |
| 클라이언트 전역 UI, 동기, 빈번       | Zustand         | 보일러플레이트 최소, selector 기반 구독      |
| 단일 컴포넌트 내 대화형 상태 (현재)  | useState/useRef | 지금은 로컬이 단순하지만 비대해짐 (딜레마)   |

---

## 7. 검증 증거

- codebase-memory 인덱스: compProject, 1632 nodes / 3885 edges, fast 모드, parse_partial 3개(`useChatCompare.ts:13`, `useChatSubscription.ts:8`, `seed.sql:2`).
- 아키텍처 분석: `get_architecture(aspects=['all'])` — 레이어 7, 경계 8, 클러스터 12, 핫스팟 10.
- TanStack Query 사용처: 15개 파일 grep 확인.
- Zustand store: 4개(`useModalStore`, `useSignupIntentStore`, `useGameStore`, `useSubscriptionStore`).
- git 히스토리: 최근 40커밋에서 트러블슈팅 14건 역추적.
- DB 스키마: 초기 마이그레이션 566줄 + 후속 8개 마이그레이션.

> 본 분석은 소스 코드·마이그레이션·git 히스토리·codebase-memory 그래프를 교차 검증해 작성했다. 단, README의 트러블슈팅 섹션은 미작성 상태라 git 커밋 메시지와 코드 주석에서 역추적한 내용이며, 팀이 의도한 전체 맥락과 다를 수 있다.
