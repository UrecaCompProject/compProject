import { useEffect, useRef, useState } from 'react';

import { Button } from '@/shared';

import { REACTION_RULES } from '../../mocks/rules';
import GameResultCard from '../GameResultCard';
import GameRulesCard from '../GameRulesCard';
import GameShell from '../GameShell';

import type { GamePhase } from '../../types';

const TARGET_SECONDS = 10;
const CLOSE_RANGE_SECONDS = 0.5; // 9.500~10.500초 범위
const TIME_LIMIT_SECONDS = 15; // 이 시간까지 안 누르면 자동으로 실패 처리
const DISPLAY_PRECISION = 3;

const PERFECT_REWARD = 5; // 정확히 10.000초
const CLOSE_REWARD = 3; // 9.500~10.500초 (10.000초 제외)
const DEFAULT_REWARD = 1; // 그 외

function roundTo(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function getReward(diff: number): number {
  if (diff === 0) return PERFECT_REWARD;
  if (diff <= CLOSE_RANGE_SECONDS) return CLOSE_REWARD;
  return DEFAULT_REWARD;
}

type SpeedGameProps = {
  onWin?: (reward: number) => void;
  onClose?: () => void;
};

export default function SpeedGame({ onWin, onClose }: SpeedGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [elapsed, setElapsed] = useState(0);
  const [diff, setDiff] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    if (phase !== 'playing') return;

    startedAtRef.current = performance.now();
    const tick = () => {
      if (startedAtRef.current === null) return;
      const next = (performance.now() - startedAtRef.current) / 1000;

      if (next >= TIME_LIMIT_SECONDS) {
        setElapsed(TIME_LIMIT_SECONDS);
        setTimedOut(true);
        setPhase('result');
        return;
      }

      setElapsed(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const handleStart = () => {
    setElapsed(0);
    setDiff(null);
    setTimedOut(false);
    setPhase('playing');
  };

  const handleTap = () => {
    cancelAnimationFrame(rafRef.current);
    const tappedAt = roundTo(elapsed, DISPLAY_PRECISION);
    const tapDiff = roundTo(
      Math.abs(tappedAt - TARGET_SECONDS),
      DISPLAY_PRECISION,
    );
    const reward = getReward(tapDiff);

    setDiff(tapDiff);
    onWin?.(reward);
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
            {elapsed.toFixed(DISPLAY_PRECISION)}초
          </p>
          <Button className="w-full" size="lg" onClick={handleTap}>
            탭하기
          </Button>
        </div>
      }
      result={
        <GameResultCard
          image={REACTION_RULES.image}
          title={timedOut ? '시간 초과' : '미션 성공!'}
          description={
            timedOut
              ? '제한 시간 안에 탭하지 못했어요. 다시 도전해보세요!'
              : diff !== null
                ? `${TARGET_SECONDS}초와 ${diff.toFixed(DISPLAY_PRECISION)}초 차이가 났어요.`
                : ''
          }
          onClose={onClose}
        />
      }
    />
  );
}
