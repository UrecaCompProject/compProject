import badgeImage from '../../assets/badge.png';

import MissionItem from './MissionItem';

import type { Mission } from '../types/mission';

type MissionListProps = {
  missions: Mission[];
  badgeBalance?: number;
  onAction?: (mission: Mission) => void;
};

export default function MissionList({
  missions,
  badgeBalance = 100,
  onAction,
}: MissionListProps) {
  return (
    <section className="bg-surface-page px-4 pb-4 pt-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-caption font-bold text-fg-primary">배지 미션</h2>

        <span className="inline-flex items-center gap-1 rounded-full bg-surface-card px-2 py-1 text-[10px] text-brand-promo-primary">
          <img src={badgeImage} alt="" className="h-3.5 w-3.5" />
          {badgeBalance.toLocaleString()}
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {missions.map((mission) => (
          <MissionItem key={mission.id} mission={mission} onAction={onAction} />
        ))}
      </ul>
    </section>
  );
}
