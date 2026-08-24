interface PlanCompareRowProps {
  label: string;
  current: string;
  selected: string;
  currentSubtext?: string;
  selectedSubtext?: string;
}

export default function PlanCompareRow({
  label,
  current,
  selected,
  currentSubtext,
  selectedSubtext,
}: PlanCompareRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 py-3">
      <div className="flex flex-col gap-1">
        <p className="text-[12px] font-medium text-compare-neutral">{label}</p>
        <p className="text-[14px] font-semibold text-fg-primary">{current}</p>
        {currentSubtext && (
          <p className="text-[12px] text-fg-tertiary">{currentSubtext}</p>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[12px] font-medium text-compare-selected">{label}</p>
        <p className="text-[14px] font-bold text-compare-selected">
          {selected}
        </p>
        {selectedSubtext && (
          <p className="text-[12px] text-fg-tertiary">{selectedSubtext}</p>
        )}
      </div>
    </div>
  );
}
