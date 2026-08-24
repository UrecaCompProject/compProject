import { BottomSheet } from '@/features/shared';

import RewardContent from './RewardContent';

type RewardSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStoreClick: () => void;
  onCouponClick: () => void;
};

export default function RewardSheet({
  open,
  onOpenChange,
  onStoreClick,
  onCouponClick,
}: RewardSheetProps) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="게임 혜택"
      size="full"
    >
      <RewardContent
        onStoreClick={onStoreClick}
        onCouponClick={onCouponClick}
      />
    </BottomSheet>
  );
}
