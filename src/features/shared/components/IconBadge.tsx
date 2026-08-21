import type { LucideIcon } from 'lucide-react';

type IconBadgeColor = 'brand' | 'purple' | 'pink' | 'disabled';

interface IconBadgeProps {
  /** lucide-react 아이콘 컴포넌트 (예: Phone, MessageCircle) */
  icon: LucideIcon;
  color?: IconBadgeColor;
  /** 배지 한 변의 길이(px). 화면마다 값이 달라서 프리셋 대신 실측 px를 직접 받음. */
  size?: number;
  /** 모서리 radius(px). 원형이 필요하면 'full'. */
  radius?: number | 'full';
  /** 아이콘 크기(px) 직접 지정. 생략 시 size의 약 55%로 자동 계산. */
  iconSize?: number;
  /** 프리셋에 없는 배경색이 필요할 때 직접 지정 (Tailwind 클래스, 예: 'bg-teal-100') */
  bgColor?: string;
  /** 프리셋에 없는 아이콘 색이 필요할 때 직접 지정 (예: 'text-teal-600') */
  iconColor?: string;
  className?: string;
}

const colorClasses: Record<IconBadgeColor, { bg: string; icon: string }> = {
  brand: { bg: 'bg-brand-promo-soft', icon: 'text-brand-promo-primary' },
  purple: { bg: 'bg-[#955be0]/20', icon: 'text-[#955be0]' },
  pink: { bg: 'bg-accent-pink-soft', icon: 'text-accent-pink' },
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
