import { useEffect, useRef, useState } from 'react';

import { Button } from '@/features/shared';

import { REACTION_RULES } from '../../mocks/rules';
import GameResultCard from '../GameResultCard';
import GameRulesCard from '../GameRulesCard';
import GameShell from '../GameShell';

import type { GamePhase } from '../../types';

const TARGET_SECONDS = 10;
const SUCCESS_THRESHOLD_SECONDS = 0.3; // 목표 시간과 이 이내로 차이 나면 성공

type SpeedGameProps = {
  reward?: number;
  onWin?: (reward: number) => void;
  onClose?: () => void;
};

export default function SpeedGame({
  reward = 5,
  onWin,
  onClose,
}: SpeedGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [elapsed, setElapsed] = useState(0);
  const [diff, setDiff] = useState<number | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (phase !== 'playing') return;

    startedAtRef.current = performance.now();
    const tick = () => {
      if (startedAtRef.current === null) return;
      setElapsed((performance.now() - startedAtRef.current) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const handleStart = () => {
    setElapsed(0);
    setDiff(null);
    setPhase('playing');
  };

  const isCleared = diff !== null && diff <= SUCCESS_THRESHOLD_SECONDS;

  const handleTap = () => {
    cancelAnimationFrame(rafRef.current);
    const tapDiff = Math.abs(elapsed - TARGET_SECONDS);
    setDiff(tapDiff);

    if (tapDiff <= SUCCESS_THRESHOLD_SECONDS) onWin?.(reward);
    setPhase('result');
  };

  return (
    <GameShell
      phase={phase}
      intro={<GameRulesCard {...REACTION_RULES} onStart={handleStart} />}
      playing={
        <div className="flex h-full flex-col items-center justify-center gap-10 px-10">
          <p className="text-caption text-fg-tertiary">
            {TARGET_SECONDS}초에 가장 가깝게 탭해보세요
          </p>
          <p className="text-[48px] font-bold tabular-nums text-fg-primary">
            {elapsed.toFixed(2)}초
          </p>
          <Button className="w-full" size="lg" onClick={handleTap}>
            탭하기
          </Button>
        </div>
      }
      result={
        <GameResultCard
          image={REACTION_RULES.image}
          title={isCleared ? '미션 성공!' : '아쉬워요'}
          description={
            diff !== null
              ? `${TARGET_SECONDS}초와 ${diff.toFixed(2)}초 차이가 났어요.`
              : ''
          }
          rewardCount={isCleared ? reward : undefined}
          onRetry={handleStart}
          onClose={onClose}
        />
      }
    />
  );
}
