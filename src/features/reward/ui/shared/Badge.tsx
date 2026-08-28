import badgeImage from '@/shared/assets/images/badge.png';

type BadgeSize = 'large' | 'small';

type BadgeProps = {
  size: BadgeSize;
  value: number;
  ariaLabel?: string;
};

const sizeClasses: Record<BadgeSize, string> = {
  large: 'px-2.5 py-1.5 gap-1.25 text-[16px]',
  small: 'px-1.5 py-1 gap-0.75 text-[14px]',
};

const imageSizeClasses: Record<BadgeSize, string> = {
  large: 'h-[18px] w-[18px]',
  small: 'h-3.5 w-3.5',
};

export default function Badge({ size, value, ariaLabel }: BadgeProps) {
  return (
    <span
      aria-label={ariaLabel}
      className={`inline-flex w-fit shrink-0 items-center justify-center rounded-full border border-border bg-surface-card font-semibold leading-none text-brand-primary ${sizeClasses[size]}`}
    >
      <img
        src={badgeImage}
        alt=""
        className={`shrink-0 ${imageSizeClasses[size]}`}
      />
      {value.toLocaleString()}
    </span>
  );
}
