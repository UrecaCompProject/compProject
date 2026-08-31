import { useState } from 'react';

import type { QuizKind } from '@/features/chat-quiz';
import {
  GameLayer,
  isGameId,
  useActiveGameMeta,
  useGameStore,
} from '@/features/games';
import { BottomSheet, useModalStore } from '@/shared';

import { useMissionCompletion } from '../model/useMissionCompletion';

import MyCouponContent from './coupon/MyCouponContent';
import GetBadgeModal from './GetBadgeModal';
import RewardHome from './RewardHome';
import StoreContent from './store/StoreContent';

import type { Mission } from '../types';

type RewardSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartQuiz?: (quizType: QuizKind) => void;
  onStartScratch?: (reward?: number) => void;
};

type RewardView = 'reward' | 'store' | 'coupon';

// const titles: Record<RewardView, string> = {
//   reward: '혜택/이벤트',
//   store: '혜택/이벤트',
//   coupon: '혜택/이벤트',
// };

export default function RewardSheet({
  open,
  onOpenChange,
  onStartQuiz,
  onStartScratch,
}: RewardSheetProps) {
  const [activeView, setActiveView] = useState<RewardView>('reward');
  const activeGame = useActiveGameMeta();
  const openGame = useGameStore((state) => state.openGame);
  const closeGame = useGameStore((state) => state.closeGame);
  const { recordPlay } = useMissionCompletion();
  const openModal = useModalStore((state) => state.open);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setActiveView('reward');
      closeGame();
    }

    onOpenChange(nextOpen);
  };

  const handleBack = () => {
    setActiveView('reward');
  };

  const handleMissionAction = (mission: Mission) => {
    // 스크래치 이벤트는 GameLayer(바텀시트)가 아니라 채팅 쪽에서 진행한다.
    // isGameId보다 먼저 체크해야 한다 — GameId 타입에는 더 이상 'scratch'가 없지만,
    // 혹시 남아있더라도 이 분기가 우선한다.
    if (mission.id === 'scratch') {
      handleOpenChange(false);
      onStartScratch?.(mission.reward);
      return;
    }

    if (isGameId(mission.id)) {
      // source: 'reward'로 열면 ChatPage의 채팅 전용 게임 시트는 열리지 않고,
      // 이 시트(RewardSheet) 안의 GameLayer가 게임을 보여준다.
      // 게임이 끝나면(closeGame) 이 시트는 계속 열려있던 상태라 자연스럽게 미션 목록으로 돌아간다.
      openGame(mission.id, {
        reward: mission.reward,
        source: 'reward',
        onWin: (reward) =>
          recordPlay(
            { gameId: mission.uuid, score: reward },
            {
              onSuccess: () => {
                openModal({ content: <GetBadgeModal badgeCount={reward} /> });
              },
            },
          ),
      });
      return;
    }

    const quizTypeByMissionId: Partial<Record<string, QuizKind>> = {
      'security-quiz': 'ox',
      'telecom-quiz': 'multiple-choice',
    };
    const quizType = quizTypeByMissionId[mission.id];
    if (!quizType || !onStartQuiz) return;

    handleOpenChange(false);
    onStartQuiz(quizType);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={activeGame?.title ?? '혜택/이벤트'}
      onBack={
        activeGame?.onBack ?? (activeView === 'reward' ? undefined : handleBack)
      }
      size="full"
      bodyClassName={
        activeGame || activeView !== 'coupon'
          ? 'px-0'
          : 'bg-surface-page px-5 py-4'
      }
    >
      <GameLayer>
        {activeView === 'reward' && (
          <RewardHome
            onStoreClick={() => setActiveView('store')}
            onCouponClick={() => setActiveView('coupon')}
            onMissionAction={handleMissionAction}
          />
        )}

        {activeView === 'store' && (
          <StoreContent onGoToCoupon={() => setActiveView('coupon')} />
        )}

        {activeView === 'coupon' && (
          <MyCouponContent onGoToReward={handleBack} />
        )}
      </GameLayer>
    </BottomSheet>
  );
}
