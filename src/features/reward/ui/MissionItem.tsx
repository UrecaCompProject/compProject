import {
  AlarmClock,
  Blocks,
  Clover,
  Lock,
  SatelliteDish,
  Share2,
  Target,
} from 'lucide-react';

import { Button } from '@/shared';
import badgeImage from '@/shared/assets/images/badge.svg';

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
  finished?: boolean;
  // 완료된 미션에서 실제로 획득한 배지 수 (서버 game_results.score)
  earnedScore?: number;
};

// 게임 리스트 카드 컴포넌트

export default function MissionItem({
  mission,
  onAction,
  finished,
  earnedScore,
}: MissionItemProps) {
  const Icon = missionIcons[mission.icon];

  // 보상 표시
  // - 랜덤 보상 미션(스크래치): 완료 시 실제 획득량, 그 전엔 "배지 랜덤"
  // - 고정 보상 미션: 항상 "배지 N개"
  let rewardText: string;
  if (mission.randomReward) {
    rewardText =
      finished && earnedScore != null
        ? `배지 ${earnedScore}개 획득`
        : '배지 랜덤';
  } else {
    rewardText = `배지 ${mission.reward}개`;
  }

  return (
    <li className="flex items-center gap-2.5 rounded-xl bg-surface-card px-2.5 py-2.5">
      <span
        className={`inline-flex items-center justify-center rounded-lg h-9 w-9 shrink-0 bg-brand-soft text-brand-promo-primary ${finished ? 'border-[1.8px] border-brand-promo-primary' : ''}`}
      >
        <Icon size={20} strokeWidth={1.8} />
      </span>

      <div className="flex flex-col justify-between flex-1 min-w-0">
        <strong className="truncate text-chip text-fg-primary">
          {mission.title}
        </strong>

        <span className="flex items-center gap-1 text-medium-12-130 text-fg-tertiary">
          <img src={badgeImage} alt="" className="h-3.5 w-3.5" />
          {rewardText}
        </span>
      </div>

      <Button
        variant="primary"
        size="sm"
        onClick={() => onAction?.(mission)}
        disabled={finished}
        className="ml-auto"
      >
        {finished ? '완료' : mission.actionLabel}
      </Button>
    </li>
  );
}
