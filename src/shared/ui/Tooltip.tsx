import type { ReactNode } from 'react';

type TooltipPlacement = 'top' | 'bottom';

interface TooltipProps {
  children: ReactNode;
  placement?: TooltipPlacement;
  className?: string;
}

// hover 시 나타나는 작은 라벨. 부모 요소에 `group relative`가 있어야 하며,
// 아이콘 버튼 안에 형제로 두고 쓴다.
//   <button className="group relative ...">
//     <Icon />
//     <Tooltip>편집</Tooltip>
//   </button>
const placementClass: Record<TooltipPlacement, string> = {
  top: 'bottom-full mb-1',
  bottom: 'top-full mt-1',
};

export default function Tooltip({
  children,
  placement = 'bottom',
  className = '',
}: TooltipProps) {
  return (
    <span
      role="tooltip"
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-surface-card px-1.5 py-0.5 text-[11px] font-medium text-fg-secondary opacity-0 shadow-shadow transition-opacity group-hover:opacity-100 ${placementClass[placement]} ${className}`}
    >
      {children}
    </span>
  );
}
