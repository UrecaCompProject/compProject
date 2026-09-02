import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import type { QuizKind } from '@/features/chat-quiz';
import { useActiveGameMeta, useGameStore, type GameId } from '@/features/games';
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
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  recordPlay: (
    params: { gameId: string; score?: number },
    options?: { onSuccess?: () => void },
  ) => void;
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
