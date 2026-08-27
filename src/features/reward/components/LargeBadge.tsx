import badgeImage from '@/assets/images/badge.png';

type LargeBadgeProps = {
  value: number;
  ariaLabel?: string;
};

export default function LargeBadge({ value, ariaLabel }: LargeBadgeProps) {
  return (
    <span
      aria-label={ariaLabel}
      className="inline-flex h-8 w-[52px] shrink-0 items-center justify-center gap-1 rounded-[999px] border border-border bg-surface-card text-[16px] font-semibold leading-none text-compare-selected"
    >
      <img src={badgeImage} alt="" className="h-[18px] w-[18px] shrink-0" />
      {value.toLocaleString()}
    </span>
  );
}
