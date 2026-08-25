import IconBadge, { type IconBadgeColor } from './IconBadge';

import type { LucideIcon } from 'lucide-react';

type IconListItemVariant = 'plain' | 'badge' | 'bordered';

interface IconListItemProps {
  icon: LucideIcon;
  label: string;
  variant?: IconListItemVariant;
  badgeColor?: IconBadgeColor;
  iconColor?: string;
  iconSize?: number;
  textClassName?: string;
  className?: string;
}

export default function IconListItem({
  icon: Icon,
  label,
  variant = 'plain',
  badgeColor = 'brand',
  iconColor = 'text-fg-secondary',
  iconSize = 20,
  textClassName = 'text-sm text-fg-primary',
  className = '',
}: IconListItemProps) {
  const iconElement =
    variant === 'badge' ? (
      <IconBadge icon={Icon} color={badgeColor} size={28} />
    ) : (
      <Icon size={iconSize} className={iconColor} strokeWidth={2} />
    );

  const content = (
    <div className="flex items-center gap-2">
      {iconElement}
      <span className={textClassName}>{label}</span>
    </div>
  );

  if (variant === 'bordered') {
    return (
      <div
        className={`px-3 py-2 border rounded-lg border-border-default ${className}`}
      >
        {content}
      </div>
    );
  }

  return <div className={className}>{content}</div>;
}
