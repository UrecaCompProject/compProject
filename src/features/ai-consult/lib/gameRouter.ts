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
  startQuiz: (
    kind: QuizKind,
    opts?: { includeUserMessage?: boolean; includeIntroMessage?: boolean },
  ) => void;
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
      category: 'game',
    },
    {
      id: Date.now() + 1,
      type: 'ai',
      sentence: intro,
      category: 'game',
    },
  ]);

  // 퀴즈 게임 — startQuiz로 시작 (사용자 메시지·안내 메시지는 위에서 이미 추가했으므로 중복 방지)
  if (quizKind) {
    ctx.startQuiz(quizKind, {
      includeUserMessage: false,
      includeIntroMessage: false,
    });
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
