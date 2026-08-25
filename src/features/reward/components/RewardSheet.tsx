import { useState } from 'react';

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

/**
 * Displays the reward sheet and manages navigation between reward-related views.
 *
 * @param open - Whether the sheet is open
 * @param onOpenChange - Called when the sheet's open state changes
 */
export default function RewardSheet({ open, onOpenChange }: RewardSheetProps) {
  const [activeView, setActiveView] = useState<RewardView>('reward');
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setActiveView('reward');
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
      title={titles[activeView]}
      onBack={activeView === 'reward' ? undefined : handleBack}
      size="full"
      bodyClassName={activeView === 'reward' ? 'px-0' : 'px-5'}
    >
      {activeView === 'reward' && (
        <RewardHome
          onStoreClick={() => setActiveView('store')}
          onCouponClick={() => setActiveView('coupon')}
        />
      )}

      {activeView === 'store' && <div />}

      {activeView === 'coupon' && <div />}
    </BottomSheet>
  );
}
