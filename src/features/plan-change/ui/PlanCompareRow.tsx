interface PlanCompareRowProps {
  label: string;
  current: string;
  selected: string;
}

export default function PlanCompareRow({
  label,
  current,
  selected,
}: PlanCompareRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 py-3">
      <div className="flex flex-col gap-1">
        <p className="text-[12px] font-medium text-compare-neutral">{label}</p>
        <p className="text-[14px] font-semibold text-fg-tertiary">{current}</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[12px] font-medium text-reward-active">{label}</p>
        <p className="text-[14px] font-bold text-reward-active">{selected}</p>
      </div>
    </div>
  );
}
