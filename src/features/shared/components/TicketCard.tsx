import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface TicketCardProps {
  radius?: number;
  gap?: number;
  startOffset?: number;
  fill?: string;
  className?: string;
  children: ReactNode;
}

interface Size {
  width: number;
  height: number;
}

/**
 * 상단/하단 가장자리에 반원 구멍이 뚫린(티켓 펀칭) 사각형 path를 만든다.
 * CSS mask-image 대신 SVG path + fill-rule="evenodd"로 직접 도형을 그려서
 * 브라우저의 CSS Masking 지원 여부와 무관하게 항상 렌더링되도록 한다.
 */
function buildPunchedPath(
  { width, height }: Size,
  radius: number,
  gap: number,
  startOffset: number,
): string {
  if (width <= 0 || height <= 0) return '';

  const rect = `M0,0 H${width} V${height} H0 Z`;
  const d = radius * 2;
  const circles: string[] = [];

  for (let cx = startOffset + gap / 2; cx < width + radius; cx += gap) {
    // 위쪽 가장자리 펀칭
    circles.push(
      `M${cx - radius},0 a${radius},${radius} 0 1,0 ${d},0 a${radius},${radius} 0 1,0 ${-d},0 Z`,
    );
    // 아래쪽 가장자리 펀칭
    circles.push(
      `M${cx - radius},${height} a${radius},${radius} 0 1,0 ${d},0 a${radius},${radius} 0 1,0 ${-d},0 Z`,
    );
  }

  return [rect, ...circles].join(' ');
}

export default function TicketCard({
  radius = 6,
  gap = 24,
  startOffset = 8,
  fill = 'var(--color-surface-card)',
  className = '',
  children,
}: TicketCardProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return undefined;

    const update = () =>
      setSize({ width: el.clientWidth, height: el.clientHeight });
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pathData = buildPunchedPath(size, radius, gap, startOffset);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <svg
        className="absolute inset-0"
        width="100%"
        height="100%"
        viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {pathData && <path d={pathData} fill={fill} fillRule="evenodd" />}
      </svg>

      <div className="relative px-4 py-4">{children}</div>
    </div>
  );
}
