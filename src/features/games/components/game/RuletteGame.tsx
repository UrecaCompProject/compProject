import { useState } from 'react';

import { Button } from '@/features/shared';

import { ATTENDANCE_RULES } from '../../mocks/rules';
import GameResultCard from '../GameResultCard';
import GameRulesCard from '../GameRulesCard';
import GameShell from '../GameShell';

import type { GamePhase } from '../../types';

const SPIN_DURATION = 1200; // ms
const REWARD_OPTIONS = [1, 3, 5, 10];

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
  const [wonReward, setWonReward] = useState(0);

  const handleStart = () => {
    setPhase('playing');
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    setTimeout(() => {
      const picked =
        reward ??
        REWARD_OPTIONS[Math.floor(Math.random() * REWARD_OPTIONS.length)];
      setWonReward(picked);
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
        <div className="flex h-full flex-col items-center justify-center gap-10 px-10">
          <div
            className={`flex h-50 w-50 items-center justify-center rounded-full border-8 border-brand-promo-primary text-[20px] font-bold text-brand-promo-primary transition-transform duration-1000 ${
              isSpinning ? 'rotate-1080' : 'rotate-0'
            }`}
          >
            {isSpinning ? '돌아가는 중...' : '룰렛'}
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
          rewardCount={wonReward}
          onClose={onClose}
        />
      }
    />
  );
}
