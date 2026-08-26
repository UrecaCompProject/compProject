import badgeImage from '@/assets/images/badge.png';

type SmallBadgeProps = {
  value: number;
  ariaLabel?: string;
};

export default function SmallBadge({ value, ariaLabel }: SmallBadgeProps) {
  return (
    <span
      aria-label={ariaLabel}
      className="inline-flex h-[23px] w-[47px] shrink-0 items-center justify-center gap-1 rounded-[999px] border border-border bg-surface-card text-[12px] font-semibold leading-none text-compare-selected"
    >
      <img src={badgeImage} alt="" className="h-3 w-3 shrink-0" />
      {value.toLocaleString()}
    </span>
  );
}
