import { useEffect, useRef, useState } from 'react';

import { Button } from '@/shared';
import badgeImage from '@/shared/assets/images/badge.svg';

const CARD_W = 316;
const CARD_H = 280;
const BRUSH_PADDING_X = 4; // 브러시가 가로로 꽉 차도록 최소한의 좌우 여백만 둔다
const HINT_DURATION = 1300; // 브러시가 한 방향으로 그려지는(또는 역재생되는) 시간
const HINT_HOLD_DURATION = 2000; // 다 그려진 뒤 멈춰있는 시간
const HINT_INTERVAL = 5600; // 정방향 + 홀드 + 역방향 + 여유시간
const CLEAR_THRESHOLD = 0.55; // 이 비율 이상 긁으면 자동으로 전체 오픈
const MAX_BADGE_REWARD = 5;

const LABEL = '여기를 긁어보세요';
const REWARD_DESCRIPTION = '나의 쿠폰함에서 확인해보세요';
const CTA_LABEL = '쿠폰함 확인하기';

// 브러시 경로 (373 x 216 viewBox 기준, 가로로 넓게 퍼지는 형태)
const BRUSH_D =
  'M30.0081 98.9688C88.5082 80.9701 163.474 10.97 173.844 34.9464C186.806 64.9169 95.4698 158.398 136.787 164.344C178.105 170.289 240.734 73.8738 268.758 59.343C296.782 44.8122 248.125 130.715 236.788 168.843C225.45 206.971 317.255 169.083 343.008 147.969';
const BRUSH_VB_W = 373;
const BRUSH_VB_H = 216;
const BRUSH_STROKE_WIDTH = 60; // 원본 SVG의 stroke-width 그대로 사용 (비율 유지를 위해 균일 scale에만 곱해짐)

const FONT = "700 19px 'Pretendard Variable', 'Pretendard', sans-serif";

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

type ScratchGameProps = {
  reward?: number;
  onWin?: (reward: number) => void;
  onClose?: () => void;
};

export default function ScratchGame({
  reward: rewardProp,
  onWin,
  onClose,
}: ScratchGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCleared, setIsCleared] = useState(false);

  // reward를 안 넘겨주면 1~5개 사이에서 랜덤으로 정해서 컴포넌트 생애주기 동안 고정 유지
  const [reward] = useState(
    () => rewardProp ?? Math.floor(Math.random() * MAX_BADGE_REWARD) + 1,
  );

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

    // 브러시가 눌리거나 늘어나지 않도록 가로/세로에 동일한 비율(scale)만 적용한다.
    // 가로는 카드 폭에 꽉 차게 맞추고, 세로는 그 비율을 그대로 따르되 텍스트 중앙에 오도록 정렬한다.
    const BRUSH_SIZE_MULTIPLIER = 1.5;
    const brushScale =
      ((CARD_W - BRUSH_PADDING_X * 2) / BRUSH_VB_W) * BRUSH_SIZE_MULTIPLIER;
    const brushOffsetX = (CARD_W - BRUSH_VB_W * brushScale) / 2;
    const brushOffsetY = (CARD_H - BRUSH_VB_H * brushScale) / 2;

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

    // 그라데이션 색 텍스트 스프라이트 (글자 모양만 남김)
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

    // 경로 길이 측정 (dash 애니메이션으로 "브러시가 지나가는" 효과 구현)
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

    // 마스크(텍스트 리빌)와 실제 보이는 흰 브러시가 반드시 같은 두께여야 서로 어긋나 보이지 않음
    const BRUSH_WIDTH = BRUSH_STROKE_WIDTH;

    function drawBrushMask(progress: number) {
      maskCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maskCtx.clearRect(0, 0, CARD_W, CARD_H);
      maskCtx.save();
      maskCtx.translate(brushOffsetX, brushOffsetY);
      maskCtx.scale(brushScale, brushScale);
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
      ctx!.translate(brushOffsetX, brushOffsetY);
      ctx!.scale(brushScale, brushScale);
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
      drawWhiteBrushStroke(progress); // 흰색 브러시 자체가 지나가는 모습
      ctx!.drawImage(revealCanvas, 0, 0, CARD_W, CARD_H); // 지나간 자리는 텍스트가 그라데이션 색으로 보임
    }

    let hintRAF = 0;
    let hintIntervalId = 0;
    let hintTimeoutId = 0;
    let userInteracted = false;

    // 브러시가 한 번 끝까지 그려진 뒤(0→1), HINT_HOLD_DURATION 만큼 멈췄다가
    // 다시 역재생(1→0)되어 텍스트가 원래의 흰색 상태로 되돌아간다.
    function playHint() {
      if (userInteracted) return;
      const forwardStart = performance.now();

      function stepForward(now: number) {
        if (userInteracted) return;
        const t = Math.min(1, (now - forwardStart) / HINT_DURATION);
        renderHintFrame(easeInOutQuad(t));
        if (t < 1) {
          hintRAF = requestAnimationFrame(stepForward);
          return;
        }
        hintTimeoutId = window.setTimeout(() => {
          if (userInteracted) return;
          const reverseStart = performance.now();

          function stepReverse(reverseNow: number) {
            if (userInteracted) return;
            const rt = Math.min(1, (reverseNow - reverseStart) / HINT_DURATION);
            renderHintFrame(easeInOutQuad(1 - rt));
            if (rt < 1) {
              hintRAF = requestAnimationFrame(stepReverse);
            } else {
              drawBase(ctx!); // 완전히 원래 상태로 복귀
            }
          }
          hintRAF = requestAnimationFrame(stepReverse);
        }, HINT_HOLD_DURATION);
      }

      hintRAF = requestAnimationFrame(stepForward);
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
    let hasCleared = false; // 클리어 판정 후 남은 pointermove/up에서 onWin이 중복 호출되지 않도록

    function stopHint() {
      if (userInteracted) return;
      userInteracted = true;
      if (hintRAF) cancelAnimationFrame(hintRAF);
      if (hintIntervalId) clearInterval(hintIntervalId);
      if (hintTimeoutId) clearTimeout(hintTimeoutId);
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
      if (hasCleared) return;

      const data = ctx!.getImageData(0, 0, canvas!.width, canvas!.height).data;
      let transparent = 0;
      let total = 0;
      const step = 4 * 8; // 성능을 위해 일부 픽셀만 샘플링
      for (let i = 3; i < data.length; i += step) {
        total++;
        if (data[i] < 40) transparent++;
      }
      if (total > 0 && transparent / total > CLEAR_THRESHOLD) {
        hasCleared = true;
        ctx!.clearRect(0, 0, CARD_W, CARD_H);
        canvas!.removeEventListener('pointerdown', onDown);
        canvas!.removeEventListener('pointermove', onMove);
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
      if (hintTimeoutId) clearTimeout(hintTimeoutId);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      document.body.removeChild(measureSvg);
    };
  }, []); // 마운트 시 1회만 초기화 (reward/onWin은 ref로 최신값 참조)

  return (
    <div className="flex flex-col items-center gap-3.5">
      <div className="relative h-[280px] w-[316px] overflow-hidden rounded-[20px] bg-surface-card shadow-[inset_0_4px_4px_0_rgba(255,255,255,0.25),0_4px_40px_0_rgba(0,0,0,0.1)]">
        <div className="absolute inset-0 box-border flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#6C5CE7] to-[#7C9BFF] px-6 text-center text-white">
          <img src={badgeImage} alt="" className="w-12 h-12" />
          <div className="text-[19px] font-bold">배지 {reward}개 획득!</div>
          <div className="mb-1 text-[13px] opacity-85">
            {REWARD_DESCRIPTION}
          </div>
          <Button
            variant="secondary"
            size="sm"
            round
            className="mt-1"
            onClick={onClose}
          >
            {CTA_LABEL}
          </Button>
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
