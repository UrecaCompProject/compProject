interface PlanCompareBenefitListRowProps {
  label: string;
  current: string[];
  selected: string[];
  /** 왼쪽 컬럼이 내 요금제가 아닐 때 파란색 강조 */
  currentHighlighted?: boolean;
}

function BulletList({
  items,
  className,
}: {
  items: string[];
  className: string;
}) {
  const list = items.length > 0 ? items : ['해당 없음'];
  return (
    <ul className={`flex flex-col gap-1 text-[14px] ${className}`}>
      {list.map((item) => (
        <li key={item} className="flex gap-1">
          <span aria-hidden>·</span>
          <span className="whitespace-pre-line">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** 압축/전체 비교에서 '대표 혜택'을 불릿 리스트로 보여주는 행 */
export default function PlanCompareBenefitListRow({
  label,
  current,
  selected,
  currentHighlighted = false,
}: PlanCompareBenefitListRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 py-3">
      <div className="flex flex-col gap-1">
        <p
          className={`text-[12px] font-medium ${
            currentHighlighted ? 'text-brand-primary' : 'text-compare-neutral'
          }`}
        >
          {label}
        </p>
        <BulletList
          items={current}
          className={`font-semibold ${
            currentHighlighted ? 'text-brand-primary' : 'text-fg-tertiary'
          }`}
        />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-[12px] font-medium text-compare-selected">{label}</p>
        <BulletList
          items={selected}
          className="font-bold text-compare-selected"
        />
      </div>
    </div>
  );
}
