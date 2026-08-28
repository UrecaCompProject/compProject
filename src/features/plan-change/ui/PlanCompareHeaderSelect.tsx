import { useRef, useState } from 'react';

import { ChevronDown } from 'lucide-react';

import { useClickOutside } from '@/shared';

export interface PlanCompareOption {
  id: string;
  name: string;
}

interface PlanCompareHeaderSelectProps {
  label: string;
  options?: PlanCompareOption[];
  onSelect?: (id: string) => void;
  activeId?: string;
  colorClassName: string;
}

/**
 * "이용중인 요금제 v" / "선택한 요금제 v" 헤더 라벨.
 * options가 있으면 눌렀을 때 요금제 드롭다운 리스트를 띄운다.
 * (텍스트 16px semibold, 텍스트-아이콘 간격 4px, 아이콘 21x21)
 */
export default function PlanCompareHeaderSelect({
  label,
  options,
  onSelect,
  activeId,
  colorClassName,
}: PlanCompareHeaderSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, open, () => setOpen(false));

  const hasOptions = (options?.length ?? 0) > 0;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => hasOptions && setOpen((prev) => !prev)}
        className={`flex items-center gap-1 text-[16px] font-semibold ${colorClassName} ${
          hasOptions ? 'cursor-pointer' : 'cursor-default'
        }`}
        aria-expanded={open}
      >
        {label}
        {hasOptions && (
          <ChevronDown
            size={21}
            className={`transition-transform ${open ? 'rotate-180' : ''}`}
          />
        )}
      </button>

      {open && hasOptions && (
        <ul className="absolute left-0 top-[calc(100%+8px)] z-10 max-h-[240px] w-[200px] overflow-y-auto rounded-xl border border-fg-disabled bg-surface-card py-1 shadow-shadow">
          {options!.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect?.(option.id);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-[13px] ${
                  option.id === activeId
                    ? 'font-semibold text-brand-promo-primary'
                    : 'font-normal text-fg-secondary'
                }`}
              >
                {option.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
