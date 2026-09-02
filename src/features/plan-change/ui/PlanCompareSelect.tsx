import { ChevronDown } from 'lucide-react';

export interface PlanCompareOption {
  id: string;
  name: string;
}

interface PlanCompareSelectProps {
  value: string;
  options: PlanCompareOption[];
  activeId?: string;
  /** 사용자가 실제 이용 중인 요금제 id — 목록에서 '현재' 배지로 표시 */
  myPlanId?: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSelect?: (id: string) => void;
  /** 값 텍스트 색상 */
  colorClassName: string;
}

/**
 * 요금제명 행의 값 자리에 놓이는 셀렉트 박스.
 * 누르면 바로 아래에 요금제 목록 드롭다운이 열린다.
 */
export default function PlanCompareSelect({
  value,
  options,
  activeId,
  myPlanId,
  open,
  onToggle,
  onClose,
  onSelect,
  colorClassName,
}: PlanCompareSelectProps) {
  return (
    <div className="relative" data-compare-select>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-1 rounded-[8px] border border-border px-2.5 py-1.5 text-left text-[14px] font-bold ${colorClassName}`}
      >
        <span>{value}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-10 w-full min-w-[150px] max-w-[70vw] overflow-hidden rounded-xl border border-fg-disabled bg-surface-card shadow-shadow">
          <ul className="max-h-[240px] overflow-y-auto overscroll-contain py-1">
            {options.map((option) => {
              const isMyPlan = !!myPlanId && option.id === myPlanId;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect?.(option.id);
                      onClose();
                    }}
                    className={`flex w-full items-center justify-between gap-1.5 px-3 py-2 text-left text-[13px] ${
                      option.id === activeId
                        ? 'font-semibold text-brand-promo-primary'
                        : 'font-normal text-fg-secondary'
                    }`}
                  >
                    <span className="truncate">{option.name}</span>
                    {isMyPlan && (
                      <span className="shrink-0 rounded-full bg-brand-promo-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        현재
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
