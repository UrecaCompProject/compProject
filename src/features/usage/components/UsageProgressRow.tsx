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
  const chooseColor = (label: string) => {
    switch (label) {
      case '5G 데이터':
        return 'reward-active';
      case '400kB 속도 데이터':
        return 'reward-active';
      case '유무선 통화':
        return '[#955BE0]';
      case '영상 & 부가 통화':
        return '[#955BE0]';
      case '메세지':
        return 'accent-primary';
      default:
        return 'reward-active';
    }
  };
  return (
    <div className="flex flex-col gap-2.5">
      <div className="w-full flex justify-between items-end text-fg-tertiary">
        <div className="text-regular-12-130">{label}</div>
        <div className="text-regular-14-130">
          <span className={`text-${chooseColor(label)} font-bold`}>
            {value}
          </span>
          {total && <> / {total}</>}
        </div>
      </div>
      <div className="relative w-full rounded-full bg-surface-pressed h-2.5">
        <div
          className={`absolute top-0 left-0 h-2.5 rounded-full bg-${chooseColor(label)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
