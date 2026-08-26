import type { ReactNode } from 'react';

interface UsageProgressRowProps {
  label: string;
  value: ReactNode;
  total?: ReactNode;
  percent: number;
}

export default function UsageProgressRow({
  label,
  value,
  total,
  percent,
}: UsageProgressRowProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="w-full flex justify-between items-end text-fg-tertiary">
        <div className="text-regular-12-130">{label}</div>
        <div className="text-regular-14-130">
          <span className="text-reward-active font-bold">{value}</span>
          {total && <> / {total}</>}
        </div>
      </div>
      <div className="relative w-full rounded-full bg-surface-pressed h-2.5">
        <div
          className="absolute top-0 left-0 h-2.5 rounded-full bg-reward-active"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
