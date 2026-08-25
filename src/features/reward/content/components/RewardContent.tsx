import { missions } from '../data/missions';

import CheckIn from './CheckIn';
import MissionList from './MissionList';
import PromoBanner from './PromoBanner';
import RewardLinks from './RewardLinks';

type RewardContentProps = {
  onStoreClick: () => void;
  onCouponClick: () => void;
};

export default function RewardContent({
  onStoreClick,
  onCouponClick,
}: RewardContentProps) {
  return (
    <div className="flex flex-col bg-surface-page">
      <PromoBanner />

      <CheckIn />

      <RewardLinks onStoreClick={onStoreClick} onCouponClick={onCouponClick} />

      <MissionList missions={missions} />
    </div>
  );
}
