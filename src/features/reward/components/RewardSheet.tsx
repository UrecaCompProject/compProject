import { useState } from 'react';

import { GameLayer, useActiveGameMeta, useGameStore } from '@/features/games';
import { BottomSheet } from '@/features/shared';

import RewardHome from './RewardHome';

type RewardSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type RewardView = 'reward' | 'store' | 'coupon';

const titles: Record<RewardView, string> = {
  reward: '게임 혜택',
  store: '배지 상점',
  coupon: '나의 쿠폰함',
};

export default function RewardSheet({ open, onOpenChange }: RewardSheetProps) {
  const [activeView, setActiveView] = useState<RewardView>('reward');
  const activeGame = useActiveGameMeta();
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

  return (
    <BottomSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={activeGame?.title ?? titles[activeView]}
      onBack={
        activeGame?.onBack ?? (activeView === 'reward' ? undefined : handleBack)
      }
      size="full"
      bodyClassName={activeGame || activeView === 'reward' ? 'px-0' : 'px-5'}
    >
      <GameLayer>
        {activeView === 'reward' && (
          <RewardHome
            onStoreClick={() => setActiveView('store')}
            onCouponClick={() => setActiveView('coupon')}
          />
        )}

        {activeView === 'store' && <div />}

        {activeView === 'coupon' && <div />}
      </GameLayer>
    </BottomSheet>
  );
}
