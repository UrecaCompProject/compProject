import { useState } from 'react';

import type { QuizKind } from '@/features/chat-quiz';
import {
  GameLayer,
  isGameId,
  useActiveGameMeta,
  useGameStore,
} from '@/features/games';
import { BottomSheet } from '@/shared';

import MyCouponContent from './coupon/MyCouponContent';
import RewardHome from './RewardHome';
import StoreContent from './store/StoreContent';

import type { Mission } from '../types';

type RewardSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartQuiz?: (quizType: QuizKind) => void;
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
    // 스크래치 이벤트는 채팅 쪽에서 별도로 처리될 예정이라, 지금은
    // GameLayer로 열지 않고 바텀시트만 닫아서 안 보이게 한다.

    // if (mission.id === 'scratch') {
    //   handleOpenChange(false);
    //   return;
    // }

    if (isGameId(mission.id)) {
      openGame(mission.id, { reward: mission.reward });
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
      // title={activeGame?.title ?? titles[activeView]}
      title="혜택/이벤트"
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

        {activeView === 'coupon' && <MyCouponContent />}
      </GameLayer>
    </BottomSheet>
  );
}
