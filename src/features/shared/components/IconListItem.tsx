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
  className?: string;
}

export default function IconListItem({
  icon: Icon,
  label,
  variant = 'plain',
  badgeColor = 'brand',
  iconColor = 'text-fg-secondary',
  iconSize = 20,
  className = '',
}: IconListItemProps) {
  const iconElement =
    variant === 'badge' ? (
      <IconBadge icon={Icon} color={badgeColor} size={28} />
    ) : (
      <Icon size={iconSize} className={iconColor} strokeWidth={2} />
    );

  const content = (
    <div className={`flex items-center gap-2 ${className}`}>
      {iconElement}
      <span className="text-sm text-fg-primary">{label}</span>
    </div>
  );

  if (variant === 'bordered') {
    return (
      <div className="px-3 py-2 border rounded-lg border-border-default">
        {content}
      </div>
    );
  }

  return content;
}
