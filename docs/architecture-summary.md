# 에피라(Ephyra) 프로젝트 기술 분석 — 요약본

> 상세 분석은 `architecture-analysis.md` 참조. 본 문서는 한눈에 보는 요약.

## 한 줄 요약

React 19 + Vite 단일 채팅 SPA가 Supabase BaaS(Auth·PostgreSQL+RLS·Edge Function) 위에서 OpenAI API로 통신 요금제를 추천·비교·가입·리워드까지 한 흐름에 처리하는 BaaS 중심 아키텍처.

## 1. 아키텍처 구조

- **FSD(Feature-Sliced Design)** 6레이어: `app > pages > widgets > features > entities > shared`, 단방향 의존(역방향 없음).
- **Provider 중첩**: `QueryProvider > AuthProvider > App` — 서버 상태 캐시가 인증 의존 쿼리의 enabled를 받도록 순서 설계.
- **BaaS 단일 스택**: 백엔드 서버 없음. Supabase Auth(JWT·Kakao OAuth) + PostgreSQL 17(RLS 전 테이블) + Edge Function(Deno, AI 호출만).
- **DB**: 11개 도메인 그룹 / 20+ 테이블. `users.id → auth.users` 1:1. 채팅 메시지는 DB 미저장(레포트만 저장).

## 2. 핵심 기능 구현

| 기능            | 핵심 구현                                                                           |
| --------------- | ----------------------------------------------------------------------------------- |
| AI 추천         | 코드 필터(후보 5개) → LLM 선택(상위 3) → LLM 사유 생성. 하이브리드로 환각·비용 절감 |
| LLM 환각 방지   | `sanitizeRecommendations`가 실제 데이터로 보정 + 코드 fallback 사유                 |
| 안전 JSON 파싱  | `safeJsonParse`가 마크다운 코드 블록 제거 + 부분 슬라이스 복구                      |
| 요금제 비교     | `useChatCompare` 2단계 상태 머신(현재→대상 선택), LLM + 코드 fallback               |
| 레포트 생성     | 대화 로그 직렬화 → Edge Function → DB 저장 후 채팅 초기화                           |
| 리워드·게임     | Zustand 게임 store + TanStack Query 미션 완료, useRef로 중복 적립 차단              |
| 비로그인 게이팅 | 5회 대화 후 로그인 모달 유도                                                        |
| 퀵 리플라이     | `routeQuickReply`가 AI 호출 없이 로컬 분기(비용·지연 절감)                          |

## 3. 트러블슈팅 (git·코드에서 역추적)

- react-router 제거 → 단일 ChatPage 전환 / `current_plans` 406 수정 / 비로그인 5회 게이팅 / 보상 랜덤화 / 비교 컴포넌트 빈 상태 보완 / 로그아웃 세션 정리 / 가입 step 2 제거 / 말풍선 줄바꿈·여백 / 바코드 모달 스크롤 / AbortController 경쟁 상태 방지 / 게임 중복 적립 차단 / LLM 환각 보정 / JSON 코드 블록 복구.

## 4. 기술 선택 이유

- **Supabase 단일**: 백엔드 운영 비용 절감, RLS로 선언적 보안.
- **LangChain 미사용**: OpenAI 직접 fetch(47줄) — Deno 환경 의존성 최소·제어권.
- **하이브리드 추천**: 코드 필터 + LLM 선택으로 토큰·지연·환각 동시 절감.
- **단일 ChatPage**: 채팅 중심 서비스에 라우팅 오버헤드 제거.

## 5. 기술적 딜레마 & 개선

1. **채팅 메시지 DB 미저장** → 새로고침 손실(현재 모달로 우회). 개선: sessionStorage 백업 또는 세션 테이블 재도입.
2. **useChat 627줄 허브 훅 비대** → 12개 도메인 조율, 의존성 20+. 개선: Zustand 채팅 store 분리 또는 useReducer 통합.
3. **LLM 환각 vs 품질** → 코드 보정은 안전하지만 fallback 문구 건조. 개선: 템플릿 다양화·품질 메트릭.
4. **Edge Function `@ts-nocheck`** → 타입 안전성 포기. 개선: Deno 타입 보강 후 점진 제거.
5. **단일 Edge Function 집중** → 추천·비교·레포트·Quick Reply 모두. 개선: 기능별 분리.

## 6. 상태관리 3종 + 딜레마

| 도구           | 담당                     | 특징                                       |
| -------------- | ------------------------ | ------------------------------------------ |
| React Context  | 인증 세션                | 전역·드문 변화·Provider 생명주기 일치      |
| TanStack Query | 서버 상태(15개 파일)     | 캐싱·무효화·enabled 게이팅·mutation 동기화 |
| Zustand        | 클라이언트 UI(4개 store) | 모달·가입 의도·게임 시트·구독 요금제       |

**4번째 사실상 상태 — useChat 로컬 useState/useRef**: 채팅 메시지·프로필·로딩·중단 컨트롤러. DB 미저장 결정으로 TanStack Query 이관이 애매하고 Zustand 이관은 도메인 로직 응집을 깰 수 있는 딜레마.

**딜레마 해소 방안**:

- **A(추천)**: Zustand 채팅 store 도입 + sessionStorage persist → 재렌더 최적화 + 새로고침 복구 동시 해결.
- **B**: useReducer 통합 → 전이 선언화(새로고침 복구는 별도).
- **C(최소 변경)**: messages ref화로 handleSend 재생성 최적화 + sessionStorage 백업.

**특징적 코드**:

- `useModalStore`: 전역 단일 모달 — 중첩 z-index 경쟁 원천 차단.
- `useSignupIntentStore`: 전역 상태를 "이벤트 신호"로 써 크로스 컴포넌트 의도 전달(17줄).
- `useGameStore`: `source` 추적으로 종료 후 돌아갈 시트 결정 + 모듈 스코프 타이머.
- `useSubscriptionStore`: Zustand 안에서 비동기 서버 호출 → TanStack Query와 중복 캐시 딜레마(통일 권장).
- `useMissionCompletion`: useRef Set + TanStack Query 결합으로 동시 다발 onWin 중복 적립 차단.
- `useCurrentPlan`: `enabled: isLoggedIn`으로 인증 Context가 쿼리 실행 조건으로 직결.
- `AuthProvider`: getSession + onAuthStateChange 구독, useMemo로 value 안정화.

## 검증 증거

- codebase-memory: 1632 nodes / 3885 edges, 레이어 7·경계 8·클러스터 12.
- TanStack Query 15개 파일 / Zustand 4개 store / git 40커밋 역추적 / DB 마이그레이션 9개.
