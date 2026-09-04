import { useMemo, useState } from 'react';

import { Button } from '@/shared';
import badgeImage from '@/shared/assets/images/badge.svg';

import { ATTENDANCE_RULES } from '../../mocks/rules';
import GameResultCard from '../GameResultCard';
import GameRulesCard from '../GameRulesCard';
import GameShell from '../GameShell';

import type { GamePhase } from '../../types';

const SPIN_DURATION = 3000; // ms
const MAX_BADGE_REWARD = 5;
const SLICE_ANGLE = 360 / MAX_BADGE_REWARD;
const EXTRA_SPINS = 5;

// 우리 컬러 토큰만 사용 — 5조각을 구분할 수 있게 색상만 다르게
const SLICE_COLORS = [
  'var(--color-brand-promo-primary)',
  'var(--color-brand-promo-light)',
  'var(--color-brand-promo-soft)',
  'var(--color-brand-promo-light)',
  'var(--color-brand-promo-soft)',
];

type RuletteGameProps = {
  reward?: number;
  onWin?: (reward: number) => void;
  onClose?: () => void;
};

export default function RuletteGame({
  reward,
  onWin,
  onClose,
}: RuletteGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const wheelBackground = useMemo(
    () =>
      `conic-gradient(${SLICE_COLORS.map(
        (color, i) =>
          `${color} ${i * SLICE_ANGLE}deg ${(i + 1) * SLICE_ANGLE}deg`,
      ).join(', ')})`,
    [],
  );

  const handleStart = () => {
    setPhase('playing');
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    const picked = reward ?? Math.floor(Math.random() * MAX_BADGE_REWARD) + 1;
    const targetAngle = (picked - 1) * SLICE_ANGLE + SLICE_ANGLE / 2;
    // 포인터는 12시(0deg) 고정 — 뽑힌 조각의 중심이 그 자리로 오도록 회전량을 계산
    setRotation(360 * EXTRA_SPINS + (360 - targetAngle));

    setTimeout(() => {
      setIsSpinning(false);
      onWin?.(picked);
      setPhase('result');
    }, SPIN_DURATION);
  };

  return (
    <GameShell
      phase={phase}
      intro={<GameRulesCard {...ATTENDANCE_RULES} onStart={handleStart} />}
      playing={
        <div className="flex h-full flex-col items-center justify-center gap-10 px-10 -mt-10">
          <div
            className={`w-full text-[24px] font-semibold text-center mb-3 ${isSpinning ? 'text-brand-promo-primary' : ''}`}
          >
            {isSpinning ? '두구두구두구두구' : '돌려돌려 출석 룰렛'}
          </div>

          <div className="relative h-60 w-60">
            <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 border-x-8 border-t-[14px] border-x-transparent border-t-fg-disabled" />

            <div
              className="h-full w-full rounded-full border-4 border-white shadow-shadow transition-transform ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: `${SPIN_DURATION}ms`,
                backgroundImage: wheelBackground,
              }}
            >
              {SLICE_COLORS.map((_, i) => {
                const labelAngle = i * SLICE_ANGLE + SLICE_ANGLE / 2;
                return (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 flex flex-col items-center gap-0.5"
                    style={{
                      transform: `translate(-50%, -50%) rotate(${labelAngle}deg) translateY(-75px)`,
                    }}
                  >
                    <img src={badgeImage} alt="" className="h-5 w-5" />
                    <span
                      className={`whitespace-nowrap text-[12px] font-bold ${i === 2 || i === 4 ? 'text-fg-tertiary' : 'text-white'}`}
                    >
                      {i + 1}개
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-brand-promo-primary shadow" />
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSpin}
            disabled={isSpinning}
          >
            {isSpinning ? '돌아가는 중...' : '룰렛 돌리기'}
          </Button>
        </div>
      }
      result={
        <GameResultCard
          image={ATTENDANCE_RULES.image}
          title="오늘의 혜택 획득!"
          description="내일 또 출석하고 룰렛을 돌려보세요."
          onClose={onClose}
        />
      }
    />
  );
}
