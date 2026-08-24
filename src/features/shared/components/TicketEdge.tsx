import { useId } from 'react';

interface TicketEdgeProps {
  width?: number | string;
  edgeHeight?: number;
  radius?: number;
  gap?: number;
  startOffset?: number;
  position?: 'top' | 'bottom';
  fill?: string;
  className?: string;
}

export default function TicketEdge({
  width = '100%',
  edgeHeight = 14,
  radius = 6,
  gap = 10,
  startOffset = 8,
  position = 'top',
  fill = 'var(--color-surface-card)',
  className = '',
}: TicketEdgeProps) {
  const id = useId();
  const maskId = `ticket-edge-mask-${id}`;
  const patternId = `ticket-edge-pattern-${id}`;
  const cy = position === 'top' ? 0 : edgeHeight;

  return (
    <svg
      className={`block ${className}`}
      style={{ width, height: edgeHeight }}
      preserveAspectRatio="none"
    >
      <defs>
        <pattern
          id={patternId}
          x={startOffset}
          width={gap}
          height={edgeHeight}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={gap / 2} cy={cy} r={radius} fill="black" />
        </pattern>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill="white" />
          <rect width="100%" height="100%" fill={`url(#${patternId})`} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={fill} mask={`url(#${maskId})`} />
    </svg>
  );
}
