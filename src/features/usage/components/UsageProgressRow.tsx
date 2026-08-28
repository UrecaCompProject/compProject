import type { ReactNode } from 'react';

interface UsageProgressRowProps {
  label: string;
  value: ReactNode;
  total?: ReactNode;
  percent: number;
}

// Tailwind는 빌드 시 동적 문자열(text-${color})을 인식하지 못하므로, 완결된 클래스명을 직접 매핑해야 함
const COLOR_CLASSES: Record<string, { text: string; bar: string }> = {
  '5G 데이터': { text: 'text-reward-active', bar: 'bg-reward-active' },
  '400kB 속도 데이터': { text: 'text-reward-active', bar: 'bg-reward-active' },
  '유무선 통화': { text: 'text-[#955BE0]', bar: 'bg-[#955BE0]' },
  '영상 & 부가 통화': { text: 'text-[#955BE0]', bar: 'bg-[#955BE0]' },
  메세지: { text: 'text-accent-primary', bar: 'bg-accent-primary' },
};
const DEFAULT_COLOR_CLASSES = {
  text: 'text-reward-active',
  bar: 'bg-reward-active',
};

export default function UsageProgressRow({
  label,
  value,
  total,
  percent,
}: UsageProgressRowProps) {
  const { text: textClass, bar: barClass } =
    COLOR_CLASSES[label] ?? DEFAULT_COLOR_CLASSES;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="w-full flex justify-between items-end text-fg-tertiary">
        <div className="text-regular-12-130">{label}</div>
        <div className="text-regular-14-130">
          <span className={`${textClass} font-bold`}>{value}</span>
          {total && <> / {total}</>}
        </div>
      </div>
      <div className="relative w-full rounded-full bg-surface-pressed h-2.5">
        <div
          className={`absolute top-0 left-0 h-2.5 rounded-full ${barClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
