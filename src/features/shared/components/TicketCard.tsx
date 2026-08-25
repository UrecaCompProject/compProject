import type { ReactNode } from 'react';

interface TicketCardProps {
  radius?: number;
  gap?: number;
  startOffset?: number;
  fill?: string;
  className?: string;
  children: ReactNode;
}

export default function TicketCard({
  radius = 6,
  gap = 10,
  startOffset = 8,
  fill = 'var(--color-surface-card)',
  className = '',
  children,
}: TicketCardProps) {
  const topGradient = `radial-gradient(circle at ${gap / 2}px 0px, transparent ${radius}px, black ${radius}px)`;
  const bottomGradient = `radial-gradient(circle at ${gap / 2}px 100%, transparent ${radius}px, black ${radius}px)`;

  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 shadow-shadow"
        style={{
          backgroundColor: fill,
          WebkitMaskImage: `${topGradient}, ${bottomGradient}`,
          maskImage: `${topGradient}, ${bottomGradient}`,
          WebkitMaskRepeat: 'repeat-x, repeat-x',
          maskRepeat: 'repeat-x, repeat-x',
          WebkitMaskSize: `${gap}px 100%, ${gap}px 100%`,
          maskSize: `${gap}px 100%, ${gap}px 100%`,
          WebkitMaskPosition: `${startOffset}px 0, ${startOffset}px 0`,
          maskPosition: `${startOffset}px 0, ${startOffset}px 0`,
        }}
      />

      <div className="relative px-4 py-4">{children}</div>
    </div>
  );
}
