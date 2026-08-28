import { useEffect, useMemo, useRef, useState } from 'react';

import backImage1 from '@/assets/images/card-match-back-01.svg';
import backImage2 from '@/assets/images/card-match-back-02.svg';
import faceImage01 from '@/assets/images/card-match-face-01.svg';
import faceImage02 from '@/assets/images/card-match-face-02.svg';
import faceImage03 from '@/assets/images/card-match-face-03.svg';
import faceImage04 from '@/assets/images/card-match-face-04.svg';
import faceImage05 from '@/assets/images/card-match-face-05.svg';
import faceImage06 from '@/assets/images/card-match-face-06.svg';
import introImage from '@/assets/images/card-match-intro.svg';

import { CARD_MATCH_RULES } from '../../mocks/rules';
import { useGameStore } from '../../store/useGameStore';
import GameResultCard from '../GameResultCard';
import GameRulesCard from '../GameRulesCard';
import GameShell from '../GameShell';

import type { GamePhase } from '../../types';

type CardItem = {
  id: number;
  faceIndex: number;
  matched: boolean;
};

// TODO: 난이도별 쌍 개수/시간 나중에 추가 (지금은 무난하게 6쌍 고정)
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

  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

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
          if (phaseRef.current !== 'playing') return;

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

  return (
    <GameShell
      phase={phase}
      intro={<GameRulesCard {...CARD_MATCH_RULES} onStart={handleStart} />}
      result={
        <GameResultCard
          image={introImage}
          title={isCleared ? '미션 완료!' : '시간 종료'}
          description={
            isCleared
              ? `${moves}번 만에 모든 짝을 맞췄어요.`
              : `${matchedCount}/${PAIR_COUNT}쌍을 맞췄어요. 다시 도전해보세요!`
          }
          rewardCount={isCleared ? reward : undefined}
          onRetry={handleStart}
          onClose={onClose}
        />
      }
      playing={
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
              className={
                timeLeft <= 10 ? 'text-semantic-error' : 'text-fg-primary'
              }
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
                      transform: isFlipped
                        ? 'rotateY(180deg)'
                        : 'rotateY(0deg)',
                    }}
                    className="
                      relative aspect-[3/4] w-[68px]
                      transition-transform duration-500 [transform-style:preserve-3d]
                    "
                  >
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl [backface-visibility:hidden]">
                      <img
                        src={backImage}
                        alt=""
                        className="object-contain w-full h-full"
                      />
                    </div>

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
      }
    />
  );
}
