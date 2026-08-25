import { useEffect, useMemo, useState } from 'react';

import backImage1 from '@/assets/images/card-match-back-01.svg';
import backImage2 from '@/assets/images/card-match-back-02.svg';
import faceImage01 from '@/assets/images/card-match-face-01.svg';
import faceImage02 from '@/assets/images/card-match-face-02.svg';
import faceImage03 from '@/assets/images/card-match-face-03.svg';
import faceImage04 from '@/assets/images/card-match-face-04.svg';
import faceImage05 from '@/assets/images/card-match-face-05.svg';
import faceImage06 from '@/assets/images/card-match-face-06.svg';
import introImage from '@/assets/images/card-match-intro.svg';
import { Button } from '@/features/shared';

import { useGameStore } from '../store/useGameStore';

type GamePhase = 'intro' | 'playing' | 'result';

type CardItem = {
  id: number;
  faceIndex: number;
  matched: boolean;
};

// TODO: 난이도별 쌍 개수/시간 나중에 추가 (지금은 6쌍 고정)
const FACE_IMAGES = [
  faceImage01,
  faceImage02,
  faceImage03,
  faceImage04,
  faceImage05,
  faceImage06,
];

const BACK_IMAGES = [backImage1, backImage2];
const COLUMN_COUNT = 4;
const PAIR_COUNT = FACE_IMAGES.length; // 6쌍 = 12장
const TIME_LIMIT = 40; // 초

const STEPS = [
  {
    title: '같은 그림의 카드 2장을 찾아보세요!',
    description: '카드를 뒤집어 같은 그림의 짝을 맞춰보세요.',
  },
  {
    title: '같은 카드라면 매칭 성공!',
    description:
      '짝이 맞은 카드는 열린 상태로 유지되고, 다른 카드라면 다시 뒤집힙니다.',
  },
  {
    title: '제한 시간 안에 모든 짝을 맞춰보세요!',
    description: '빠르게 모든 카드를 맞추고 미션을 완료해보세요.',
  },
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createDeck(): CardItem[] {
  const faceIndexes = shuffle(
    Array.from({ length: PAIR_COUNT }, (_, i) => i).flatMap((i) => [i, i]),
  );
  return faceIndexes.map((faceIndex, id) => ({
    id,
    faceIndex,
    matched: false,
  }));
}

function getBackImage(id: number) {
  const row = Math.floor(id / COLUMN_COUNT);
  const col = id % COLUMN_COUNT;
  return (row + col) % 2 === 0 ? BACK_IMAGES[0] : BACK_IMAGES[1];
}

type CardMatchGameProps = {
  reward?: number;
  onWin?: (reward: number) => void;
  onClose?: () => void;
};

export default function CardMatchGame({
  reward = 5,
  onWin,
  onClose,
}: CardMatchGameProps) {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [deck, setDeck] = useState<CardItem[]>(() => createDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [lockBoard, setLockBoard] = useState(false);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);

  const matchedCount = useMemo(
    () => deck.filter((card) => card.matched).length / 2,
    [deck],
  );
  const isCleared = matchedCount === PAIR_COUNT;
  const score = Math.round((matchedCount / PAIR_COUNT) * 100);

  useEffect(() => {
    if (phase !== 'playing') return;

    const timer = setTimeout(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [phase, timeLeft]);

  const setBackOverride = useGameStore((state) => state.setBackOverride);

  useEffect(() => {
    if (phase === 'intro') {
      setBackOverride(null);
    } else {
      setBackOverride(() => setPhase('intro'));
    }
  }, [phase, setBackOverride]);

  useEffect(() => {
    return () => setBackOverride(null);
  }, [setBackOverride]);

  const handleStart = () => {
    setDeck(createDeck());
    setFlipped([]);
    setMoves(0);
    setTimeLeft(TIME_LIMIT);
    setPhase('playing');
  };

  const handleFlip = (id: number) => {
    if (lockBoard) return;
    if (flipped.includes(id)) return;
    if (deck[id].matched) return;
    if (flipped.length === 2) return;

    const nextFlipped = [...flipped, id];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLockBoard(true);
      const [firstId, secondId] = nextFlipped;

      if (deck[firstId].faceIndex === deck[secondId].faceIndex) {
        const nextMatchedCount = matchedCount + 1;

        setTimeout(() => {
          setDeck((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, matched: true }
                : card,
            ),
          );
          setFlipped([]);
          setLockBoard(false);

          if (nextMatchedCount === PAIR_COUNT) {
            setPhase('result');
            onWin?.(reward);
          }
        }, 400);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLockBoard(false);
        }, 700);
      }
    }
  };

  if (phase === 'intro') {
    return (
      <div className="flex flex-col items-center h-full px-10 pt-10 pb-6 text-center">
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
          <h3 className="text-[20px] font-bold text-fg-primary">카드 뒤집기</h3>
          <p className="mt-1 text-[14px] font-medium text-fg-tertiary">
            같은 그림의 짝을 모두 찾아보세요
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

        <Button className="w-full mt-auto" size="lg" onClick={handleStart}>
          게임 시작
        </Button>
      </div>
    );
  }

  if (phase === 'result') {
    return (
      <div className="flex flex-col items-center h-full px-10 pt-10 pb-6 text-center">
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
            {isCleared ? '미션 완료!' : '시간 종료'}
          </h3>
          <p className="mt-1 text-[14px] font-medium text-fg-tertiary">
            {isCleared
              ? `${moves}번 만에 모든 짝을 맞췄어요.`
              : `${matchedCount}/${PAIR_COUNT}쌍을 맞췄어요. 다시 도전해보세요!`}
          </p>
        </div>

        {isCleared && (
          <p className="mt-3 font-semibold text-body text-brand-promo-primary">
            배지 {reward}개 획득!
          </p>
        )}

        <div className="flex w-full gap-2 mt-auto">
          <Button variant="secondary" className="flex-1" onClick={handleStart}>
            다시 하기
          </Button>
          <Button className="flex-1" onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full px-5 pt-10 pb-6">
      <div className="w-full p-4 rounded-lg bg-surface-page">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-semibold text-fg-tertiary">
            나의 점수
          </span>
          <span className="rounded-md bg-surface-pressed px-2 py-1 text-[12px] font-bold text-fg-tertiary">
            {score}점
          </span>
        </div>

        <div className="mt-4 h-2 w-full rounded-[5px] bg-surface-pressed">
          <div
            className="h-2 rounded-[5px] bg-brand-promo-primary transition-all duration-300"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <p className="mt-3 text-caption text-fg-tertiary">
        남은 시간{' '}
        <strong
          className={timeLeft <= 10 ? 'text-semantic-error' : 'text-fg-primary'}
        >
          {timeLeft}초
        </strong>
      </p>

      <div
        className="grid gap-4 mt-10"
        style={{ gridTemplateColumns: `repeat(${COLUMN_COUNT}, 68px)` }}
      >
        {deck.map((card) => {
          const isFlipped = flipped.includes(card.id) || card.matched;
          const backImage = getBackImage(card.id);

          return (
            <div key={card.id} className="[perspective:1000px]">
              <button
                type="button"
                onClick={() => handleFlip(card.id)}
                disabled={isFlipped}
                style={{
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
                className="
                  relative aspect-[3/4] w-[68px]
                  transition-transform duration-500 [transform-style:preserve-3d]
                "
              >
                {/* 뒷면 (안 뒤집혔을 때 보임) */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl [backface-visibility:hidden]">
                  <img
                    src={backImage}
                    alt=""
                    className="object-contain w-full h-full"
                  />
                </div>

                {/* 앞면 (뒤집힌 후에 보임) */}
                <div
                  className={`
                    absolute inset-0 flex items-center justify-center
                    overflow-hidden rounded-xl border-2 border-border-brand
                    [backface-visibility:hidden] [transform:rotateY(180deg)]
                    ${card.matched ? 'bg-brand-promo-soft' : 'bg-surface-card'}
                  `}
                >
                  <img
                    src={FACE_IMAGES[card.faceIndex]}
                    alt=""
                    className="w-[55px] object-contain"
                  />
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* TODO: 나의 보유 뱃지/포인트 - 구현 여부 확정되면 추가 */}
    </div>
  );
}
