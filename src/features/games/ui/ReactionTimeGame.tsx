import { useEffect, useRef, useState } from 'react';

import { Timer } from 'lucide-react';

import { Button, IconBadge, useModalStore } from '@/shared';
import introImage from '@/shared/assets/images/reaction-time-intro.png';

import type { GameComponentProps } from '../types';

type GamePhase = 'intro' | 'ready' | 'result';

type ReactionTimeGameProps = GameComponentProps & {
  initialPhase?: GamePhase;
  initialReactionTime?: number | null;
  initialEarnedReward?: number | null;
};

type EarnedBadgeCount = 1 | 3 | 5;

const TARGET_TIME_MS = 10_000;
const FIVE_BADGE_TOLERANCE_MS = 100;
const THREE_BADGE_TOLERANCE_MS = 500;
const STEPS = [
  {
    title: '화면의 신호를 기다려주세요!',
    description: '3초 후 게임 시작 후 타이머를 확인하세요.',
  },
  {
    title: '타이머의 시간을 잘 보고 탭!',
    description: ' 10.000초에 가깝게 버튼을 눌러보세요.',
  },
  {
    title: '더 적은 오차에 도전해보세요!',
    description: '목표 시간과 가까울수록 더 많은 배지를 받을 수 있어요.',
  },
];

const COUNTDOWN_START = 3;

function calculateReward(elapsedTimeMs: number): EarnedBadgeCount {
  const differenceMs = Math.abs(elapsedTimeMs - TARGET_TIME_MS);

  if (differenceMs <= FIVE_BADGE_TOLERANCE_MS) {
    return 5;
  }

  if (differenceMs <= THREE_BADGE_TOLERANCE_MS) {
    return 3;
  }

  return 1;
}

function PhaseDots() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const indicatorTimer = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % 5);
    }, 300);

    return () => window.clearInterval(indicatorTimer);
  }, []);

  return (
    <div className="flex justify-center gap-2" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => (
        <span
          key={index}
          className={`h-2 w-2 rounded-full transition-all duration-200 ${
            index === activeIndex
              ? 'scale-125 bg-brand-promo-primary'
              : 'bg-reward-locked'
          }`}
        />
      ))}
    </div>
  );
}

function StartCountdown({ onComplete }: { onComplete: () => void }) {
  const [countdown, setCountdown] = useState(COUNTDOWN_START);

  useEffect(() => {
    let remainingCountdown = COUNTDOWN_START;

    const countdownTimer = window.setInterval(() => {
      remainingCountdown -= 1;

      if (remainingCountdown > 0) {
        setCountdown(remainingCountdown);
        return;
      }

      window.clearInterval(countdownTimer);
      onComplete();
    }, 1000);

    return () => window.clearInterval(countdownTimer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center pb-2 pt-1 text-center">
      <IconBadge
        icon={Timer}
        color="accent-purple"
        size={52}
        radius="full"
        iconSize={28}
      />
      <strong className="mt-5 text-[48px] font-bold leading-none text-brand-promo-primary">
        {countdown}
      </strong>
      <p className="mt-4 text-caption text-fg-tertiary">
        화면을 보고 준비해주세요.
      </p>
      <div className="mt-4">
        <PhaseDots />
      </div>
    </div>
  );
}

export default function ReactionTimeGame({
  onWin,
  onClose,
  initialPhase = 'intro',
  initialReactionTime = null,
  initialEarnedReward = null,
}: ReactionTimeGameProps) {
  const [phase, setPhase] = useState<GamePhase>(initialPhase);
  const [reactionTime, setReactionTime] = useState<number | null>(
    initialReactionTime,
  );
  const [earnedReward, setEarnedReward] = useState<number | null>(
    initialEarnedReward,
  );
  const openModal = useModalStore((state) => state.open);
  const closeModal = useModalStore((state) => state.close);

  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const stopTimer = () => {
    if (animationFrameRef.current === null) return;

    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  };

  const updateTimer = (currentTime: number) => {
    if (startTimeRef.current === null) return;

    const elapsed = Math.round(currentTime - startTimeRef.current);
    setReactionTime(elapsed);
    animationFrameRef.current = requestAnimationFrame(updateTimer);
  };

  const startTimer = () => {
    stopTimer();
    setReactionTime(0);
    setEarnedReward(null);
    setPhase('ready');
    startTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(updateTimer);
  };

  const handleCountdownComplete = () => {
    closeModal();
    startTimer();
  };

  const handleOpenStartModal = () => {
    openModal({
      title: '잠시 뒤에 게임이 시작합니다',
      content: <StartCountdown onComplete={handleCountdownComplete} />,
      dismissible: false,
    });
  };

  const handleTap = () => {
    if (phase !== 'ready' || startTimeRef.current === null) {
      return;
    }

    const elapsedTimeMs = Math.round(performance.now() - startTimeRef.current);
    const earnedBadgeCount = calculateReward(elapsedTimeMs);

    stopTimer();
    startTimeRef.current = null;

    setReactionTime(elapsedTimeMs);
    setEarnedReward(earnedBadgeCount);
    setPhase('result');

    onWin?.(earnedBadgeCount);
  };

  useEffect(() => {
    return () => stopTimer();
  }, []);

  if (phase === 'intro') {
    return (
      <div className="flex h-full flex-col items-center px-10 py-5 text-center">
        <div className="relative flex h-[200px] w-[200px] shrink-0 items-center justify-center">
          <div className="absolute left-1/2 top-1/2 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-compare-selected/30 blur-[60px]" />
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

        <Button
          className="mt-[60px] w-full"
          size="lg"
          onClick={handleOpenStartModal}
        >
          게임 시작
        </Button>
      </div>
    );
  }

  if (phase === 'result') {
    const resultInSeconds = ((reactionTime ?? 0) / 1000).toFixed(3);

    return (
      <section className="mx-auto flex h-full w-full max-w-[390px] flex-col px-5 pb-6">
        <div className="mt-[12%] flex flex-col items-center text-center">
          <h2 className="text-title text-fg-primary">최고 기록 달성!</h2>
          <div className="mt-5 flex min-h-[112px] min-w-[190px] flex-col items-center justify-center rounded-xl border border-accent-purple-soft bg-surface-card px-6">
            <p className="text-[32px] font-bold text-accent-purple-primary">
              {resultInSeconds}초
            </p>
            <span className="mt-2 rounded-full bg-accent-soft px-2 py-0.5 text-medium-12-130 text-accent-primary">
              NEW BEST!
            </span>
            <span className="mt-2 text-medium-12-130 text-brand-promo-primary">
              배지 {earnedReward ?? 1}개 획득
            </span>
          </div>
        </div>

        <div className="mt-auto">
          <Button className="mt-4 w-full" onClick={onClose}>
            미션 종료
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-[390px] flex-col items-center px-5 pb-6">
      <div className="mt-6 w-full rounded-xl border border-border-brand bg-surface-page px-5 py-4 text-center">
        <p className="text-regular-12-130 text-fg-tertiary">목표 10.000초</p>
        <p className="mt-1 text-[32px] font-bold text-brand-promo-primary">
          {((reactionTime ?? 0) / 1000).toFixed(3)}초
        </p>
      </div>

      <h2 className="mt-7 text-title text-fg-primary">
        10.000초에 맞춰 버튼을 누르세요!
      </h2>

      <div className="mt-5 flex w-full justify-center">
        <div className="flex h-[280px] w-[280px] items-center justify-center rounded-full bg-accent-purple-soft">
          <div className="flex h-[250px] w-[250px] items-center justify-center rounded-full border border-border-brand bg-surface-card">
            <Button
              type="button"
              size="icon"
              round
              className="h-[228px] w-[228px] bg-accent-purple-primary p-0 text-[60px] font-bold text-white hover:bg-accent-purple-primary"
              onClick={handleTap}
            >
              TAP!!
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center">
        <p className="text-regular-12-130 text-accent-purple-primary">
          10.000초에 가까울수록 더 많은 배지를 받을 수 있어요!
        </p>
        <div className="mt-4">
          <PhaseDots />
        </div>
      </div>
    </div>
  );
}
