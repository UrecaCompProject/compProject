import { useEffect, useRef, useState } from 'react';

const CARD_W = 316;
const CARD_H = 280;
const PADDING = 26; // 사각형 안쪽 패딩 (20~30px 범위)
const HINT_DURATION = 1300;
const HINT_INTERVAL = 4200;
const CLEAR_THRESHOLD = 0.55; // 이 비율 이상 긁으면 자동으로 전체 오픈

const LABEL = '여기를 긁어보세요';
const REWARD_EMOJI = '🎉';
const REWARD_DESCRIPTION = '마이 혜택함에서 바로 사용해보세요';
const CTA_LABEL = '받기';

// 브러시 경로 (298 x 230 viewBox 기준)
const BRUSH_D =
  'M25.0004 96.4029C52.297 64.5028 109.482 6.69675 119.852 30.6732C132.814 60.6437 23.9571 197.928 65.2748 203.874C106.592 209.82 189.621 110.156 217.645 95.6257C245.67 81.0949 226.104 139.948 214.766 178.075C203.429 216.203 246.828 191.202 272.58 170.088';
const BRUSH_VB_W = 298;
const BRUSH_VB_H = 230;

const FONT =
  "600 20px -apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif";

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

type ScratchGameProps = {
  reward?: number;
  onWin?: (reward: number) => void;
  onClose?: () => void;
};

export default function ScratchGame({
  reward = 1,
  onWin,
  onClose,
}: ScratchGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCleared, setIsCleared] = useState(false);

  // 캔버스 setup effect는 마운트 시 한 번만 실행되어야 하므로
  // reward/onWin은 ref로 최신값을 참조한다 (참조가 바뀌어도 effect 재실행 X).
  const rewardRef = useRef(reward);
  const onWinRef = useRef(onWin);
  useEffect(() => {
    rewardRef.current = reward;
  }, [reward]);
  useEffect(() => {
    onWinRef.current = onWin;
  }, [onWin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = CARD_W * dpr;
    canvas.height = CARD_H * dpr;
    canvas.style.width = `${CARD_W}px`;
    canvas.style.height = `${CARD_H}px`;
    ctx.scale(dpr, dpr);

    const scaleX = (CARD_W - PADDING * 2) / BRUSH_VB_W;
    const scaleY = (CARD_H - PADDING * 2) / BRUSH_VB_H;

    function paintGradient(target: CanvasRenderingContext2D) {
      const gradient = target.createLinearGradient(0, 0, CARD_W, CARD_H);
      gradient.addColorStop(0, '#B8B4F0');
      gradient.addColorStop(1, '#BCD1FF');
      target.fillStyle = gradient;
      target.fillRect(0, 0, CARD_W, CARD_H);
    }

    function drawBase(target: CanvasRenderingContext2D) {
      paintGradient(target);
      target.font = FONT;
      target.fillStyle = '#ffffff';
      target.textAlign = 'center';
      target.textBaseline = 'middle';
      target.fillText(LABEL, CARD_W / 2, CARD_H / 2);
    }

    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = CARD_W * dpr;
    spriteCanvas.height = CARD_H * dpr;
    const spriteCtx = spriteCanvas.getContext('2d')!;
    spriteCtx.scale(dpr, dpr);
    paintGradient(spriteCtx);
    spriteCtx.globalCompositeOperation = 'destination-in';
    spriteCtx.font = FONT;
    spriteCtx.fillStyle = '#000';
    spriteCtx.textAlign = 'center';
    spriteCtx.textBaseline = 'middle';
    spriteCtx.fillText(LABEL, CARD_W / 2, CARD_H / 2);
    spriteCtx.globalCompositeOperation = 'source-over';

    const svgNS = 'http://www.w3.org/2000/svg';
    const measureSvg = document.createElementNS(svgNS, 'svg');
    const measurePath = document.createElementNS(svgNS, 'path');
    measurePath.setAttribute('d', BRUSH_D);
    measureSvg.appendChild(measurePath);
    measureSvg.setAttribute(
      'style',
      'position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;',
    );
    document.body.appendChild(measureSvg);
    const pathLen = measurePath.getTotalLength();

    const brushPath2D = new Path2D(BRUSH_D);

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = CARD_W * dpr;
    maskCanvas.height = CARD_H * dpr;
    const maskCtx = maskCanvas.getContext('2d')!;

    const BRUSH_WIDTH = 64;

    function drawBrushMask(progress: number) {
      maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maskCtx.clearRect(0, 0, CARD_W, CARD_H);
      maskCtx.save();
      maskCtx.translate(PADDING, PADDING);
      maskCtx.scale(scaleX, scaleY);
      maskCtx.lineWidth = BRUSH_WIDTH;
      maskCtx.lineCap = 'round';
      maskCtx.lineJoin = 'round';
      maskCtx.strokeStyle = '#fff';
      maskCtx.setLineDash([pathLen, pathLen]);
      maskCtx.lineDashOffset = pathLen * (1 - progress);
      maskCtx.stroke(brushPath2D);
      maskCtx.restore();
    }

    function drawWhiteBrushStroke(progress: number) {
      ctx!.save();
      ctx!.translate(PADDING, PADDING);
      ctx!.scale(scaleX, scaleY);
      ctx!.lineWidth = BRUSH_WIDTH;
      ctx!.lineCap = 'round';
      ctx!.lineJoin = 'round';
      ctx!.strokeStyle = '#ffffff';
      ctx!.setLineDash([pathLen, pathLen]);
      ctx!.lineDashOffset = pathLen * (1 - progress);
      ctx!.stroke(brushPath2D);
      ctx!.restore();
    }

    const revealCanvas = document.createElement('canvas');
    revealCanvas.width = CARD_W * dpr;
    revealCanvas.height = CARD_H * dpr;
    const revealCtx = revealCanvas.getContext('2d')!;

    function renderHintFrame(progress: number) {
      drawBrushMask(progress);

      revealCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      revealCtx.clearRect(0, 0, CARD_W, CARD_H);
      revealCtx.drawImage(spriteCanvas, 0, 0, CARD_W, CARD_H);
      revealCtx.globalCompositeOperation = 'destination-in';
      revealCtx.drawImage(maskCanvas, 0, 0, CARD_W, CARD_H);
      revealCtx.globalCompositeOperation = 'source-over';

      drawBase(ctx!);
      drawWhiteBrushStroke(progress);
      ctx!.drawImage(revealCanvas, 0, 0, CARD_W, CARD_H);
    }

    let hintRAF = 0;
    let hintIntervalId = 0;
    let userInteracted = false;

    function playHint() {
      if (userInteracted) return;
      const start = performance.now();
      function step(now: number) {
        if (userInteracted) return;
        const t = Math.min(1, (now - start) / HINT_DURATION);
        renderHintFrame(easeInOutQuad(t));
        if (t < 1) {
          hintRAF = requestAnimationFrame(step);
        } else {
          window.setTimeout(() => {
            if (!userInteracted) drawBase(ctx!);
          }, 300);
        }
      }
      hintRAF = requestAnimationFrame(step);
    }

    function startHintLoop() {
      drawBase(ctx!);
      window.setTimeout(playHint, 500);
      hintIntervalId = window.setInterval(() => {
        if (!userInteracted) playHint();
      }, HINT_INTERVAL);
    }

    // ---- 실제 스크래치 인터랙션 ----
    let scratching = false;
    let lastPoint: { x: number; y: number } | null = null;

    function stopHint() {
      if (userInteracted) return;
      userInteracted = true;
      if (hintRAF) cancelAnimationFrame(hintRAF);
      if (hintIntervalId) clearInterval(hintIntervalId);
      drawBase(ctx!); // 힌트 도중이었다면 깨끗한 기본 상태로 되돌린 뒤 스크래치 시작
    }

    function getPoint(e: PointerEvent): { x: number; y: number } {
      const rect = canvas!.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    function scratchAt(p: { x: number; y: number }) {
      ctx!.globalCompositeOperation = 'destination-out';
      ctx!.lineCap = 'round';
      ctx!.lineJoin = 'round';
      ctx!.lineWidth = 46;
      ctx!.beginPath();
      if (lastPoint) {
        ctx!.moveTo(lastPoint.x, lastPoint.y);
        ctx!.lineTo(p.x, p.y);
      } else {
        ctx!.moveTo(p.x, p.y);
        ctx!.lineTo(p.x + 0.01, p.y + 0.01);
      }
      ctx!.stroke();
      ctx!.globalCompositeOperation = 'source-over';
      lastPoint = p;
    }

    function checkCleared() {
      const data = ctx!.getImageData(0, 0, canvas!.width, canvas!.height).data;
      let transparent = 0;
      let total = 0;
      const step = 4 * 8;
      for (let i = 3; i < data.length; i += step) {
        total++;
        if (data[i] < 40) transparent++;
      }
      if (total > 0 && transparent / total > CLEAR_THRESHOLD) {
        ctx!.clearRect(0, 0, CARD_W, CARD_H);
        canvas!.removeEventListener('pointerdown', onDown);
        canvas!.style.pointerEvents = 'none';
        canvas!.style.cursor = 'default';
        setIsCleared(true);
        onWinRef.current?.(rewardRef.current);
      }
    }

    function onDown(e: PointerEvent) {
      e.preventDefault();
      stopHint();
      scratching = true;
      lastPoint = null;
      scratchAt(getPoint(e));
    }
    function onMove(e: PointerEvent) {
      if (!scratching) return;
      e.preventDefault();
      scratchAt(getPoint(e));
      checkCleared();
    }
    function onUp() {
      scratching = false;
      lastPoint = null;
      checkCleared();
    }

    canvas.style.pointerEvents = 'auto';
    canvas.style.cursor = 'grab';
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    startHintLoop();

    return () => {
      userInteracted = true;
      if (hintRAF) cancelAnimationFrame(hintRAF);
      if (hintIntervalId) clearInterval(hintIntervalId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.removeChild(measureSvg);
    };
  }, []); // 마운트 시 1회만 초기화 (reward/onWin은 ref로 최신값 참조)

  return (
    <div className="flex flex-col items-center gap-3.5">
      <div className="relative h-70 w-79 overflow-hidden rounded-[20px] bg-surface-card shadow-[inset_0_4px_4px_0_rgba(255,255,255,0.25),0_4px_40px_0_rgba(0,0,0,0.1)]">
        <div className="absolute inset-0 box-border flex flex-col items-center justify-center gap-2 bg-linear-to-br from-[#6C5CE7] to-[#7C9BFF] px-6 text-center text-white">
          <div className="text-[38px] leading-none">{REWARD_EMOJI}</div>
          <div className="text-[19px] font-bold">
            데이터 {reward}GB 쿠폰 당첨
          </div>
          <div className="mb-1 text-[13px] opacity-85">
            {REWARD_DESCRIPTION}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 rounded-full bg-white px-6 py-2.5 text-[13px] font-bold text-[#5B4BDB]"
          >
            {CTA_LABEL}
          </button>
        </div>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block cursor-grab touch-none"
        />
      </div>
      {!isCleared && (
        <div className="text-medium-12-130 text-fg-tertiary">
          스크래치 카드를 긁어보세요
        </div>
      )}
    </div>
  );
}
