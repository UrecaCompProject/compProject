import type { ReactNode } from 'react';

interface InfoRowProps {
  label: string;
  value: ReactNode;
  highlight?: boolean;
}

export default function InfoRow({
  label,
  value,
  highlight = false,
}: InfoRowProps) {
  return (
    <div className="w-full flex justify-between items-center h-4.5 text-fg-tertiary">
      <div className="text-regular-12-130">{label}</div>
      <div
        className={`text-regular-12-130 ${
          highlight ? 'text-reward-active font-bold text-[14px]' : 'font-medium'
        }`}
      >
        {value}
      </div>
    </div>
  );
}
