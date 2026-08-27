import MissionItem from './MissionItem';
import SmallBadge from './SmallBadge';

import type { Mission } from '../types';

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
        <h2 className="text-chip font-bold text-fg-primary">배지 미션</h2>

        <SmallBadge
          value={badgeBalance}
          ariaLabel={`보유 배지 ${badgeBalance}개`}
        />
      </div>

      <ul className="flex flex-col gap-2">
        {missions.map((mission) => (
          <MissionItem key={mission.id} mission={mission} onAction={onAction} />
        ))}
      </ul>
    </section>
  );
}
