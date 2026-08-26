import {
  AlarmClock,
  Blocks,
  Clover,
  Lock,
  SatelliteDish,
  Share2,
  Target,
} from 'lucide-react';

import badgeImage from '@/assets/images/badge.png';

import type { Mission, MissionIcon } from '../types';
import type { LucideIcon } from 'lucide-react';

const missionIcons: Record<MissionIcon, LucideIcon> = {
  card: Blocks,
  timer: AlarmClock,
  roulette: Target,
  scratch: Clover,
  security: Lock,
  telecom: SatelliteDish,
  share: Share2,
};

type MissionItemProps = {
  mission: Mission;
  onAction?: (mission: Mission) => void;
};

export default function MissionItem({ mission, onAction }: MissionItemProps) {
  const Icon = missionIcons[mission.icon];

  return (
    <li className="flex items-center gap-3 rounded-xl bg-surface-card px-3 py-3">
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-promo-soft text-brand-promo-primary">
        <Icon size={20} strokeWidth={1.8} />
      </span>

      <div className="flex h-[33px] w-[236px] min-w-0 flex-1 flex-col justify-between">
        <strong className="truncate text-caption text-fg-primary">
          {mission.title}
        </strong>

        <span className="flex items-center gap-1 text-[10px] text-fg-tertiary">
          <img src={badgeImage} alt="" className="h-3.5 w-3.5" />
          배지 {mission.reward}개
        </span>
      </div>

      <button
        type="button"
        onClick={() => onAction?.(mission)}
        className="h-7 w-[46px] shrink-0 rounded-lg bg-brand-promo-primary text-[10px] font-semibold text-white"
      >
        {mission.actionLabel}
      </button>
    </li>
  );
}
