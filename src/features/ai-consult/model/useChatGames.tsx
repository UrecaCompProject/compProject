import type { ComponentType, Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';

import { useModalStore } from '@/shared';
import type { GameId } from '@/shared/types/games';
import type { QuizKind } from '@/shared/types/quiz';

import { GAME_LIST } from '../constants/gameList';

import type { ChatMessage } from '../types';

type RecordPlay = (
  params: { gameId: string; score?: number },
  options?: { onSuccess?: () => void },
) => void;

export interface UseChatGamesDeps {
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  recordPlay: RecordPlay;
  openGame: (
    gameId: GameId,
    params?: {
      reward?: number;
      source?: 'chat' | 'reward';
      onWin?: (reward: number) => void;
    },
  ) => void;
  closeGame: () => void;
  reward: {
    GetBadgeModal: ComponentType<{ badgeCount: number }>;
    scratchMissionUuid?: string;
    quizMissionUuids: Partial<Record<QuizKind, string>>;
  };
}

export interface ChatGames {
  startScratch: (reward?: number) => void;
  onScratchWin: (reward: number) => void;
  openSheetGame: (gameId: GameId, reward?: number) => void;
  closeSheetGame: () => void;
  handleQuizFinish: (quizType: QuizKind, rewardCount: number) => void;
}

export function useChatGames({
  setMessages,
  recordPlay,
  openGame,
  closeGame,
  reward: { GetBadgeModal, scratchMissionUuid, quizMissionUuids },
}: UseChatGamesDeps): ChatGames {
  const openModal = useModalStore((state) => state.open);

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
    (score: number) => {
      if (!scratchMissionUuid) return;
      recordPlay(
        { gameId: scratchMissionUuid, score },
        {
          onSuccess: () => {
            openModal({ content: <GetBadgeModal badgeCount={score} /> });
          },
        },
      );
    },
    [recordPlay, scratchMissionUuid, openModal, GetBadgeModal],
  );

  const openSheetGame = useCallback(
    (gameId: GameId, reward?: number) => {
      const gameMeta = GAME_LIST.find((g) => g.id === gameId);
      const missionUuid = gameMeta?.missionUuid;
      openGame(gameId, {
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
    [openGame, recordPlay, openModal, GetBadgeModal],
  );

  const handleQuizFinish = useCallback(
    (quizType: QuizKind, rewardCount: number) => {
      const gameId = quizMissionUuids[quizType];
      if (gameId) {
        recordPlay({ gameId, score: rewardCount });
      }
      openModal({ content: <GetBadgeModal badgeCount={rewardCount} /> });
    },
    [recordPlay, openModal, GetBadgeModal, quizMissionUuids],
  );

  return {
    startScratch,
    onScratchWin,
    openSheetGame,
    closeSheetGame: closeGame,
    handleQuizFinish,
  };
}
