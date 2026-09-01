import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface TicketCardProps {
  radius?: number;
  gap?: number;
  startOffset?: number;
  fill?: string;
  className?: string;
  /** 내용 영역 패딩. 기본 'px-4 py-8'. */
  contentClassName?: string;
  children: ReactNode;
}

interface Size {
  width: number;
  height: number;
}

function buildPunchedPath(
  { width, height }: Size,
  radius: number,
  gap: number,
  startOffset: number,
): string {
  if (width <= 0 || height <= 0) return '';

  const rect = `M0,0 H${width} V${height} H0 Z`;
  const d = radius * 2;

  const usable = Math.max(width - startOffset * 2, 0);
  const count = Math.max(1, Math.round(usable / gap) + 1);
  const step = count > 1 ? usable / (count - 1) : 0;

  const circles: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const cx = startOffset + step * i;
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
  radius = 7,
  gap = 24,
  startOffset,
  fill = 'var(--color-surface-card)',
  className = '',
  contentClassName = 'px-4 py-8',
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

  const effectiveStartOffset = startOffset ?? gap;
  const pathData = buildPunchedPath(size, radius, gap, effectiveStartOffset);

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

      <div className={`relative ${contentClassName}`}>{children}</div>
    </div>
  );
}
