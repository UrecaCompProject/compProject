# ai-consult Feature FSD 분리 리팩토링 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `features/ai-consult` 내부를 FSD 원칙에 따라 단일 책임 단위로 분리하여 유지보수성 향상

**Architecture:** 기존 파일들이 여러 책임을 혼합하고 있어, 각 파일이 하나의 명확한 역할만 갖도록 분리. `handleSend`의 quick reply 분기 하드코딩을 라우터 패턴으로 추출하고, 헬퍼·파싱·UI 컴포넌트를 단일 책임 단위로 쪼갬. 외부 인터페이스(index.ts exports)는 변경하지 않아 기존 동작 보존.

**Tech Stack:** React 19, TypeScript, Vite, FSD (Feature-Sliced Design)

**Spec:** 이 계획 자체가 스펙. 기존 코드 동작 100% 보존이 유일한 요구사항.

## Global Constraints

- **외부 인터페이스 불변**: `features/ai-consult/index.ts`의 export 목록과 시그니처 변경 금지
- **동작 보존**: 리팩토링 후 기존 기능이 동일하게 동작해야 함
- **검증 기준**: 테스트 인프라가 없으므로 `npm run build` + `npm run lint` 통과가 검증 기준
- **한글 주석**: 핵심 로직에만 한국어 주석, 자명한 코드에는 주석 없음
- **기존 주석 보존**: 기존 주석은 이동 시 그대로 유지
- **커밋 단위**: 각 Task 완료 후 개별 커밋

## 현재 구조 및 문제점

```
features/ai-consult/
├── api/postQuestion.ts          (168줄) — 파싱 + 폴백 + API 호출 혼재
├── constants/telecomKeywords.ts (55개 키워드)
├── lib/
│   ├── chatHelpers.ts           (142줄) — 7가지 역할 혼재
│   ├── formatResponse.ts        (19줄)  — OK
│   └── preloadLottie.ts         (23줄)  — OK
├── model/
│   ├── useChat.ts               (448줄) — handleSend에 8개 분기 하드코딩 ← 가장 큰 문제
│   ├── useChatCompare.ts        (183줄) — OK
│   ├── useChatReport.ts         (89줄)  — OK
│   └── useChatSubscription.ts   (75줄)  — OK
├── types.ts                     (35줄)  — FSD 관례상 model/ 아래가 적절
├── ui/
│   ├── AIChat.tsx               (29줄)  — OK
│   ├── ChatInput.tsx            (197줄) — 입력 + 메뉴 + 4개 시트 관리 혼재
│   ├── ChatLoadingIndicator.tsx (38줄)  — OK
│   ├── ChatMessageList.tsx      (253줄) — 렌더링 + AIChatExtras + 시트 혼재
│   ├── MyChat.tsx               (7줄)   — OK
│   ├── QuickReplies.tsx         (61줄)  — OK
│   ├── RecommendationCards.tsx  (218줄) — 카드 + 상세 BottomSheet 혼재
│   └── RecommendationForm.tsx   (227줄) — OK (크지만 단일 책임)
└── index.ts                     (19줄)
```

## 목표 구조

```
features/ai-consult/
├── api/
│   └── postQuestion.ts          (~30줄) — API 호출만 담당
├── constants/
│   └── telecomKeywords.ts       (유지)
├── lib/
│   ├── chatHelpers.ts           (~40줄) — buildAIMessage, buildErrorMessage만 잔류
│   ├── formatResponse.ts        (유지)
│   ├── messageFinders.ts        (~25줄) — findLastRecommendedPlan, findLastRecommendations
│   ├── outOfScope.ts            (~30줄) — isOutOfScope, buildOutOfScopeFallback
│   ├── parseUserInput.ts        (~95줄) — parseUserInput + OTT_ALIASES
│   ├── preloadLottie.ts         (유지)
│   ├── quickReplyRouter.ts      (~120줄) — quick reply 분기 라우터 (신규)
│   ├── quizIntent.ts            (~35줄) — getQuizIntent
│   └── welcome.ts               (~20줄) — WELCOME_MESSAGE, getWelcomeQuickReplies
├── model/
│   ├── types.ts                 (이동)  — ChatMessage, MessageType
│   ├── useChat.ts               (~180줄) — 상태 관리 + 라우터 호출만
│   ├── useChatCompare.ts        (유지)
│   ├── useChatReport.ts         (유지)
│   └── useChatSubscription.ts   (유지)
├── ui/
│   ├── AIChat.tsx               (유지)
│   ├── AIChatExtras.tsx         (~95줄) — AI 부가 콘텐츠 렌더링 (분리)
│   ├── ChatInput.tsx            (~80줄) — 입력 필드만
│   ├── ChatLoadingIndicator.tsx (유지)
│   ├── ChatMenuSheet.tsx        (~90줄) — 메뉴 + 바텀시트 관리 (분리)
│   ├── ChatMessageList.tsx      (~120줄) — 메시지 렌더링 + 스크롤만
│   ├── MyChat.tsx               (유지)
│   ├── QuickReplies.tsx         (유지)
│   ├── RecommendationCards.tsx  (~100줄) — 카드 캐러셀만
│   ├── RecommendationDetailSheet.tsx (~110줄) — 상세 BottomSheet (분리)
│   └── RecommendationForm.tsx   (유지)
└── index.ts                     (유지)
```

---

### Task 1: lib/chatHelpers.ts 분리 — welcome, quizIntent, messageFinders 추출

**Files:**

- Create: `src/features/ai-consult/lib/welcome.ts`
- Create: `src/features/ai-consult/lib/quizIntent.ts`
- Create: `src/features/ai-consult/lib/messageFinders.ts`
- Modify: `src/features/ai-consult/lib/chatHelpers.ts`
- Modify: `src/features/ai-consult/index.ts` (필요시 re-export 확인)

**Interfaces:**

- Produces:
  - `welcome.ts`: `WELCOME_MESSAGE` (string), `getWelcomeQuickReplies(isLoggedIn: boolean): string[]`
  - `quizIntent.ts`: `getQuizIntent(message: string): QuizKind | null`
  - `messageFinders.ts`: `findLastRecommendedPlan(messages: ChatMessage[]): RecommendedPlan | null`, `findLastRecommendations(messages: ChatMessage[]): RecommendedPlan[]`
  - `chatHelpers.ts` (잔류): `buildAIMessage`, `buildErrorMessage`, `formatFormSummary`, `buildConversationLog`, `buildRecommendationResult`

- [ ] **Step 1: `lib/welcome.ts` 생성**

`chatHelpers.ts`에서 `WELCOME_MESSAGE`, `getWelcomeQuickReplies`를 이동.

```ts
export const WELCOME_MESSAGE =
  '안녕하세요! AI 요금제 도우미 해리에요.\n\n아래 메뉴에서 원하는 항목을 선택해 주세요.';

export function getWelcomeQuickReplies(isLoggedIn: boolean): string[] {
  return isLoggedIn
    ? [
        '요금제 추천받기',
        '요금제 비교하기',
        '요금제 가입하기',
        '게임 하기',
        '출석체크',
        '기타 상담',
      ]
    : ['회원 가입하기', '요금제 추천받기', '요금제 비교하기', '기타 상담'];
}
```

- [ ] **Step 2: `lib/quizIntent.ts` 생성**

`chatHelpers.ts`에서 `getQuizIntent`를 이동. `QuizKind` 타입 import 추가.

```ts
import type { QuizKind } from '@/features/chat-quiz';

export function getQuizIntent(message: string): QuizKind | null {
  // chatHelpers.ts의 기존 구현 그대로 이동
}
```

- [ ] **Step 3: `lib/messageFinders.ts` 생성**

`chatHelpers.ts`에서 `findLastRecommendedPlan`, `findLastRecommendations`를 이동.

```ts
import type { RecommendedPlan } from '@/shared/lib/aiConsult';
import type { ChatMessage } from '../model/types';

export function findLastRecommendedPlan(
  messages: ChatMessage[],
): RecommendedPlan | null {
  const last = findLastRecommendations(messages);
  return last.length > 0 ? last[0] : null;
}

export function findLastRecommendations(
  messages: ChatMessage[],
): RecommendedPlan[] {
  // 기존 구현 그대로 이동
}
```

- [ ] **Step 4: `chatHelpers.ts`에서 이동된 함수 제거 및 import 정리**

`chatHelpers.ts`에 잔류하는 함수: `buildAIMessage`, `buildErrorMessage`, `formatFormSummary`, `buildConversationLog`, `buildRecommendationResult`, `getErrorMessage` (private).

이동된 함수의 import를 사용하는 모든 파일의 import 경로를 업데이트:

- `useChat.ts`: `WELCOME_MESSAGE`, `getWelcomeQuickReplies` → `../lib/welcome`, `getQuizIntent` → `../lib/quizIntent`, `findLastRecommendedPlan`, `findLastRecommendations` → `../lib/messageFinders`
- `useChatSubscription.ts`: `getWelcomeQuickReplies` → `../lib/welcome`
- `useChatReport.ts`: `buildConversationLog`, `buildRecommendationResult` → `../lib/chatHelpers` (잔류)

- [ ] **Step 5: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0, 기존과 동일한 결과

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "refactor: chatHelpers.ts에서 welcome, quizIntent, messageFinders 분리"
```

---

### Task 2: api/postQuestion.ts 분리 — parseUserInput, outOfScope 추출

**Files:**

- Create: `src/features/ai-consult/lib/parseUserInput.ts`
- Create: `src/features/ai-consult/lib/outOfScope.ts`
- Modify: `src/features/ai-consult/api/postQuestion.ts`

**Interfaces:**

- Produces:
  - `parseUserInput.ts`: `parseUserInput(text: string, prev: ConsultInput): ConsultInput` (+ `OTT_ALIASES` 내부 상수)
  - `outOfScope.ts`: `isOutOfScope(text: string, prevMode?: ChatMode): boolean`, `buildOutOfScopeFallback(isLoggedIn: boolean): ConsultResponse`
  - `postQuestion.ts` (잔류): `postQuestion(text: string, prev: ConsultInput): Promise<{ input: ConsultInput; response: ConsultResponse }>` (~20줄)

- [ ] **Step 1: `lib/parseUserInput.ts` 생성**

`postQuestion.ts`에서 `OTT_ALIASES` 상수와 `parseUserInput` 함수를 이동.

```ts
import type { ConsultInput } from '@/shared/lib/aiConsult';

const OTT_ALIASES: Record<string, string> = {
  // 기존 내용 그대로
};

export function parseUserInput(text: string, prev: ConsultInput): ConsultInput {
  // 기존 구현 그대로 이동
}
```

- [ ] **Step 2: `lib/outOfScope.ts` 생성**

`postQuestion.ts`에서 `isOutOfScope`, `buildOutOfScopeFallback`을 이동.

```ts
import type { ChatMode, ConsultResponse } from '@/shared/lib/aiConsult';
import { TELECOM_KEYWORDS } from '../constants/telecomKeywords';

export function isOutOfScope(text: string, prevMode?: ChatMode): boolean {
  // 기존 구현 그대로
}

export function buildOutOfScopeFallback(isLoggedIn: boolean): ConsultResponse {
  // 기존 구현 그대로
}
```

- [ ] **Step 3: `api/postQuestion.ts` 정리**

`postQuestion` 함수만 잔류. 분리된 함수들을 import.

```ts
import { requestConsult } from '@/shared/lib/aiConsult';
import type { ConsultInput, ConsultResponse } from '@/shared/lib/aiConsult';

import { isOutOfScope, buildOutOfScopeFallback } from '../lib/outOfScope';
import { parseUserInput } from '../lib/parseUserInput';

export async function postQuestion(
  text: string,
  prev: ConsultInput,
): Promise<{ input: ConsultInput; response: ConsultResponse }> {
  const input = parseUserInput(text, prev);
  if (isOutOfScope(text, prev.mode)) {
    return {
      input: { ...input, mode: 'out_of_scope' },
      response: buildOutOfScopeFallback(prev.isLoggedIn ?? false),
    };
  }
  const response = await requestConsult(input);
  return { input, response };
}
```

- [ ] **Step 4: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "refactor: postQuestion.ts에서 parseUserInput, outOfScope 분리"
```

---

### Task 3: types.ts → model/types.ts 이동

**Files:**

- Move: `src/features/ai-consult/types.ts` → `src/features/ai-consult/model/types.ts`
- Modify: 모든 `import type { ChatMessage } from '../types'` → `from '../model/types'` 또는 `from './types'` (model 내부 파일 기준)

**Interfaces:**

- Produces: `model/types.ts` — 기존 `types.ts`와 동일한 내용

- [ ] **Step 1: `model/types.ts` 생성 (내용 이동)**

`types.ts`의 전체 내용을 `model/types.ts`로 복사.

- [ ] **Step 2: 기존 `types.ts` 삭제**

- [ ] **Step 3: 모든 import 경로 업데이트**

검색 대상: `from '../types'`, `from '@/features/ai-consult/types'`
변경:

- `model/` 내부 파일 (`useChat.ts`, `useChatCompare.ts`, `useChatReport.ts`): `from '../types'` → `from './types'`
- `lib/` 내부 파일: `from '../types'` → `from '../model/types'`
- `ui/` 내부 파일: `from '../types'` → `from '../model/types'`
- `index.ts`: `export * from './types'` → `export * from './model/types'`

- [ ] **Step 4: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "refactor: types.ts를 model/types.ts로 이동 (FSD 관례)"
```

---

### Task 4: model/useChat.ts handleSend quick reply 분기 추출 — quickReplyRouter 생성

**Files:**

- Create: `src/features/ai-consult/lib/quickReplyRouter.ts`
- Modify: `src/features/ai-consult/model/useChat.ts`

**목표:** `handleSend` 내 8개 quick reply 분기를 별도 라우터 모듈로 추출하여 `useChat.ts`를 ~180줄로 축소.

**Interfaces:**

- Produces: `quickReplyRouter.ts` — `QuickReplyHandler` 타입과 `routeQuickReply` 함수

**설계:**

`handleSend`의 분기 패턴을 분석하면 두 가지 유형이 있음:

1. **동기 분기** (return void): "다시 시도", "회원 가입하기", "요금제 가입하기", "현재 요금제와 비교", "요금제 비교하기"
2. **비동기 분기** (return Promise): "다른 요금제 보기", "새 조건으로 다시 추천받기", "요금제 추천받기" (재추천 분기)

라우터는 각 분기를 handler 함수로 추출하고, 매칭되는 quick reply가 있으면 처리, 없으면 `null` 반환하여 `handleSend`의 fall-through(일반 postQuestion 호출)로 진행.

```ts
// quickReplyRouter.ts 타입 설계

interface QuickReplyContext {
  text: string;
  messages: ChatMessage[];
  profile: ConsultInput;
  isLoggedIn: boolean;
  effectiveCurrentPlan: string | undefined;
  isLoading: boolean;
  // 콜백들
  setMessages: SetMessages;
  setProfile: (p: ConsultInput) => void;
  setIsLoading: (v: boolean) => void;
  addAIResponse: AddAIResponse;
  openSubscription: (plan: RecommendedPlan | null) => void;
  openSignupChat: () => void;
  startCompareFlow: () => void;
  setPendingComparePlan: (planName: string) => void;
  fetchCompare: (planBName: string, planAName?: string) => Promise<void>;
  startQuiz: (kind: QuizKind, opts?: { includeUserMessage: boolean }) => void;
  retryLastInput: () => void;
}

// 반환: true = 분기 처리됨 (handleSend 종료), false = 매칭 없음 (fall-through)
export type QuickReplyResult = 'handled' | 'continue';

export function routeQuickReply(ctx: QuickReplyContext): QuickReplyResult {
  // 8개 분기 + 퀴즈 의도 감지 처리
  // 매칭되지 않으면 'continue' 반환
}
```

- [ ] **Step 1: `lib/quickReplyRouter.ts` 생성 — 타입 정의 + 동기 분기 추출**

`useChat.ts`의 handleSend에서 다음 분기를 이동:

- "다시 시도" → `retryLastInput()` 호출
- "회원 가입하기" → `openSignupChat()` 호출
- "요금제 가입하기" / "온라인 가입" → 로그인 체크 + `openSubscription()`
- "현재 요금제와 비교" → `findLastRecommendedPlan` + `fetchCompare` 또는 `setPendingComparePlan`
- "요금제 비교하기" → `startCompareFlow()`
- "요금제 추천받기" (재추천 분기) → `findLastRecommendations` 체크 후 분기 메시지
- 퀴즈 의도 → `startQuiz()`

비동기 분기 ("다른 요금제 보기", "새 조건으로 다시 추천받기")도 포함.

- [ ] **Step 2: `useChat.ts` handleSend에서 분기 제거 및 라우터 호출**

```ts
const handleSend = useCallback(
  async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // quick reply 라우터 — 매칭되면 처리 완료, 아니면 fall-through
    const result = routeQuickReply({
      text: trimmed,
      messages,
      profile,
      isLoggedIn,
      effectiveCurrentPlan,
      isLoading,
      setMessages,
      setProfile,
      setIsLoading,
      addAIResponse,
      openSubscription,
      openSignupChat,
      startCompareFlow,
      setPendingComparePlan,
      fetchCompare,
      startQuiz,
      retryLastInput: () => {
        const lastInput = lastUserInputRef.current;
        if (lastInput) {
          lastUserInputRef.current = null;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.type === 'ai' && last.isError) {
              return prev.slice(0, -1);
            }
            return prev;
          });
          handleSend(lastInput);
        }
      },
    });

    if (result === 'handled') return;

    // fall-through: 일반 상담 요청
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', sentence: trimmed },
    ]);
    setInput('');
    lastUserInputRef.current = trimmed;

    setIsLoading(true);
    try {
      const { input: nextProfile, response } = await postQuestion(trimmed, {
        ...profile,
        isLoggedIn,
      });
      addAIResponse(response, nextProfile, nextProfile.mode);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        buildErrorMessage(
          error,
          '요청 중 문제가 발생했어요. 다시 시도해주세요.',
        ),
      ]);
    } finally {
      setIsLoading(false);
    }
  },
  [/* 의존성 배열 정리 */],
);
```

- [ ] **Step 3: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "refactor: handleSend quick reply 분기를 quickReplyRouter로 추출"
```

---

### Task 5: ui/ChatMessageList.tsx에서 AIChatExtras 분리

**Files:**

- Create: `src/features/ai-consult/ui/AIChatExtras.tsx`
- Modify: `src/features/ai-consult/ui/ChatMessageList.tsx`

**Interfaces:**

- Produces: `AIChatExtras.tsx` — 기존 `AIChatExtras` 컴포넌트와 props 인터페이스를 그대로 이동

- [ ] **Step 1: `ui/AIChatExtras.tsx` 생성**

`ChatMessageList.tsx`에서 `AIChatExtrasProps` 인터페이스와 `AIChatExtras` 컴포넌트를 이동.
필요한 import (RecommendationCards, ReportCard, CompareResultSheet, PlanSelector, RecommendationForm)을 새 파일로 이동.

- [ ] **Step 2: `ChatMessageList.tsx`에서 AIChatExtras 제거 및 import 추가**

```ts
import AIChatExtras from './AIChatExtras';
```

`ChatMessageList.tsx`에 잔류: 스크롤 로직, 메시지 렌더링 루프, PlanSubscriptionSheet 렌더링.

- [ ] **Step 3: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "refactor: ChatMessageList에서 AIChatExtras 컴포넌트 분리"
```

---

### Task 6: ui/ChatInput.tsx에서 메뉴/시트 분리 — ChatMenuSheet 생성

**Files:**

- Create: `src/features/ai-consult/ui/ChatMenuSheet.tsx`
- Modify: `src/features/ai-consult/ui/ChatInput.tsx`

**Interfaces:**

- Produces: `ChatMenuSheet.tsx` — 메뉴 아이템 정의 + BottomSheet/RewardSheet/ReportSheet 관리
  - Props: `isMenuOpen: boolean`, `onMenuClose: () => void`, `onStartQuiz?: (quizType: QuizKind) => void`

- [ ] **Step 1: `ui/ChatMenuSheet.tsx` 생성**

`ChatInput.tsx`에서 다음을 이동:

- `ActiveSheet` 타입
- 메뉴 아이템 정의 (마이페이지, 요금제, 혜택/이벤트, 상담 리포트)
- `BottomSheet`, `RewardSheet`, `ReportSheet` 렌더링
- `activeSheet`, `isSheetOpen`, `rewardOpen`, `reportOpen` 상태

```tsx
interface ChatMenuSheetProps {
  isMenuOpen: boolean;
  onMenuClose: () => void;
  onStartQuiz?: (quizType: QuizKind) => void;
}

export default function ChatMenuSheet({
  isMenuOpen,
  onMenuClose,
  onStartQuiz,
}: ChatMenuSheetProps) {
  // 메뉴 아이템 + 시트 관리 로직
}
```

- [ ] **Step 2: `ChatInput.tsx` 정리**

입력 필드 + 전송 버튼 + 메뉴 토글 버튼만 잔류.
`ChatMenuSheet`를 자식 컴포넌트로 렌더링.

```tsx
<ChatMenuSheet
  isMenuOpen={isMenuOpen}
  onMenuClose={() => setIsMenuOpen(false)}
  onStartQuiz={onStartQuiz}
/>
```

- [ ] **Step 3: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "refactor: ChatInput에서 메뉴/시트 관리를 ChatMenuSheet로 분리"
```

---

### Task 7: ui/RecommendationCards.tsx에서 상세 BottomSheet 분리

**Files:**

- Create: `src/features/ai-consult/ui/RecommendationDetailSheet.tsx`
- Modify: `src/features/ai-consult/ui/RecommendationCards.tsx`

**Interfaces:**

- Produces: `RecommendationDetailSheet.tsx` — 추천 요금제 상세 BottomSheet
  - Props: `plan: RecommendedPlan | null`, `open: boolean`, `onOpenChange: (open: boolean) => void`, `onSubscribe: (plan: RecommendedPlan) => void`, `onCompare: (plan: RecommendedPlan) => void`

- [ ] **Step 1: `ui/RecommendationDetailSheet.tsx` 생성**

`RecommendationCards.tsx`에서 `BottomSheet` 렌더링 부분과 `InfoRow` 헬퍼를 이동.

```tsx
interface RecommendationDetailSheetProps {
  plan: RecommendedPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribe: (plan: RecommendedPlan) => void;
  onCompare: (plan: RecommendedPlan) => void;
}

export default function RecommendationDetailSheet({
  plan,
  open,
  onOpenChange,
  onSubscribe,
  onCompare,
}: RecommendationDetailSheetProps) {
  if (!plan) return null;
  // 기존 BottomSheet 내용 이동
}
```

- [ ] **Step 2: `RecommendationCards.tsx` 정리**

카드 캐러셀 + 레포트 생성 버튼만 잔류.
`RecommendationDetailSheet`를 자식으로 렌더링.

```tsx
<RecommendationDetailSheet
  plan={selected}
  open={open}
  onOpenChange={setOpen}
  onSubscribe={handleSubscribe}
  onCompare={handleCompare}
/>
```

- [ ] **Step 3: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 4: 커밋**

```bash
git add -A
git commit -m "refactor: RecommendationCards에서 상세 BottomSheet를 분리"
```

---

### Task 8: 최종 검증 및 index.ts 확인

**Files:**

- Verify: `src/features/ai-consult/index.ts`
- Verify: 모든 import 경로

- [ ] **Step 1: index.ts export 확인**

`index.ts`의 export 목록이 변경 없이 동일한지 확인. 분리된 파일들이 index.ts를 통해 외부에 노출되는지 점검.

- [ ] **Step 2: 전체 빌드 + lint 최종 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0, 기존과 동일한 번들 크기 (분리는 파일 수만 늘리고 번들에는 영향 없음)

- [ ] **Step 3: 파일 크기 비교**

리팩토링 전후 주요 파일 줄 수 비교:

- `useChat.ts`: 448줄 → ~180줄 목표
- `chatHelpers.ts`: 142줄 → ~40줄
- `postQuestion.ts`: 168줄 → ~20줄
- `ChatMessageList.tsx`: 253줄 → ~120줄
- `ChatInput.tsx`: 197줄 → ~80줄
- `RecommendationCards.tsx`: 218줄 → ~100줄

- [ ] **Step 4: 최종 커밋 (변경사항이 있으면)**

```bash
git add -A
git commit -m "refactor: ai-consult FSD 분리 최종 검증"
```
