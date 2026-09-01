import { useEffect, useMemo, useRef, useState } from 'react';

import badgeImage from '@/shared/assets/images/badge.svg';
import backImage from '@/shared/assets/images/card-match-back-03.svg';
import faceImage02 from '@/shared/assets/images/card-match-face-02.svg';
import faceImage03 from '@/shared/assets/images/card-match-face-03.svg';
import faceImage05 from '@/shared/assets/images/card-match-face-05.svg';
import faceImage06 from '@/shared/assets/images/card-match-face-06.svg';
import faceImage11 from '@/shared/assets/images/card-match-face-11.svg';
import faceImage19 from '@/shared/assets/images/card-match-face-19.svg';
import introImage from '@/shared/assets/images/card-match-intro.svg';

import { CARD_MATCH_RULES } from '../../mocks/rules';
import { useGameStore } from '../../model/useGameStore';
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
  faceImage11,
  faceImage02,
  faceImage03,
  faceImage19,
  faceImage05,
  faceImage06,
];

// 각 그림에서 스포이드로 뽑은 대표 색
const FACE_COLORS = [
  '#77af4e', // 11 green (배터리)
  '#af98e5', // 02 purple
  '#26a5f9', // 03 sky
  '#fdb01f', // 19 gold (돈)
  '#fd672c', // 05 orange
  '#f96692', // 06 pink
];

// 앞면 배경색: 대표 색을 흰색과 섞어 아주 연하게
const FACE_TINTS = [
  '#ebf3e4', // 11 green
  '#f3f0fb', // 02 purple
  '#def2fe', // 03 sky
  '#fff3dd', // 19 gold
  '#ffe8df', // 05 orange
  '#fee8ef', // 06 pink
];

const COLUMN_COUNT = 4;
const PAIR_COUNT = FACE_IMAGES.length; // 6쌍 = 12장
const TIME_LIMIT = 30; // 초
const PREVIEW_DELAY = 400; // 시작 후 카드를 뒤집기까지 기다리는 시간(ms)
const PREVIEW_DURATION = 2500; // 전체 카드를 보여주는 시간(ms)

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
  const [preview, setPreview] = useState(false);
  const [previewDone, setPreviewDone] = useState(false);
  // 맞춘 순서대로 쌓이는 faceIndex 목록 (점수 표시 칸을 카드 색으로 채우는 데 사용)
  const [matchedFaces, setMatchedFaces] = useState<number[]>([]);

  const matchedCount = useMemo(
    () => deck.filter((card) => card.matched).length / 2,
    [deck],
  );
  const isCleared = matchedCount === PAIR_COUNT;

  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // 시작하면 뒷면 상태 → 잠깐 뒤 전체를 뒤집어 보여줌 → 다시 덮는다
  useEffect(() => {
    if (phase !== 'playing') return;

    const flipIn = setTimeout(() => setPreview(true), PREVIEW_DELAY);
    const flipOut = setTimeout(() => {
      setPreview(false);
      setPreviewDone(true);
    }, PREVIEW_DELAY + PREVIEW_DURATION);

    return () => {
      clearTimeout(flipIn);
      clearTimeout(flipOut);
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing' || !previewDone) return;

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
  }, [phase, timeLeft, previewDone]);

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
    setPreview(false);
    setPreviewDone(false);
    setMatchedFaces([]);
    setPhase('playing');
  };

  const handleFlip = (id: number) => {
    if (!previewDone) return;
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
        const matchedFaceIndex = deck[firstId].faceIndex;

        setTimeout(() => {
          if (phaseRef.current !== 'playing') return;

          setDeck((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId
                ? { ...card, matched: true }
                : card,
            ),
          );
          setMatchedFaces((prev) => [...prev, matchedFaceIndex]);
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
          onClose={onClose}
        />
      }
      playing={
        <div className="flex flex-col items-center h-full px-4 pt-6 pb-6">
          <div className="w-full p-4 rounded-lg bg-surface-page">
            {/* 남은 시간: 라벨 + 초 + 줄어드는 게이지바 */}
            <div className="flex items-baseline justify-between">
              <span className="text-[15px] font-semibold text-fg-secondary">
                남은 시간
              </span>
              <span
                className={`text-[14px] font-bold ${
                  timeLeft <= 10 ? 'text-game-timer-alert' : 'text-fg-primary'
                }`}
              >
                {timeLeft}
                <span className="text-fg-tertiary">초</span>
              </span>
            </div>

            <div className="mt-2 h-2 w-full rounded-[5px] bg-border">
              <div
                className={`h-2 rounded-[5px] transition-[width] duration-1000 ease-linear ${
                  timeLeft <= 10
                    ? 'bg-game-timer-alert'
                    : 'bg-brand-promo-primary'
                }`}
                style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
              />
            </div>

            {/* 맞춘 짝: 쌍 수만큼 칸이 채워지는 카드 모양 표시 */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[15px] font-semibold text-fg-secondary">
                맞춘 짝
              </span>
              <div className="flex gap-1">
                {Array.from({ length: PAIR_COUNT }).map((_, i) => {
                  const faceIndex = matchedFaces[i];
                  const filled = faceIndex !== undefined;
                  return (
                    <span
                      key={i}
                      className={`h-3.5 w-2.5 rounded-[3px] transition-colors duration-300 ${
                        filled ? '' : 'bg-border'
                      }`}
                      style={
                        filled
                          ? { backgroundColor: FACE_COLORS[faceIndex] }
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center w-full gap-5 mt-8">
            <div className="w-full p-4 rounded-lg bg-surface-card">
              <div
                className="grid gap-2.5"
                style={{
                  gridTemplateColumns: `repeat(${COLUMN_COUNT}, minmax(0, 1fr))`,
                }}
              >
                {deck.map((card) => {
                  const isFlipped =
                    preview || flipped.includes(card.id) || card.matched;

                  return (
                    <div key={card.id} className="[perspective:1000px]">
                      <button
                        type="button"
                        onClick={() => handleFlip(card.id)}
                        disabled={isFlipped}
                        style={{
                          transform: `${
                            isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                          }${card.matched ? ' scale(0.82)' : ''}`,
                        }}
                        className="
                        relative aspect-[3/4] w-full
                        transition-transform duration-500 ease-out [transform-style:preserve-3d]
                      "
                      >
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl [backface-visibility:hidden]">
                          <img
                            src={backImage}
                            alt=""
                            className="h-full w-full object-contain drop-shadow-sm"
                          />
                        </div>

                        <div
                          className={`
                          absolute inset-0 flex items-center justify-center
                          overflow-hidden rounded-xl border-[3px] drop-shadow-sm
                          transition-colors duration-500
                          [backface-visibility:hidden] [transform:rotateY(180deg)]
                          ${
                            card.matched
                              ? 'border-border bg-surface-page'
                              : 'bg-surface-card'
                          }
                        `}
                          style={
                            card.matched
                              ? undefined
                              : {
                                  backgroundColor: FACE_TINTS[card.faceIndex],
                                  borderColor: FACE_COLORS[card.faceIndex],
                                }
                          }
                        >
                          {/* 매칭 완료: 카드가 작아지고(버튼 scale) 앞면 그림은 회색으로 → '해결됨'이 명확 */}
                          <img
                            src={FACE_IMAGES[card.faceIndex]}
                            alt=""
                            className={`w-[68%] object-contain transition duration-500 ${
                              card.matched ? 'opacity-50 grayscale' : ''
                            }`}
                          />
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-caption font-medium text-fg-tertiary">
              <img src={badgeImage} alt="" className="h-4 w-4" />
              모든 짝을 맞추면 배지 {reward}개를 받아요
            </div>
          </div>
        </div>
      }
    />
  );
}
