import { useState } from 'react';

import type { QuizKind } from '@/features/chat-quiz';
import { CouponBox } from '@/features/coupon';
import { GameLayer, useActiveGameMeta, useGameStore } from '@/features/games';
import { BottomSheet } from '@/features/shared';

import RewardHome from './RewardHome';
import StoreContent from './StoreContent';

import type { Mission } from '../types';

type RewardSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartQuiz?: (quizType: QuizKind) => void;
};

type RewardView = 'reward' | 'store' | 'coupon';

const titles: Record<RewardView, string> = {
  reward: '게임 혜택',
  store: '배지 상점',
  coupon: '나의 쿠폰함',
};

export default function RewardSheet({
  open,
  onOpenChange,
  onStartQuiz,
}: RewardSheetProps) {
  const [activeView, setActiveView] = useState<RewardView>('reward');
  const activeGame = useActiveGameMeta();
  const openGame = useGameStore((state) => state.openGame);
  const closeGame = useGameStore((state) => state.closeGame);
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
    if (mission.id === 'card-match') {
      openGame('card-match', { reward: mission.reward });
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
      title={activeGame?.title ?? titles[activeView]}
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

        {activeView === 'coupon' && <CouponBox />}
      </GameLayer>
    </BottomSheet>
  );
}
