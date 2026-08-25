import { useEffect, useRef, useState } from 'react';

import { Gift } from 'lucide-react';

import { Button } from '@/features/shared';

const CANVAS_WIDTH = 280;
const CANVAS_HEIGHT = 140;
const BRUSH_RADIUS = 18;
/** 이 비율 이상 긁으면 나머지를 자동으로 전체 공개 */
const AUTO_REVEAL_THRESHOLD = 0.5;

type ScratchGameProps = {
  reward?: number;
  onWin?: (reward: number) => void;
  /** 채팅 인라인이라 필수 아님. 넘겨주면 결과 확인 후 "확인" 버튼이 뜸 */
  onClose?: () => void;
};

/**
 * 채팅 메시지 리스트 안에 인라인으로 렌더링될 걸 가정한 독립 컴포넌트.
 * useGameStore/GameLayer 등 바텀시트 계열 게임 인프라와는 무관하게 동작함.
 * (채팅 쪽에 실제로 어떻게 끼워넣을지는 별도 작업)
 */
export default function ScratchGame({
  reward = 3,
  onWin,
  onClose,
}: ScratchGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPointerDown = useRef(false);
  const hasWonRef = useRef(false);
  const [revealed, setRevealed] = useState(false);

  // 커버 레이어 초기 렌더 (긁으면 지워지는 회색 코팅 + 안내 문구)
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height,
    );
    gradient.addColorStop(0, '#C7D2FE');
    gradient.addColorStop(1, '#A5B4FC');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '600 14px Pretendard, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      '🎁 긁어서 확인해보세요!',
      canvas.width / 2,
      canvas.height / 2,
    );

    ctx.globalCompositeOperation = 'destination-out';
  }, []);

  const getScratchedRatio = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return 0;

    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let transparentPixels = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] === 0) transparentPixels++;
    }
    return transparentPixels / (data.length / 4);
  };

  const finishReveal = () => {
    setRevealed(true);
    if (!hasWonRef.current) {
      hasWonRef.current = true;
      onWin?.(reward);
    }
  };

  const scratchAt = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.beginPath();
    ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    if (getScratchedRatio() > AUTO_REVEAL_THRESHOLD) {
      finishReveal();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (revealed) return;
    isPointerDown.current = true;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDown.current || revealed) return;
    scratchAt(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isPointerDown.current = false;
  };

  return (
    <div className="flex w-full max-w-[280px] flex-col items-center gap-3">
      <div className="relative w-full overflow-hidden border rounded-2xl border-border bg-surface-card shadow-shadow">
        {/* 결과 레이어: 항상 아래 깔려있고, 스크래치로 드러남 */}
        <div className="flex flex-col items-center justify-center gap-1.5 px-4 py-7 text-center">
          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-promo-soft">
            <Gift size={20} className="text-brand-promo-primary" />
          </span>
          <p className="font-semibold text-body text-fg-primary">
            배지 {reward}개 당첨!
          </p>
          <p className="text-caption text-fg-tertiary">
            축하해요, 스크래치 이벤트에 당첨되셨어요.
          </p>
        </div>

        {/* 스크래치 캔버스: 다 긁기 전까지 위를 덮음 */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="absolute inset-0 w-full h-full cursor-pointer touch-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
        )}
      </div>

      {revealed && onClose && (
        <Button className="w-full" onClick={onClose}>
          확인
        </Button>
      )}
    </div>
  );
}
