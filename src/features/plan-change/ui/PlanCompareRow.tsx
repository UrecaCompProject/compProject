interface PlanCompareRowProps {
  label: string;
  current: string;
  selected: string;
  /** 왼쪽(이용중인 요금제) 컬럼이 실제 내 요금제가 아니라
   *  드롭다운으로 바꾼 다른 요금제일 때 파란색으로 강조한다. */
  currentHighlighted?: boolean;
}

export default function PlanCompareRow({
  label,
  current,
  selected,
  currentHighlighted = false,
}: PlanCompareRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 py-3">
      <div className="flex flex-col gap-1">
        <p
          className={`text-[12px] font-medium ${
            currentHighlighted
              ? 'text-compare-selected-strong'
              : 'text-compare-neutral'
          }`}
        >
          {label}
        </p>
        <p
          className={`text-[14px] font-bold ${
            currentHighlighted
              ? 'text-compare-selected-strong'
              : 'text-fg-tertiary'
          }`}
        >
          {current}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[12px] font-medium text-compare-selected-strong">
          {label}
        </p>
        <p className="text-[14px] font-bold text-compare-selected-strong">
          {selected}
        </p>
      </div>
    </div>
  );
}
