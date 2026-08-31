# 게임 시작 수정 — 퀵 리플라이 게임 리스트 연결 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "게임 하기" 퀵 리플라이를 채팅 내 게임 리스트로 연결하고, 채팅 게임(OX 퀴즈, 에피라 퀴즈, 스크래치)과 바텀시트 게임(카드 맞추기, 반응속도, 출석 룰렛)을 분기하여 실행한다.

**Architecture:** 기존 컴포넌트(ScratchGame, useChatQuiz, useGameStore, GameLayer)를 import하여 재활용. 새 메시지 타입(game-list, scratch-game)을 ChatMessage에 추가하고, quickReplyRouter에 "게임 하기" 분기를 추가하여 게임 리스트 메시지를 채팅에 표시. 게임 선택 시 채팅 게임은 채팅 메시지로, 바텀시트 게임은 useGameStore.openGame으로 분기.

**Tech Stack:** React 19, TypeScript, FSD (Feature-Sliced Design), Zustand (useGameStore), vaul (BottomSheet)

**Spec:** QA 피드백 — "게임 시작 수정: 퀵 리플라이에 게임 시작 → 게임 리스트들 보여주는 걸로 수정. OX 퀴즈, 에피라 퀴즈, 스크래치는 채팅에 보여주기. 카드 맞추기, 반응속도 탭 게임, 출석 룰렛은 바텀시트에서 보여주기. 게임 설명 보기 → 채팅에서 진행하는 게임만 채팅 내에서 설명 글을 주고 바로 게임 시작하게 하기."

## Global Constraints

- **기존 컴포넌트 재활용**: ScratchGame, useChatQuiz, useGameStore, GameLayer, BottomSheet 등 기존 컴포넌트는 import하여 사용. 내부 로직 수정 금지.
- **기존 파일 수정 최소화**: 기능 연결을 위한 최소한의 수정만 허용 (타입 확장, 분기 추가, 렌더링 추가, props 전달).
- **검증 기준**: 테스트 인프라가 부족하므로 `npm run build` + `npm run lint` 통과가 검증 기준.
- **한글 주석**: 핵심 로직에만 한국어 주석, 자명한 코드에는 주석 없음.
- **커밋 단위**: 각 Task 완료 후 개별 커밋.
- **FSD 준수**: 새 파일은 ai-consult feature 내에 배치.

## 현재 구조 및 게임 현황

```
게임 분류:
├── 채팅에서 진행 (chat-quiz feature)
│   ├── ox (보안 OX 퀴즈) — useChatQuiz.startQuiz('ox')
│   └── multiple-choice (통신 상식 퀴즈) — useChatQuiz.startQuiz('multiple-choice')
│
├── 바텀시트에서 진행 (games feature, GameLayer)
│   ├── card-match (카드 맞추기) — useGameStore.openGame('card-match')
│   ├── reaction (반응속도 탭 게임) — useGameStore.openGame('reaction')
│   └── attendance (출석 룰렛) — useGameStore.openGame('attendance')
│
└── 스크래치 (games feature, 현재 GameLayer용)
    └── scratch — 채팅으로 이동 필요 (ScratchGame 컴포넌트 재활용)
```

**현재 "게임 하기" 처리:** quickReplyRouter에서 처리하지 않음 → postQuestion으로 fall-through (AI가 응답). 게임이 연결되지 않은 상태.

**현재 "출석체크" 처리:** quickReplyRouter에서 처리하지 않음 → postQuestion으로 fall-through.

## 목표 구조

```
features/ai-consult/
├── constants/
│   └── gameList.ts                  (신규) — 게임 메타데이터 (id, title, type, icon, description)
├── lib/
│   └── gameRouter.ts                (신규) — 게임 선택 시 채팅/바텀시트 분기 로직
├── types.ts                         (수정) — ChatMessage에 game-list, scratch-game 타입 추가
├── lib/quickReplyRouter.ts          (수정) — "게임 하기" 분기 추가
├── ui/
│   ├── GameListMessage.tsx          (신규) — 채팅 내 게임 리스트 렌더링
│   ├── ScratchGameMessage.tsx       (신규) — ScratchGame을 채팅 메시지로 래핑
│   └── ChatMessageList.tsx          (수정) — 새 메시지 타입 렌더링 추가
├── model/useChat.ts                 (수정) — 게임 시작 핸들러 추가
├── index.ts                         (수정) — 새 타입 export
└── (pages/ChatPage.tsx)             (수정) — GameLayer 추가, 게임 관련 props 전달
```

---

### Task 1: 게임 메타데이터 상수 생성

**Files:**

- Create: `src/features/ai-consult/constants/gameList.ts`

**Interfaces:**

- Produces: `GAME_LIST` 배열, `ChatGameId` 타입, `SheetGameId` 타입, `GameMeta` 타입

- [ ] **Step 1: `constants/gameList.ts` 생성**

게임 리스트 메타데이터. 채팅에서 진행하는 게임과 바텀시트에서 진행하는 게임을 구분.

```ts
import type { GameId } from '@/features/games';
import type { QuizKind } from '@/features/chat-quiz';

// 채팅 내에서 진행되는 게임 — 퀴즈는 useChatQuiz, 스크래치는 ScratchGame 컴포넌트
export type ChatGameId = 'ox' | 'multiple-choice' | 'scratch';

// 바텀시트(GameLayer)에서 진행되는 게임 — useGameStore.openGame으로 실행
export type SheetGameId = GameId; // 'card-match' | 'reaction' | 'attendance'

export type GameMeta = {
  id: ChatGameId | SheetGameId;
  title: string;
  description: string;
  type: 'chat' | 'sheet';
  icon: string; // lucide-react 아이콘 이름
  reward?: number;
};

// 채팅에서 진행하는 게임의 퀴즈 타입 매핑
export const CHAT_GAME_TO_QUIZ: Partial<Record<ChatGameId, QuizKind>> = {
  ox: 'ox',
  'multiple-choice': 'multiple-choice',
};

export const GAME_LIST: GameMeta[] = [
  {
    id: 'ox',
    title: '보안 OX 퀴즈',
    description: '보안 상식 OX 퀴즈를 풀고 배지를 받아요',
    type: 'chat',
    icon: 'ShieldCheck',
    reward: 1,
  },
  {
    id: 'multiple-choice',
    title: '통신 상식 퀴즈',
    description: '통신 상식 사지선다 퀴즈를 풀고 배지를 받아요',
    type: 'chat',
    icon: 'HelpCircle',
    reward: 1,
  },
  {
    id: 'scratch',
    title: '스크래치 이벤트',
    description: '스크래치 카드를 긁어 배지를 받아요',
    type: 'chat',
    icon: 'Sparkles',
    reward: 3,
  },
  {
    id: 'card-match',
    title: '카드 맞추기',
    description: '같은 그림의 카드를 찾아 배지를 받아요',
    type: 'sheet',
    icon: 'LayoutGrid',
    reward: 5,
  },
  {
    id: 'reaction',
    title: '반응속도 탭 게임',
    description: '10초에 가까운 타이밍에 탭해 배지를 받아요',
    type: 'sheet',
    icon: 'Timer',
    reward: 5,
  },
  {
    id: 'attendance',
    title: '출석 룰렛',
    description: '출석하고 룰렛을 돌려 혜택을 받아요',
    type: 'sheet',
    icon: 'Gift',
    reward: 5,
  },
];

// 게임 설명 — 채팅에서 진행하는 게임만 설명 제공
export const GAME_INTRO: Record<ChatGameId, string> = {
  ox: '보안 OX 퀴즈를 시작할게요!\nO 또는 X를 선택해 주세요. 정답 여부와 해설이 바로 표시돼요.',
  'multiple-choice':
    '통신 상식 퀴즈를 시작할게요!\n보기 중 정답을 선택하고 확인 버튼을 눌러주세요.',
  scratch: '스크래치 이벤트를 시작할게요!\n카드를 긁어서 배지를 받아보세요.',
};
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: exit code 0 (아직 import하는 곳이 없으므로 unused export 경고는 없음)

- [ ] **Step 3: 커밋**

```bash
git add src/features/ai-consult/constants/gameList.ts
git commit -m "feat: 게임 리스트 메타데이터 상수 추가"
```

---

### Task 2: ChatMessage 타입 확장 — game-list, scratch-game 추가

**Files:**

- Modify: `src/features/ai-consult/types.ts`

**Interfaces:**

- Produces: `GameListMessage`, `ScratchGameMessage` 타입 (ChatMessage union에 추가)

- [ ] **Step 1: types.ts에 새 메시지 타입 추가**

`ChatMessage` union에 두 가지 새 타입 추가:

1. `game-list` — 게임 리스트를 채팅에 표시. 사용자가 항목을 선택하면 콜백 호출.
2. `scratch-game` — ScratchGame 컴포넌트를 채팅 메시지로 렌더링.

```ts
// 파일 상단 import에 추가
import type { ChatGameId, SheetGameId } from './constants/gameList';

// MessageType에 추가
export type MessageType =
  | 'ai'
  | 'user'
  | 'signup'
  | 'quiz-question'
  | 'quiz-result'
  | 'game-list'
  | 'scratch-game';

// ChatMessage union 끝에 추가
export type ChatMessage =
  | {/* 기존 ai 메시지 */}
  | { id: number; type: 'user'; sentence: string }
  | { id: number; type: 'signup' }
  | QuizQuestionMessage
  | QuizResultMessage
  // 게임 리스트 — "게임 하기" 퀵 리플라이 시 표시
  | {
      id: number;
      type: 'game-list';
    }
  // 스크래치 게임 — 채팅 내에서 ScratchGame 컴포넌트 렌더링
  | {
      id: number;
      type: 'scratch-game';
      reward?: number;
    };
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: exit code 0

- [ ] **Step 3: 커밋**

```bash
git add src/features/ai-consult/types.ts
git commit -m "feat: ChatMessage에 game-list, scratch-game 타입 추가"
```

---

### Task 3: GameListMessage 컴포넌트 생성

**Files:**

- Create: `src/features/ai-consult/ui/GameListMessage.tsx`

**Interfaces:**

- Consumes: `GAME_LIST`, `GameMeta` from `../constants/gameList`
- Produces: `GameListMessage` 컴포넌트 — props: `onSelectGame: (gameId: ChatGameId | SheetGameId) => void`

- [ ] **Step 1: `ui/GameListMessage.tsx` 생성**

게임 리스트를 채팅 메시지로 렌더링. 각 항목은 아이콘, 제목, 설명, "시작" 버튼으로 구성. 기존 `shared/ui` 컴포넌트(Card, Button, IconBadge)를 재활용.

```tsx
import * as LucideIcons from 'lucide-react';

import { Button, Card } from '@/shared';

import { GAME_LIST } from '../constants/gameList';
import type { ChatGameId, SheetGameId } from '../constants/gameList';

interface GameListMessageProps {
  onSelectGame: (gameId: ChatGameId | SheetGameId) => void;
}

// lucide-react 아이콘을 이름으로 동적 참조
function getIcon(name: string) {
  const Icon = (
    LucideIcons as Record<string, React.ComponentType<{ size?: number }>>
  )[name];
  return Icon ?? LucideIcons.Gamepad2;
}

export default function GameListMessage({
  onSelectGame,
}: GameListMessageProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-medium-14-130 text-fg-secondary">
        원하는 게임을 선택해 주세요!
      </div>
      {GAME_LIST.map((game) => {
        const Icon = getIcon(game.icon);
        return (
          <Card key={game.id} className="flex items-center gap-3 p-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
              <Icon size={22} />
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="text-semibold-14-130 text-fg-primary">
                {game.title}
              </div>
              <div className="text-medium-12-130 text-fg-tertiary">
                {game.description}
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              round
              onClick={() => onSelectGame(game.id)}
            >
              시작
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: exit code 0

- [ ] **Step 3: 커밋**

```bash
git add src/features/ai-consult/ui/GameListMessage.tsx
git commit -m "feat: GameListMessage 컴포넌트 추가 — 채팅 내 게임 리스트"
```

---

### Task 4: ScratchGameMessage 컴포넌트 생성

**Files:**

- Create: `src/features/ai-consult/ui/ScratchGameMessage.tsx`

**Interfaces:**

- Consumes: `ScratchGame` from `@/features/games` (기존 컴포넌트 재활용)
- Produces: `ScratchGameMessage` 컴포넌트 — props: `reward?: number`, `onWin?: (reward: number) => void`, `onClose?: () => void`

- [ ] **Step 1: `ui/ScratchGameMessage.tsx` 생성**

기존 `ScratchGame` 컴포넌트를 채팅 메시지 컨테이너에 맞게 래핑. ScratchGame의 내부 로직은 수정하지 않고 props만 전달.

```tsx
import { ScratchGame } from '@/features/games';

interface ScratchGameMessageProps {
  reward?: number;
  onWin?: (reward: number) => void;
  onClose?: () => void;
}

// ScratchGame을 채팅 메시지로 렌더링하기 위한 래퍼
// 기존 ScratchGame 컴포넌트를 그대로 재사용하며 내부 로직은 수정하지 않음
export default function ScratchGameMessage({
  reward,
  onWin,
  onClose,
}: ScratchGameMessageProps) {
  return (
    <div className="flex justify-center py-2">
      <ScratchGame reward={reward} onWin={onWin} onClose={onClose} />
    </div>
  );
}
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: exit code 0

- [ ] **Step 3: 커밋**

```bash
git add src/features/ai-consult/ui/ScratchGameMessage.tsx
git commit -m "feat: ScratchGameMessage 컴포넌트 추가 — 채팅 내 스크래치"
```

---

### Task 5: gameRouter — 게임 선택 분기 로직 생성

**Files:**

- Create: `src/features/ai-consult/lib/gameRouter.ts`

**Interfaces:**

- Consumes: `GAME_LIST`, `CHAT_GAME_TO_QUIZ`, `GAME_INTRO` from `../constants/gameList`
- Produces: `handleGameSelect` 함수 — 게임 ID를 받아 채팅 게임/바텀시트 게임으로 분기

- [ ] **Step 1: `lib/gameRouter.ts` 생성**

게임 선택 시 처리 로직을 하나의 함수로 추출. 채팅 게임(ox, multiple-choice)은 startQuiz 호출, 스크래치는 스크래치 메시지 추가, 바텀시트 게임은 openGame 호출.

```ts
import type { QuizKind } from '@/features/chat-quiz';
import type { GameId } from '@/features/games';

import {
  CHAT_GAME_TO_QUIZ,
  GAME_INTRO,
  GAME_LIST,
} from '../constants/gameList';
import type { ChatGameId, SheetGameId } from '../constants/gameList';
import type { ChatMessage } from '../types';

type SetMessages = React.Dispatch<React.SetStateAction<ChatMessage[]>>;

export interface GameSelectContext {
  setMessages: SetMessages;
  startQuiz: (kind: QuizKind, opts?: { includeUserMessage: boolean }) => void;
  openSheetGame: (gameId: GameId, reward?: number) => void;
}

// 게임 리스트에서 항목 선택 시 호출 — 채팅 게임과 바텀시트 게임을 분기
export function handleGameSelect(
  gameId: ChatGameId | SheetGameId,
  ctx: GameSelectContext,
): void {
  const game = GAME_LIST.find((g) => g.id === gameId);
  if (!game) return;

  // 채팅에서 진행하는 게임 — 설명 메시지 후 바로 시작
  if (game.type === 'chat') {
    handleChatGame(gameId as ChatGameId, game.reward, ctx);
    return;
  }

  // 바텀시트에서 진행하는 게임 — GameLayer로 열기
  ctx.openSheetGame(gameId as GameId, game.reward);
}

// 채팅 게임 처리 — 설명 메시지를 채팅에 추가 후 게임 시작
function handleChatGame(
  gameId: ChatGameId,
  reward: number | undefined,
  ctx: GameSelectContext,
): void {
  const intro = GAME_INTRO[gameId];
  const quizKind = CHAT_GAME_TO_QUIZ[gameId];

  // 사용자 선택 메시지 + AI 설명 메시지 추가
  ctx.setMessages((prev) => [
    ...prev,
    {
      id: Date.now(),
      type: 'user',
      sentence: getGameTitle(gameId),
    },
    {
      id: Date.now() + 1,
      type: 'ai',
      sentence: intro,
    },
  ]);

  // 퀴즈 게임 — startQuiz로 시작 (사용자 메시지는 위에서 추가했으므로 중복 방지)
  if (quizKind) {
    ctx.startQuiz(quizKind, { includeUserMessage: false });
    return;
  }

  // 스크래치 게임 — scratch-game 메시지를 채팅에 추가
  if (gameId === 'scratch') {
    ctx.setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 2,
        type: 'scratch-game',
        reward,
      },
    ]);
  }
}

function getGameTitle(gameId: ChatGameId): string {
  const game = GAME_LIST.find((g) => g.id === gameId);
  return game?.title ?? '게임 시작';
}
```

- [ ] **Step 2: 빌드 검증**

Run: `npm run build`
Expected: exit code 0

- [ ] **Step 3: 커밋**

```bash
git add src/features/ai-consult/lib/gameRouter.ts
git commit -m "feat: gameRouter — 게임 선택 시 채팅/바텀시트 분기 로직"
```

---

### Task 6: quickReplyRouter에 "게임 하기" 분기 추가

**Files:**

- Modify: `src/features/ai-consult/lib/quickReplyRouter.ts`

**Interfaces:**

- Consumes: `handleGameSelect` from `./gameRouter`, `GameSelectContext`
- Produces: "게임 하기" 퀵 리플라이 처리 — 게임 리스트 메시지를 채팅에 추가

- [ ] **Step 1: QuickReplyContext에 게임 관련 필드 추가**

`QuickReplyContext` 인터페이스에 `startQuiz`는 이미 있음. `openSheetGame` 필드 추가.

```ts
// QuickReplyContext에 추가
openSheetGame: (gameId: GameId, reward?: number) => void;
```

import 추가:

```ts
import type { GameId } from '@/features/games';
```

- [ ] **Step 2: "게임 하기" 분기 추가**

`routeQuickReply` 함수 내, 퀴즈 의도 감지 전에 "게임 하기" 분기 추가:

```ts
// "게임 하기" 퀵 리플라이 — 게임 리스트 메시지를 채팅에 표시
if (text === '게임 하기') {
  setMessages((prev) => [
    ...prev,
    { id: Date.now(), type: 'user', sentence: '게임 하기' },
    { id: Date.now() + 1, type: 'game-list' },
  ]);
  return 'handled';
}

// "출석체크" 퀵 리플라이 — 출석 룰렛 바텀시트 게임으로 바로 연결
if (text === '출석체크') {
  openSheetGame('attendance', 5);
  return 'handled';
}
```

`ctx` 구조분해에 `openSheetGame` 추가.

- [ ] **Step 3: 빌드 검증**

Run: `npm run build`
Expected: exit code 0 (useChat.ts에서 아직 openSheetGame을 전달하지 않으므로 타입 에러 발생 가능 — Task 7에서 수정)

참고: 이 단계에서는 useChat.ts가 아직 openSheetGame을 전달하지 않아 타입 에러가 발생할 수 있습니다. Task 7에서 useChat.ts를 수정하여 해결합니다. 따라서 이 단계에서는 빌드 검증을 건너뛰고 Task 7 완료 후 함께 검증합니다.

- [ ] **Step 4: 커밋 (Task 7과 함께)**

이 태스크의 변경사항은 Task 7의 useChat.ts 수정과 함께 커밋합니다.

---

### Task 7: useChat에 게임 핸들러 추가 및 quickReplyRouter 연결

**Files:**

- Modify: `src/features/ai-consult/model/useChat.ts`

**Interfaces:**

- Consumes: `handleGameSelect` from `../lib/gameRouter`, `useGameStore` from `@/features/games`
- Produces: `handleGameSelect` 함수 (return 값에 추가), `openSheetGame` 함수, `closeSheetGame` 함수

- [ ] **Step 1: useGameStore import 추가**

```ts
import { useGameStore } from '@/features/games';
import { handleGameSelect as routeGameSelect } from '../lib/gameRouter';
```

- [ ] **Step 2: openSheetGame, closeSheetGame 함수 추가**

`useChat` 함수 내에 게임 스토어 연결:

```ts
const openSheetGame = useGameStore((state) => state.openGame);
const closeSheetGame = useGameStore((state) => state.closeGame);
```

- [ ] **Step 3: handleGameSelect 콜백 생성**

게임 리스트에서 선택 시 호출되는 콜백:

```ts
const handleGameSelect = useCallback(
  (gameId: ChatGameId | SheetGameId) => {
    routeGameSelect(gameId, {
      setMessages,
      startQuiz,
      openSheetGame,
    });
  },
  [setMessages, startQuiz, openSheetGame],
);
```

import 추가:

```ts
import type { ChatGameId, SheetGameId } from '../constants/gameList';
```

- [ ] **Step 4: routeQuickReply 호출에 openSheetGame 전달**

`handleSend` 내 `routeQuickReply` 호출에 `openSheetGame` 추가:

```ts
const result = await routeQuickReply({
  // ... 기존 필드들
  openSheetGame,
  // ...
});
```

- [ ] **Step 5: return 값에 handleGameSelect, closeSheetGame 추가**

```ts
return {
  // ... 기존 반환값들
  handleGameSelect,
  closeSheetGame,
};
```

- [ ] **Step 6: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 7: 커밋 (Task 6 + Task 7 함께)**

```bash
git add src/features/ai-consult/lib/quickReplyRouter.ts src/features/ai-consult/model/useChat.ts
git commit -m "feat: '게임 하기' 퀵 리플라이를 게임 리스트로 연결"
```

---

### Task 8: ChatMessageList에 새 메시지 타입 렌더링 추가

**Files:**

- Modify: `src/features/ai-consult/ui/ChatMessageList.tsx`

**Interfaces:**

- Consumes: `GameListMessage` from `./GameListMessage`, `ScratchGameMessage` from `./ScratchGameMessage`
- Produces: `game-list`, `scratch-game` 메시지 렌더링

- [ ] **Step 1: import 추가**

```ts
import GameListMessage from './GameListMessage';
import ScratchGameMessage from './ScratchGameMessage';
```

- [ ] **Step 2: props에 게임 관련 콜백 추가**

`ChatMessageListProps`에 추가:

```ts
onSelectGame?: (gameId: ChatGameId | SheetGameId) => void;
onScratchWin?: (reward: number) => void;
onScratchClose?: () => void;
```

import 추가:

```ts
import type { ChatGameId, SheetGameId } from '../constants/gameList';
```

- [ ] **Step 3: 메시지 렌더링 루프에 새 타입 추가**

`messages.map` 내에 추가:

```tsx
{
  message.type === 'game-list' && (
    <GameListMessage onSelectGame={onSelectGame ?? (() => {})} />
  );
}

{
  message.type === 'scratch-game' && (
    <ScratchGameMessage
      reward={message.reward}
      onWin={onScratchWin}
      onClose={onScratchClose}
    />
  );
}
```

- [ ] **Step 4: 빌드 검증**

Run: `npm run build`
Expected: exit code 0 (ChatPage에서 아직 props를 전달하지 않으므로 optional로 처리됨)

- [ ] **Step 5: 커밋**

```bash
git add src/features/ai-consult/ui/ChatMessageList.tsx
git commit -m "feat: ChatMessageList에 game-list, scratch-game 렌더링 추가"
```

---

### Task 9: ChatPage에 GameLayer 추가 및 props 전달

**Files:**

- Modify: `src/pages/ChatPage.tsx`

**Interfaces:**

- Consumes: `GameLayer` from `@/features/games`, `useChat`의 `handleGameSelect`, `closeSheetGame`
- Produces: 채팅 페이지 내 게임 실행 환경

- [ ] **Step 1: import 추가**

```ts
import { GameLayer } from '@/features/games';
```

- [ ] **Step 2: useChat 반환값에서 게임 관련 값 가져오기**

```ts
const {
  // ... 기존 값들
  handleGameSelect,
  closeSheetGame,
} = useChat();
```

- [ ] **Step 3: GameLayer로 채팅 영역 감싸기**

바텀시트 게임(card-match, reaction, attendance)이 채팅 페이지 위에 오버레이로 표시되도록 GameLayer로 감쌈.

```tsx
return (
  <GameLayer>
    <div className="flex min-h-0 flex-1 flex-col">
      {/* 기존 ChatMessageList, QuickReplies, ChatInput */}
      <ChatMessageList
        // ... 기존 props
        onSelectGame={handleGameSelect}
        onScratchClose={closeSheetGame}
      />
      {/* ... */}
    </div>
  </GameLayer>
);
```

- [ ] **Step 4: 빌드 및 lint 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0

- [ ] **Step 5: 커밋**

```bash
git add src/pages/ChatPage.tsx
git commit -m "feat: ChatPage에 GameLayer 추가 및 게임 props 전달"
```

---

### Task 10: index.ts export 업데이트 및 최종 검증

**Files:**

- Modify: `src/features/ai-consult/index.ts`

- [ ] **Step 1: index.ts에 새 타입 export 추가**

```ts
export type { ChatGameId, SheetGameId, GameMeta } from './constants/gameList';
```

- [ ] **Step 2: 전체 빌드 + lint 최종 검증**

Run: `npm run build && npm run lint`
Expected: exit code 0, 기존과 동일한 결과 (warnings는 기존 순환 의존성만)

- [ ] **Step 3: 런타임 동작 점검 (수동)**

dev 서버 실행 후 확인:

1. "게임 하기" 퀵 리플라이 클릭 → 게임 리스트 메시지 표시
2. "보안 OX 퀴즈" 클릭 → 설명 메시지 + 퀴즈 시작
3. "스크래치 이벤트" 클릭 → 설명 메시지 + 스크래치 카드 표시
4. "카드 맞추기" 클릭 → GameLayer 오버레이로 카드 맞추기 게임 표시
5. "출석체크" 퀵 리플라이 클릭 → 출석 룰렛 GameLayer 표시

- [ ] **Step 4: 최종 커밋**

```bash
git add src/features/ai-consult/index.ts
git commit -m "feat: 게임 시작 수정 — 퀵 리플라이 게임 리스트 연결 완료"
```
