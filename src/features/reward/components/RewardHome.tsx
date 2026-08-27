import { missions } from '../mocks/missions';

import CheckIn from './CheckIn';
import MissionList from './MissionList';
import PromoBanner from './PromoBanner';
import RewardShortcuts from './RewardShortcuts';

import type { Mission } from '../types';

type RewardHomeProps = {
  onStoreClick: () => void;
  onCouponClick: () => void;
  onMissionAction?: (mission: Mission) => void;
};

export default function RewardHome({
  onStoreClick,
  onCouponClick,
  onMissionAction,
}: RewardHomeProps) {
  return (
    <div className="flex flex-col bg-surface-page">
      <PromoBanner />

      <CheckIn />

      <RewardShortcuts
        onStoreClick={onStoreClick}
        onCouponClick={onCouponClick}
      />

      <MissionList missions={missions} onAction={onMissionAction} />
    </div>
  );
}
