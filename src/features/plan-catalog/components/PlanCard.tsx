// features/plan-catalog/components/PlanCard.tsx
import { Anchor, BadgePercent } from 'lucide-react';

import { Button, Card, IconListItem, Line } from '@/features/shared';

import type { LucideIcon } from 'lucide-react';

// 임시 타입 — 나중에 shared/types/plan.ts 기준으로 수정할 예정
export interface PlanCardBenefit {
  icon: LucideIcon;
  label: string;
}

type PlanCardStatus = 'default' | 'report';

export interface PlanCardProps {
  title: string;
  price: number;
  benefits: PlanCardBenefit[];
  status?: PlanCardStatus;
  reason?: string;
  couponText?: string;
  saved?: boolean;
  onSaveToggle?: () => void;
  onDetail?: () => void;
  onSelect?: () => void;
}

export default function PlanCard({
  title,
  price,
  benefits,
  status = 'default',
  reason,
  couponText,
  saved = false,
  onSaveToggle,
  onDetail,
  onSelect,
}: PlanCardProps) {
  return (
    <Card
      border="default"
      shadow
      gap="16"
      className={status === 'report' ? 'w-full' : ''}
    >
      <div className="flex items-start justify-between">
        <h3 className="text-[16px] font-semibold text-fg-primary">{title}</h3>
        <button
          type="button"
          onClick={onSaveToggle}
          aria-label={saved ? '저장 취소' : '요금제 저장'}
          className="shrink-0"
        >
          <Anchor
            size={22}
            className={saved ? 'text-brand-promo-primary' : 'text-fg-disabled'}
          />
        </button>
      </div>

      <p className="text-[16px] font-bold text-brand-promo-secondary">
        월 {price.toLocaleString()}원
      </p>

      <Line />

      <div className="flex flex-col gap-3">
        {benefits.map((benefit) => (
          <IconListItem
            key={benefit.label}
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
          iconColor="text-[#f5b31f]"
          textClassName="text-[12px] font-semibold text-[#f5b31f]"
          className="rounded-lg border-[#f5b31f] bg-[#fff8e9]"
        />
      )}

      <div className="flex gap-2 pt-1">
        <Button
          variant="secondary"
          size="md"
          className="flex-1"
          onClick={onDetail}
        >
          자세히 보기
        </Button>
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          onClick={onSelect}
        >
          선택하기
        </Button>
      </div>
    </Card>
  );
}
