import type { LucideIcon } from 'lucide-react';

export type IconBadgeColor =
  'brand' | 'accent-purple' | 'accent-primary' | 'disabled';

interface IconBadgeProps {
  icon: LucideIcon;
  color?: IconBadgeColor;
  size?: number;
  radius?: number | 'full';
  /** 아이콘 크기(px) 직접 지정. 생략 시 size의 약 55%로 자동 계산. */
  iconSize?: number;
  bgColor?: string;
  iconColor?: string;
  className?: string;
}

const colorClasses: Record<IconBadgeColor, { bg: string; icon: string }> = {
  brand: { bg: 'bg-brand-promo-soft', icon: 'text-brand-promo-primary' },
  'accent-purple': {
    bg: 'bg-accent-purple-soft',
    icon: 'text-accent-purple-primary',
  },
  'accent-primary': { bg: 'bg-accent-soft', icon: 'text-accent-primary' },
  disabled: { bg: 'bg-surface-page', icon: 'text-fg-disabled' },
};

export default function IconBadge({
  icon: Icon,
  color = 'brand',
  size = 28,
  radius = 8,
  iconSize,
  bgColor,
  iconColor,
  className = '',
}: IconBadgeProps) {
  const preset = colorClasses[color];
  const resolvedIconSize = iconSize ?? Math.round(size * 0.55);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${bgColor ?? preset.bg} ${iconColor ?? preset.icon} ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: radius === 'full' ? '9999px' : radius,
      }}
    >
      <Icon size={resolvedIconSize} strokeWidth={2} />
    </span>
  );
}
