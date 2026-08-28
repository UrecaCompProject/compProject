import { Anchor, BadgePercent } from 'lucide-react';

import { Button, Card, IconListItem, Line } from '@/shared';

import type { LucideIcon } from 'lucide-react';

export interface PlanCardBenefit {
  icon: LucideIcon;
  label: string;
}

type PlanCardContext = 'chat' | 'report';

const contextWidth: Record<PlanCardContext, string> = {
  chat: 'w-fit min-w-[240px]',
  report: 'w-[350px]',
};

export interface PlanCardProps {
  title: string;
  price: number;
  benefits: PlanCardBenefit[];
  context?: PlanCardContext;
  reason?: string;
  couponText?: string;
  saved?: boolean;
  onSaveToggle?: () => void;
  onDetail?: () => void;
  onSelect?: () => void;
  className?: string;
}

export default function PlanCard({
  title,
  price,
  benefits,
  context = 'report',
  reason,
  couponText,
  saved = false,
  onSaveToggle,
  onDetail,
  onSelect,
  className = '',
}: PlanCardProps) {
  return (
    <Card
      border="primary"
      shadow
      gap="12"
      // style={{ borderWidth: '1.5px' }}
      className={`flex flex-col border-[1.5px] ${contextWidth[context]} ${className}`}
    >
      <div>
        <div className="flex items-start justify-between">
          <h3 className="text-[16px] font-semibold text-fg-primary">{title}</h3>
          {onSaveToggle && (
            <button
              type="button"
              onClick={onSaveToggle}
              aria-label={saved ? '저장 취소' : '요금제 저장'}
              className="shrink-0"
            >
              <Anchor
                size={22}
                className={
                  saved ? 'text-brand-promo-primary' : 'text-fg-disabled'
                }
              />
            </button>
          )}
        </div>
        <p className="text-[16px] font-bold text-brand-promo-secondary mt-1">
          월 {price.toLocaleString()}원
        </p>
      </div>

      <Line />

      <div className="flex flex-col gap-2 flex-1">
        {benefits.map((benefit, index) => (
          <IconListItem
            key={`${benefit.label}-${index}`}
            icon={benefit.icon}
            label={benefit.label}
            iconSize={14}
            iconColor="text-compare-selected"
            textClassName="text-[12px] font-normal text-fg-tertiary"
          />
        ))}
      </div>

      {(reason || couponText) && <Line />}

      {reason && (
        <p className="rounded-lg bg-surface-page px-4 py-3 text-[12px] font-normal text-fg-secondary">
          {reason}
        </p>
      )}

      {couponText && (
        <IconListItem
          icon={BadgePercent}
          label={couponText}
          variant="bordered"
          iconSize={16}
          iconColor="text-coupon-primary"
          textClassName="text-[12px] font-semibold text-coupon-primary"
          className="rounded-lg border-coupon-primary bg-coupon-soft"
        />
      )}

      <div className="flex gap-2 mt-auto">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={onDetail}
        >
          자세히 보기
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          onClick={onSelect}
        >
          가입 하기
        </Button>
      </div>
    </Card>
  );
}
