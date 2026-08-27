import { useEffect, useRef, useState } from 'react';

import introImage from '@/assets/images/reaction-time-intro.png';
import tabImage from '@/assets/images/reaction-time-tab.png';
import { Button } from '@/features/shared';

import type { GameComponentProps } from '../types';

type GamePhase = 'intro' | 'waiting' | 'ready' | 'result' | 'early';

const STEPS = [
  {
    title: '화면의 신호를 기다려주세요!',
    description: '신호가 나타나기 전까지 버튼을 누르지 마세요.',
  },
  {
    title: '신호가 나타나면 빠르게 탭!',
    description: '화면이 바뀌는 순간 버튼을 최대한 빠르게 눌러보세요.',
  },
  {
    title: '가장 빠른 반응속도에 도전해보세요!',
    description: '측정된 반응 시간을 확인하고 기록에 도전해보세요.',
  },
];

export default function ReactionTimeGame({
  reward = 5,
  onWin,
  onClose,
}: GameComponentProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [reactionTime, setReactionTime] = useState<number | null>(null);

  /* 시작 시간, 타이머 ref */
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rewardedRef = useRef(false);
  /* 게임 시작 로직 */
  const handleStart = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    rewardedRef.current = false;
    startTimeRef.current = null;

    setReactionTime(null);
    setPhase('waiting');

    const delay = Math.floor(Math.random() * 2000) + 1500;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      startTimeRef.current = performance.now();
      setPhase('ready');
    }, delay);
  };

  /* 화면 클릭 로직 */
  const handleTap = () => {
    if (phase === 'waiting') {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setPhase('early');
      return;
    }

    if (phase !== 'ready' || startTimeRef.current === null) {
      return;
    }

    const elapsed = Math.round(performance.now() - startTimeRef.current);

    setReactionTime(elapsed);
    setPhase('result');

    if (!rewardedRef.current) {
      rewardedRef.current = true;
      onWin?.(reward);
    }
  };

  /* 타이머 정리 */
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  if (phase === 'intro') {
    return (
      <div className="flex flex-col items-center h-full px-10 py-5 text-center">
        <div className="relative flex h-[200px] w-[200px] shrink-0 items-center justify-center">
          <div
            className="absolute left-1/2 top-1/2 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[60px]"
            style={{ backgroundColor: 'rgba(91, 127, 224, 0.3)' }}
          />
          <img
            src={introImage}
            alt=""
            className="relative z-10 h-[200px] w-[200px] object-contain"
          />
        </div>

        <div className="mt-[30px]">
          <h3 className="text-[20px] font-bold text-fg-primary">
            반응속도 게임
          </h3>
          <p className="mt-1 text-[14px] font-medium text-fg-tertiary">
            신호를 보고 누구보다 빠르게 탭해보세요
          </p>
        </div>

        <ol className="mt-[30px] flex w-full flex-col items-start text-left">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex flex-col w-full">
              <div className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-pressed text-[14px] font-semibold text-fg-secondary">
                  {index + 1}
                </span>
                <div>
                  <p className="text-[14px] font-semibold text-fg-secondary">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-[12px] font-medium text-fg-tertiary">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < STEPS.length - 1 && (
                <div className="my-2 ml-3 h-[30px] w-[2px] rounded-[10px] bg-surface-pressed" />
              )}
            </li>
          ))}
        </ol>

        <Button className="mt-[60px] w-full" size="lg" onClick={handleStart}>
          게임 시작
        </Button>
      </div>
    );
  }

  if (phase === 'waiting') {
    return (
      <button type="button" className="h-full w-full" onClick={handleTap}>
        신호를 기다려주세요
      </button>
    );
  }

  if (phase === 'early') {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p>너무 일찍 눌렀어요!</p>
        <Button onClick={handleStart}>다시 하기</Button>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <p>{reactionTime}ms</p>
        <Button onClick={handleStart}>다시 하기</Button>
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
      </div>
    );
  }
  return (
    <button type="button" className="h-full w-full" onClick={handleTap}>
      <img
        src={tabImage}
        alt=""
        className="flex h-full flex-col items-center justify-center object-contain"
      />
    </button>
  );
}
