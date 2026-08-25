import { missions } from '../mocks/missions';

import CheckIn from './CheckIn';
import MissionList from './MissionList';
import PromoBanner from './PromoBanner';
import RewardShortcuts from './RewardShortcuts';

type RewardHomeProps = {
  onStoreClick: () => void;
  onCouponClick: () => void;
};

/**
 * Renders the rewards home page with promotional content, check-in actions, reward shortcuts, and missions.
 *
 * @param onStoreClick - Handles store shortcut interactions.
 * @param onCouponClick - Handles coupon shortcut interactions.
 */
export default function RewardHome({
  onStoreClick,
  onCouponClick,
}: RewardHomeProps) {
  return (
    <div className="flex flex-col bg-surface-page">
      <PromoBanner />

      <CheckIn />

      <RewardShortcuts
        onStoreClick={onStoreClick}
        onCouponClick={onCouponClick}
      />

      <MissionList missions={missions} />
    </div>
  );
}
