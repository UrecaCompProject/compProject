interface PlanTagProps {
  label: string;
  className?: string;
}

export default function PlanTag({ label, className = '' }: PlanTagProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[4px] border-[1.5px] border-brand-promo-primary bg-white px-2 py-1 text-center text-[12px] font-semibold text-brand-promo-secondary ${className}`}
    >
      {label}
    </span>
  );
}
