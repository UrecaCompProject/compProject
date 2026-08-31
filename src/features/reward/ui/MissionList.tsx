import { missions } from '../mocks/missions';
import { useBadgeBalance } from '../model/useBadgeBalance';
import { useMissionCompletion } from '../model/useMissionCompletion';

import MissionItem from './MissionItem';
import Badge from './shared/Badge';

import type { Mission } from '../types';

type MissionListProps = {
  onAction?: (mission: Mission) => void;
};

// 게임 보여주는 리스트 컴포넌트
export default function MissionList({ onAction }: MissionListProps) {
  const badgeBalance = useBadgeBalance();
  const { playedTodayGameIds } = useMissionCompletion();
  return (
    <section className="bg-surface-page px-4 pb-4 pt-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-semibold-16-130 text-fg-primary ml-1">
          배지 미션
        </div>

        <Badge
          size="small"
          value={badgeBalance}
          ariaLabel={`보유 배지 ${badgeBalance}개`}
        />
      </div>

      <ul className="flex flex-col gap-2">
        {missions.map((mission) => (
          <MissionItem
            key={mission.uuid}
            mission={mission}
            onAction={onAction}
            finished={playedTodayGameIds.has(mission.uuid)}
          />
        ))}
      </ul>
    </section>
  );
}
