import IconBadge, { type IconBadgeColor } from './IconBadge';

import type { LucideIcon } from 'lucide-react';

type IconListItemVariant = 'plain' | 'badge' | 'bordered';

interface IconListItemProps {
  icon: LucideIcon;
  label: string;
  /** label 아래 보조 설명 한 줄. 넘기면 label(제목) + description(2줄) 구조로 렌더 */
  description?: string;
  descriptionClassName?: string;
  variant?: IconListItemVariant;
  badgeColor?: IconBadgeColor;
  /** variant="badge"일 때 IconBadge 크기(px). 기본 28. */
  badgeSize?: number;
  iconColor?: string;
  iconSize?: number;
  textClassName?: string;
  className?: string;
  gapClassName?: string;
}

export default function IconListItem({
  icon: Icon,
  label,
  description,
  descriptionClassName = 'text-caption text-fg-tertiary',
  variant = 'plain',
  badgeColor = 'brand',
  badgeSize = 28,
  iconColor = 'text-fg-secondary',
  iconSize = 20,
  textClassName = 'text-sm text-fg-primary',
  className = '',
  gapClassName = 'gap-2',
}: IconListItemProps) {
  const iconElement =
    variant === 'badge' ? (
      <IconBadge icon={Icon} color={badgeColor} size={badgeSize} />
    ) : (
      <Icon size={iconSize} className={iconColor} strokeWidth={2} />
    );

  const content = (
    <div
      className={`flex ${gapClassName} ${description ? 'items-start' : 'items-center'}`}
    >
      {iconElement}
      <div className="flex flex-col gap-0.5">
        <span className={textClassName}>{label}</span>
        {description && (
          <span className={descriptionClassName}>{description}</span>
        )}
      </div>
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
