# useChat.tsx 책임 분리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `src/features/ai-consult/model/useChat.tsx`의 609라인짜리 단일 훅을 상태/요청/액션/인증/게임 등 책임별 작은 훅으로 분리하고, `useChat`은 이들을 조합하는 facade만 남긴다.

**Architecture:** 각 하위 훅은 `useChat`에서 생성/관리하던 한 가지 책임만 담당한다. `useChat`은 분리된 훅을 호출한 뒤 기존 `ChatPage`와의 인터페이스(반환값/핸들러명)를 그대로 유지한다. 이렇게 하면 UI 변경 없이 내부 구조만 정리할 수 있다.

**Tech Stack:** React 19, Zustand, TanStack Query, TypeScript, Vite

**Spec:** 이전 분석에서 도출된 P2 개선항목 — `useChat.tsx` 580+ 라인 분리

## Global Constraints

- React Context API는 인증 상태 전용, Zustand는 UI/전역 클라이언트 상태 전용, TanStack Query는 서버 상태 전용.
- `features/ai-consult/model/` 안에 신규 훅을 추가; 기존 `ChatPage.tsx` 인터페이스는 변경하지 않는다.
- `npm run lint`, `npx tsc -b`, `npm run build`는 반드시 통과해야 함.
- 신규 dependency 추가 금지; 기존 라이브러리만 사용.
- 한국어 코드 주석은 복잡한 비즈니스 규칙/외부 의존성 호출 순서에만 추가.

---

## Task 1: `useChatState` — 메시지/입력/프로필/로딩 상태 분리

**Files:**

- Create: `src/features/ai-consult/model/useChatState.ts`
- Modify: `src/features/ai-consult/model/useChat.tsx` (state useState 제거, useChatState 사용)

**Interfaces:**

- Consumes: `isLoggedIn: boolean`
- Produces: `{ messages, setMessages, input, setInput, profile, setProfile, isLoading, setIsLoading, resetChat, aiResponseCount, canShowReportButton }`

- [ ] **Step 1: `useChatState.ts` 작성**

```ts
import { useCallback, useMemo, useState } from 'react';

import type { ConsultInput } from '@/shared/lib/aiConsult';

import { WELCOME_MESSAGE, getWelcomeQuickReplies } from '../lib/chatHelpers';

import type { ChatMessage } from '../types';

export interface UseChatStateDeps {
  isLoggedIn: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  profile: ConsultInput;
  setProfile: React.Dispatch<React.SetStateAction<ConsultInput>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  resetChat: (options?: { showGreeting?: boolean }) => void;
  aiResponseCount: number;
  canShowReportButton: boolean;
}

export function useChatState({ isLoggedIn }: UseChatStateDeps): ChatState {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      type: 'ai',
      sentence: WELCOME_MESSAGE,
      quickReplies: getWelcomeQuickReplies(isLoggedIn),
    },
  ]);
  const [input, setInput] = useState('');
  const [profile, setProfile] = useState<ConsultInput>({
    mode: 'menu',
    isLoggedIn,
  });
  const [isLoading, setIsLoading] = useState(false);

  const resetChat = useCallback(
    (options?: { showGreeting?: boolean }) => {
      const showGreeting = options?.showGreeting ?? true;
      setMessages(
        showGreeting
          ? [
              {
                id: 0,
                type: 'ai',
                sentence: WELCOME_MESSAGE,
                quickReplies: getWelcomeQuickReplies(isLoggedIn),
              },
            ]
          : [],
      );
      setInput('');
      setProfile({ mode: 'menu', isLoggedIn });
    },
    [isLoggedIn],
  );

  const aiResponseCount = useMemo(
    () => messages.filter((m) => m.type === 'ai' && m.id !== 0).length,
    [messages],
  );

  const lastMessage = messages[messages.length - 1];
  const isAwaitingDetailInput =
    lastMessage?.type === 'ai' &&
    (!!lastMessage.form || !!lastMessage.planCompare);
  const canShowReportButton = aiResponseCount >= 5 && !isAwaitingDetailInput;

  return {
    messages,
    setMessages,
    input,
    setInput,
    profile,
    setProfile,
    isLoading,
    setIsLoading,
    resetChat,
    aiResponseCount,
    canShowReportButton,
  };
}
```

- [ ] **Step 2: `useChat.tsx`에서 state useState 제거**

`useChat`에서 `messages`, `input`, `profile`, `isLoading` 등 상태 useState와 `resetChat`, `aiResponseCount`, `canShowReportButton` 계산을 제거하고 `const state = useChatState({ isLoggedIn });`로 대체. 기존 `ChatMessage` 초기화/리셋/WELCOME 메시지 로직은 `useChatState`로 이동했으므로 중복 제거.

- [ ] **Step 3: Type 검사**

Run: `npx tsc -b`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/features/ai-consult/model/useChatState.ts src/features/ai-consult/model/useChat.tsx
git commit -m "refactor(ai-consult): 채팅 상태 관리를 useChatState로 분리"
```

---

## Task 2: `useChatProfile` — `effectiveCurrentPlan` / `addAIResponse` 분리

**Files:**

- Create: `src/features/ai-consult/model/useChatProfile.ts`
- Modify: `src/features/ai-consult/model/useChat.tsx`

**Interfaces:**

- Consumes: `isLoggedIn`, `messages`, `setMessages`, `profile`, `setProfile`
- Produces: `{ effectiveCurrentPlan, addAIResponse }`

- [ ] **Step 1: `useChatProfile.ts` 작성**

```ts
import { useCallback, useMemo } from 'react';

import { useCurrentPlan } from '@/entities/plan';
import type { ConsultInput, ConsultResponse } from '@/shared/lib/aiConsult';

import { formatResponse } from '../lib/formatResponse';

import type { ChatMessage, MessageCategory } from '../types';

// AI 응답 모드를 리포트 대화 로그 분류용 category로 변환
function modeToCategory(
  mode: ConsultInput['mode'] | undefined,
): MessageCategory | undefined {
  if (mode === 'game') return 'game';
  if (mode === 'attendance') return 'attendance';
  if (mode === 'general') return 'general';
  if (mode === 'recommend' || mode === 'compare' || mode === 'subscribe')
    return 'plan';
  return undefined;
}

export interface UseChatProfileDeps {
  isLoggedIn: boolean;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  profile: ConsultInput;
  setProfile: React.Dispatch<React.SetStateAction<ConsultInput>>;
}

export interface ChatProfile {
  effectiveCurrentPlan: string | undefined;
  addAIResponse: (
    response: ConsultResponse,
    request: ConsultInput,
    defaultMode: ConsultInput['mode'],
  ) => void;
}

export function useChatProfile({
  isLoggedIn,
  setMessages,
  setProfile,
}: UseChatProfileDeps): ChatProfile {
  const { data: currentPlan } = useCurrentPlan(isLoggedIn);

  const effectiveCurrentPlan = useMemo(
    () => profile.currentPlan ?? currentPlan?.planName,
    [profile.currentPlan, currentPlan?.planName],
  );

  const addAIResponse = useCallback(
    (
      response: ConsultResponse,
      request: ConsultInput,
      defaultMode: ConsultInput['mode'],
    ) => {
      const mergedProfile: ConsultInput = {
        ...request,
        mode: response.mode ?? defaultMode,
        isLoggedIn,
      };
      setProfile(mergedProfile);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'ai',
          sentence: formatResponse(response),
          quickReplies: response.quickReplies,
          form: response.form,
          recommendations: response.recommendations,
          compareResult: response.compareResult,
          category: modeToCategory(response.mode ?? defaultMode),
        },
      ]);
    },
    [isLoggedIn, setProfile, setMessages],
  );

  return { effectiveCurrentPlan, addAIResponse };
}
```

(주의: `profile` 매개변수를 deps에 넣지 않는다. `effectiveCurrentPlan`은 `useMemo`에서 `profile.currentPlan`과 `currentPlan?.planName`을 읽고, `addAIResponse`는 외부에서 `request`를 받아 사용하므로 `profile` 객체 전체를 의존할 필요가 없다.)

- [ ] **Step 2: `useChat.tsx`에서 `effectiveCurrentPlan`, `addAIResponse` 로직 제거**

기존 `useChat.tsx` lines 152-158 (`useCurrentPlan` + `effectiveCurrentPlan`)와 lines 122-150 (`addAIResponse`)를 제거하고 `const { effectiveCurrentPlan, addAIResponse } = useChatProfile({ isLoggedIn, setMessages, setProfile });`로 대체. `modeToCategory` 헬퍼도 함께 이동했으므로 `useChat.tsx`에서 제거.

- [ ] **Step 3: Type 검사**

Run: `npx tsc -b`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/features/ai-consult/model/useChatProfile.ts src/features/ai-consult/model/useChat.tsx
git commit -m "refactor(ai-consult): 프로필/현재요금제 로직을 useChatProfile로 분리"
```

---

## Task 3: `useChatAbort` — `AbortController` 및 `handleStop` 분리

**Files:**

- Create: `src/features/ai-consult/model/useChatAbort.ts`
- Modify: `src/features/ai-consult/model/useChat.tsx`

**Interfaces:**

- Consumes: `setIsLoading`
- Produces: `{ startRequest, clearRequest, handleStop }`

- [ ] **Step 1: `useChatAbort.ts` 작성**

```ts
import { useCallback, useRef } from 'react';

export interface UseChatAbortDeps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export interface ChatAbort {
  startRequest: () => AbortSignal;
  clearRequest: (signal?: AbortSignal) => void;
  handleStop: () => void;
}

export function useChatAbort({ setIsLoading }: UseChatAbortDeps): ChatAbort {
  const abortControllerRef = useRef<AbortController | null>(null);

  const startRequest = useCallback(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    return controller.signal;
  }, []);

  const clearRequest = useCallback((signal?: AbortSignal) => {
    if (signal && abortControllerRef.current?.signal !== signal) return;
    abortControllerRef.current = null;
  }, []);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  }, [setIsLoading]);

  return { startRequest, clearRequest, handleStop };
}
```

- [ ] **Step 2: `useChat.tsx`에서 `abortControllerRef`, `startRequest`, `clearRequest`, `handleStop` 제거**

기존 `useChat.tsx` lines 104-120 (`abortControllerRef`, `startRequest`, `clearRequest`)와 lines 507-513 (`handleStop`)을 제거하고 `const { startRequest, clearRequest, handleStop } = useChatAbort({ setIsLoading });`로 대체.

- [ ] **Step 3: Type 검사**

Run: `npx tsc -b`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/features/ai-consult/model/useChatAbort.ts src/features/ai-consult/model/useChat.tsx
git commit -m "refactor(ai-consult): 요청 중단 로직을 useChatAbort로 분리"
```

---

## Task 4: `useChatAuthGate` — 로그인 유도/가입 플로우 분리

**Files:**

- Create: `src/features/ai-consult/model/useChatAuthGate.ts`
- Modify: `src/features/ai-consult/model/useChat.tsx`

**Interfaces:**

- Consumes: `isLoggedIn`, `setMessages`, `aiResponseCount`
- Produces: `{ requireLogin, openSignupChat, hasPromptedLoginRef }` (ref는 `useChat`에서 effect에만 필요)

- [ ] **Step 1: `useChatAuthGate.ts` 작성**

```ts
import { useCallback } from 'react';

import { SigninModal } from '@/features/auth';
import { useModalStore } from '@/shared';

export interface UseChatAuthGateDeps {
  isLoggedIn: boolean;
  setMessages: React.Dispatch<React.SetStateAction<import('../types').ChatMessage[]>>;
}

export interface ChatAuthGate {
  requireLogin: () => void;
  openSignupChat: () => void;
}

export function useChatAuthGate({
  setMessages,
}: UseChatAuthGateDeps): ChatAuthGate {
  const openModal = useModalStore((state) => state.open);

  const openSignupChat = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        type: 'signup',
      },
    ]);
  }, [setMessages]);

  const requireLogin = useCallback(() => {
    openModal({
      title: '회원관리',
      content: <SigninModal onSignupClick={openSignupChat} />,
    });
  }, [openModal, openSignupChat]);

  return { requireLogin, openSignupChat };
}
```

- [ ] **Step 2: `useChat.tsx`에서 `openSignupChat`, `requireLogin` 제거**

기존 `useChat.tsx` lines 264-281 (`openSignupChat`, `requireLogin`)를 제거하고 `const { requireLogin, openSignupChat } = useChatAuthGate({ isLoggedIn, setMessages });`로 대체.

- [ ] **Step 3: `useChat.tsx`의 비로그인 5회 로그인 유도 effect 유지**

해당 effect(lines 563-574)는 `useChat`에 남겨두되 `requireLogin`과 `aiResponseCount`를 사용. `hasPromptedLoginRef`는 `useChat`에 남긴다.

- [ ] **Step 4: Type 검사**

Run: `npx tsc -b`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/ai-consult/model/useChatAuthGate.ts src/features/ai-consult/model/useChat.tsx
git commit -m "refactor(ai-consult): 인증 게이트를 useChatAuthGate로 분리"
```

---

## Task 5: `useChatActions` — `handleSend`, `handleFormSubmit`, `handleRegenerate`, `handleEditMessage` 분리

**Files:**

- Create: `src/features/ai-consult/model/useChatActions.ts`
- Modify: `src/features/ai-consult/model/useChat.tsx`

**Interfaces:**

- Consumes: state + `effectiveCurrentPlan`, `addAIResponse`, `startRequest`, `clearRequest`, `requireLogin`, `openSubscription`, `openSignupChat`, `fetchCompare`, `startQuiz`, `openSheetGame`, `playedTodayGameIds`
- Produces: `{ handleSend, handleFormSubmit, handleRegenerate, handleEditMessage }`

- [ ] **Step 1: `useChatActions.ts` 파일 생성 및 함수 시그니처 작성**

```ts
import { useCallback, useRef } from 'react';

import type { GameId } from '@/features/games';
import type { QuizKind } from '@/features/chat-quiz';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';
import { requestConsult } from '@/shared/lib/aiConsult';
import type { ConsultInput, ConsultResponse } from '@/shared/lib/aiConsult';

import { buildErrorMessage } from '../lib/chatHelpers';
import { routeQuickReply } from '../lib/quickReplyRouter';
import { postQuestion } from '../api/postQuestion';

import type { ChatMessage } from '../types';

export interface UseChatActionsDeps {
  isLoggedIn: boolean;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  profile: ConsultInput;
  setProfile: React.Dispatch<React.SetStateAction<ConsultInput>>;
  effectiveCurrentPlan: string | undefined;
  addAIResponse: (
    response: ConsultResponse,
    request: ConsultInput,
    defaultMode: ConsultInput['mode'],
  ) => void;
  startRequest: () => AbortSignal;
  clearRequest: (signal?: AbortSignal) => void;
  requireLogin: () => void;
  openSubscription: (plan: RecommendedPlan | null) => void;
  openSignupChat: () => void;
  fetchCompare: (planBName: string, planAName?: string) => Promise<void>;
  startQuiz: (kind: QuizKind, reward?: number) => void;
  openSheetGame: (gameId: GameId, reward?: number) => void;
  playedTodayGameIds: Set<string>;
}

export interface ChatActions {
  handleSend: (
    text: string,
    options?: { skipUserMessage?: boolean },
  ) => Promise<void>;
  handleFormSubmit: (
    values: Partial<ConsultInput>,
    summary: string,
  ) => Promise<void>;
  handleRegenerate: () => void;
  handleEditMessage: (messageId: number) => void;
}

export function useChatActions(deps: UseChatActionsDeps): ChatActions {
  // 구현체는 기존 useChat.tsx의 handleSend / handleFormSubmit /
  // handleRegenerate / handleEditMessage 본문을 그대로 이동.
  // lastUserInputRef도 이 훅 내부로 이동.
  ...
}
```

- [ ] **Step 2: 기존 `useChat.tsx`의 액션 함수들 이동**

다음 함수 본문을 `useChatActions.ts` 내부로 복사. 이동한 후 `useChat.tsx`에서는 관련 로컬 변수(`lastUserInputRef` 등)와 함수 선언을 제거.

- `handleSend` — `useChat.tsx` lines 316-437
- `handleFormSubmit` — `useChat.tsx` lines 439-505
- `handleRegenerate` — `useChat.tsx` lines 516-530
- `handleEditMessage` — `useChat.tsx` lines 532-553

(주의: `handleSend` 내부 `routeQuickReply` 호출 시 `setProfile`을 deps에 추가해야 하며, `retryLastInput` 내부의 재귀 `handleSend` 호출은 동일한 `handleSend`를 가리키도록 조정.)

- [ ] **Step 3: `useChat.tsx`에서 `useChatActions` 호출**

`useChat`은 `useChatActions`를 호출하여 `{ handleSend, handleFormSubmit, handleRegenerate, handleEditMessage }`를 받고 반환 객체에 포함.

- [ ] **Step 4: Type 검사**

Run: `npx tsc -b`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/ai-consult/model/useChatActions.ts src/features/ai-consult/model/useChat.tsx
git commit -m "refactor(ai-consult): 메시지 액션 핸들러를 useChatActions로 분리"
```

---

## Task 6: `useChatGames` — 게임/퀴즈/스크래치 관련 로직 분리

**Files:**

- Create: `src/features/ai-consult/model/useChatGames.ts`
- Modify: `src/features/ai-consult/model/useChat.tsx`

**Interfaces:**

- Consumes: `setMessages`, `recordPlay`, `playedTodayGameIds`
- Produces: `{ startScratch, onScratchWin, openSheetGame, closeSheetGame, activeGameMeta, handleQuizFinish }`

- [ ] **Step 1: `useChatGames.ts` 작성**

```ts
import { useCallback } from 'react';

import { useActiveGameMeta, useGameStore, type GameId } from '@/features/games';
import { type QuizKind } from '@/features/chat-quiz';
import { missions, GetBadgeModal } from '@/features/reward';
import { useModalStore } from '@/shared';

import { GAME_LIST } from '../constants/gameList';

import type { ChatMessage } from '../types';

// 스크래치 이벤트 미션의 game_results.game_id
const SCRATCH_MISSION_UUID = missions.find(
  (mission) => mission.id === 'scratch',
)?.uuid;

// 퀴즈 종류별 미션의 game_results.game_id
const QUIZ_MISSION_UUID: Record<QuizKind, string | undefined> = {
  ox: missions.find((mission) => mission.id === 'security-quiz')?.uuid,
  'multiple-choice': missions.find((mission) => mission.id === 'telecom-quiz')
    ?.uuid,
};

export interface UseChatGamesDeps {
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  recordPlay: (params: { gameId: string; score?: number }, options?: { onSuccess?: () => void }) => void;
  playedTodayGameIds: Set<string>;
}

export interface ChatGames {
  startScratch: (reward?: number) => void;
  onScratchWin: (reward: number) => void;
  openSheetGame: (gameId: GameId, reward?: number) => void;
  closeSheetGame: () => void;
  activeGameMeta: ReturnType<typeof useActiveGameMeta>;
  handleQuizFinish: (quizType: QuizKind, rewardCount: number) => void;
}

export function useChatGames({
  setMessages,
  recordPlay,
}: UseChatGamesDeps): ChatGames {
  const openModal = useModalStore((state) => state.open);
  const openGameStore = useGameStore((state) => state.openGame);
  const closeSheetGame = useGameStore((state) => state.closeGame);
  const activeGameMeta = useActiveGameMeta();

  const startScratch = useCallback(
    (reward?: number) => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: 'user', sentence: '스크래치 이벤트 할래' },
        {
          id: Date.now() + 1,
          type: 'ai',
          sentence: '네, 스크래치 이벤트를 진행하겠습니다.',
        },
        { id: Date.now() + 2, type: 'scratch-game', reward },
      ]);
    },
    [setMessages],
  );

  const onScratchWin = useCallback(
    (reward: number) => {
      if (!SCRATCH_MISSION_UUID) return;
      recordPlay({ gameId: SCRATCH_MISSION_UUID, score: reward });
    },
    [recordPlay],
  );

  const openSheetGame = useCallback(
    (gameId: GameId, reward?: number) => {
      const gameMeta = GAME_LIST.find((g) => g.id === gameId);
      const missionUuid = gameMeta?.missionUuid;
      openGameStore(gameId, {
        reward,
        source: 'chat',
        onWin: (wonReward) => {
          if (!missionUuid) return;
          recordPlay(
            { gameId: missionUuid, score: wonReward },
            {
              onSuccess: () => {
                openModal({
                  content: <GetBadgeModal badgeCount={wonReward} />,
                });
              },
            },
          );
        },
      });
    },
    [openGameStore, recordPlay, openModal],
  );

  const handleQuizFinish = useCallback(
    (quizType: QuizKind, rewardCount: number) => {
      const gameId = QUIZ_MISSION_UUID[quizType];
      if (gameId) {
        recordPlay({ gameId, score: rewardCount });
      }
      openModal({ content: <GetBadgeModal badgeCount={rewardCount} /> });
    },
    [recordPlay, openModal],
  );

  return {
    startScratch,
    onScratchWin,
    openSheetGame,
    closeSheetGame,
    activeGameMeta,
    handleQuizFinish,
  };
}
```

(주의: `recordPlay`의 실제 타입은 `useMissionCompletion`이 반환하는 `recordPlay` 시그니처와 일치해야 한다. 필요하면 `ChatGames` 인터페이스의 `recordPlay` 타입을 실제 `typeof recordPlayMutation.mutate`로 조정.)

- [ ] **Step 2: `useChat.tsx`에서 게임 관련 로직 제거**

기존 `useChat.tsx` lines 39-49 (`SCRATCH_MISSION_UUID`, `QUIZ_MISSION_UUID`), lines 83-92 (`handleQuizFinish`), lines 238-262 (`startScratch`, `onScratchWin`), lines 291-314 (`openSheetGame`), lines 284-287 (`openGameStore`, `closeSheetGame`, `activeGameMeta`)를 제거하고 `const games = useChatGames({ setMessages, recordPlay, playedTodayGameIds });`로 대체.

- [ ] **Step 3: `useChat`에서 `useChatQuiz`에 `handleQuizFinish` 연결**

```ts
const quiz = useChatQuiz({ setMessages, onQuizFinish: games.handleQuizFinish });
```

- [ ] **Step 4: Type 검사**

Run: `npx tsc -b`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/ai-consult/model/useChatGames.ts src/features/ai-consult/model/useChat.tsx
git commit -m "refactor(ai-consult): 게임/퀴즈 로직을 useChatGames로 분리"
```

---

## Task 7: `useChat.tsx` facade 정리 및 반환 인터페이스 동결

**Files:**

- Modify: `src/features/ai-consult/model/useChat.tsx`

**Interfaces:**

- `useChat`의 반환값은 기존과 동일해야 함. `ChatPage.tsx`가 구조분해하는 필드명을 변경하지 않는다.

- [ ] **Step 1: `useChat.tsx`를 orchestrator로 축소**

`useChat`은 아래 순서로 하위 훅을 호출하고 반환값을 조합.

```ts
export function useChat() {
  const isLoggedIn = useIsLoggedIn();
  const state = useChatState({ isLoggedIn });
  const { effectiveCurrentPlan, addAIResponse } = useChatProfile({
    isLoggedIn,
    messages: state.messages,
    setMessages: state.setMessages,
    profile: state.profile,
    setProfile: state.setProfile,
  });
  const { startRequest, clearRequest, handleStop } = useChatAbort({
    setIsLoading: state.setIsLoading,
  });
  const { requireLogin, openSignupChat } = useChatAuthGate({
    isLoggedIn,
    setMessages: state.setMessages,
  });
  const { recordPlay, playedTodayGameIds } = useMissionCompletion();
  const games = useChatGames({
    setMessages: state.setMessages,
    recordPlay,
    playedTodayGameIds,
  });
  const quiz = useChatQuiz({
    setMessages: state.setMessages,
    onQuizFinish: games.handleQuizFinish,
  });
  const {
    subscriptionOpen,
    subscriptionPlan,
    openSubscription,
    closeSubscription,
    handleSignupFinished,
  } = useChatSubscription({ isLoggedIn, setMessages: state.setMessages });
  const { fetchCompare, handlePlanCompare } = useChatCompare({
    profile: state.profile,
    isLoggedIn,
    effectiveCurrentPlan,
    isLoading: state.isLoading,
    setIsLoading: state.setIsLoading,
    setMessages: state.setMessages,
    addAIResponse,
    startRequest,
    clearRequest,
  });
  const { isGeneratingReport, handleGenerateReport } = useChatReport({
    messages: state.messages,
    effectiveCurrentPlan,
    userProfile: state.profile,
    isLoading: state.isLoading,
    setIsLoading: state.setIsLoading,
    setMessages: state.setMessages,
    resetChat: state.resetChat,
    startRequest,
    clearRequest,
  });
  const actions = useChatActions({
    isLoggedIn,
    isLoading: state.isLoading,
    setIsLoading: state.setIsLoading,
    messages: state.messages,
    setMessages: state.setMessages,
    input: state.input,
    setInput: state.setInput,
    profile: state.profile,
    setProfile: state.setProfile,
    effectiveCurrentPlan,
    addAIResponse,
    startRequest,
    clearRequest,
    requireLogin,
    openSubscription,
    openSignupChat,
    fetchCompare,
    startQuiz: quiz.startQuiz,
    openSheetGame: games.openSheetGame,
    playedTodayGameIds,
  });

  // 비로그인 5회 대화 시 로그인 유도 effect는 useChat에 남김
  const hasPromptedLoginRef = useRef(false);
  useEffect(() => {
    if (isLoggedIn) {
      hasPromptedLoginRef.current = false;
      return;
    }
    if (state.aiResponseCount >= 5 && !hasPromptedLoginRef.current) {
      hasPromptedLoginRef.current = true;
      requireLogin();
    }
  }, [isLoggedIn, state.aiResponseCount, requireLogin]);

  return {
    messages: state.messages,
    input: state.input,
    setInput: state.setInput,
    isLoading: state.isLoading,
    isGeneratingReport,
    canShowReportButton: state.canShowReportButton,
    handleSend: actions.handleSend,
    handleStop,
    handleRegenerate: actions.handleRegenerate,
    handleEditMessage: actions.handleEditMessage,
    handleSignupFinished,
    openSignupChat,
    handleFormSubmit: actions.handleFormSubmit,
    handleGenerateReport,
    handlePlanCompare,
    fetchCompare,
    profile: state.profile,
    subscriptionOpen,
    subscriptionPlan,
    openSubscription,
    closeSubscription,
    isLoggedIn,
    startQuiz: quiz.startQuiz,
    startScratch: games.startScratch,
    onScratchWin: games.onScratchWin,
    answerOx: quiz.answerOx,
    selectMultipleChoice: quiz.selectMultipleChoice,
    confirmMultipleChoice: quiz.confirmMultipleChoice,
    closeSheetGame: games.closeSheetGame,
    activeGameMeta: games.activeGameMeta,
    playedTodayGameIds,
  };
}
```

(주의: `playedTodayGameIds`는 `ChatPage`에서 구조분해하지 않지만, 기존 `useChat`이 반환했으므로 하위 호환을 위해 그대로 포함. 실제로는 `useChatActions`/`useChatGames` 내부에서만 사용.)

- [ ] **Step 2: `useChat.tsx`에서 불필요한 import/주석 정리**

`useChat.tsx`에 더 이상 사용되지 않는 import, 로컬 함수, `modeToCategory` 등을 제거. 파일 라인 수를 150줄 이하로 만든다.

- [ ] **Step 3: Build & Lint**

Run: `npm run lint`
Expected: PASS

Run: `npx tsc -b`
Expected: PASS

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/features/ai-consult/model/useChat.tsx
git commit -m "refactor(ai-consult): useChat을 하위 훅 조합 façade로 정리"
```

---

## Task 8: E2E 검증

**Files:**

- Run: `e2e/03-general-consult.spec.ts` (최소)
- Run: `e2e/02-signup-and-subscribe.spec.ts` (선택)

- [ ] **Step 1: 개발 서버 실행 또는 mock 모드로 E2E**

```bash
# mock 모드
$env:VITE_USE_MOCK="true"
npx vite --port 5173
```

(또는 `npm run dev`)

- [ ] **Step 2: E2E 실행**

```bash
npx playwright test e2e/03-general-consult.spec.ts
```

Expected: PASS (기존과 동일한 동작)

- [ ] **Step 3: Commit**

E2E 결과가 통과하면 별도 커밋은 필요 없음. 실패 시 관련 훅을 재검증.

---

## Global Verification

- [ ] **Step 1: 최종 정적 검사**

```bash
npm run lint
npx tsc -b
npm run build
```

- [ ] **Step 2: 파일 크기 확인**

Run: `wc -l src/features/ai-consult/model/useChat.tsx`
Expected: 150줄 이하

- [ ] **Step 3: grep으로 facade 외 public API 변화 확인**

```bash
grep -n "export function useChat" src/features/ai-consult/model/useChat.tsx
grep -n "function App" src/pages/ChatPage.tsx  # ChatPage import/useChat() 호출 unchanged
```

---

## Out of Scope / 후속 권고

- `useChat`이 여전히 `features/reward`, `features/games`, `features/auth`, `features/chat-quiz`를 import하므로 FSD feature 간 교차 의존은 별도 단계에서 해결.
- `useChatActions`가 여전히 `handleSend` 하나에 많은 책임을 갖고 있음. 이후 `routeQuickReply` 분기와 `postQuestion` fall-through를 `useChatRouter`/`useChatConsult`로 더 분리 가능.
- `useGameStore` 모듈 레벨 타이머 개선은 별도 P3.
