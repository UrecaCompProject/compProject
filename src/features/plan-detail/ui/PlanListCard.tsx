import { useState } from 'react';

import { ChevronDown, ChevronUp, Gift, Phone } from 'lucide-react';

import { Card, IconListItem, Line } from '@/shared';

import type { PlanDetailItem } from '../types';

interface PlanListCardProps {
  plan: PlanDetailItem;
  onClick: () => void;
}

export default function PlanListCard({ plan, onClick }: PlanListCardProps) {
  const [expanded, setExpanded] = useState(false);

  const callMessageLabel = [plan.voice, plan.message]
    .filter(Boolean)
    .join(' · ');
  const benefitLabel = [...plan.benefits, ...plan.ottBenefits, ...plan.addOns]
    .slice(0, 3)
    .join(', ');

  return (
    <Card
      border="default"
      radius="16"
      gap="none"
      className="cursor-pointer w-fill"
      onClick={onClick}
    >
      <div className="flex flex-col">
        <span className="text-[10px] font-normal text-fg-disabled">
          {plan.category}
        </span>
        <h3 className="mt-1.5 text-[16px] font-semibold text-fg-primary">
          {plan.name}
        </h3>
        {plan.notes && (
          <p className="mt-1 text-[12px] font-normal text-fg-tertiary">
            + {plan.notes}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <p className="font-bold text-reward-active">
          <span className="text-[14px]">월 </span>
          <span className="text-[20px]">
            {plan.monthlyFee.toLocaleString()}
          </span>
          <span className="text-[14px]">원</span>
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((prev) => !prev);
          }}
          className="flex items-center gap-0.5 text-[12px] font-normal text-fg-tertiary"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          상세 정보
        </button>
      </div>

      {expanded && (
        <>
          <div className="my-3">
            <Line />
          </div>
          <div className="flex flex-col gap-2">
            {benefitLabel && (
              <IconListItem
                icon={Gift}
                label={benefitLabel}
                iconSize={14}
                iconColor="text-compare-selected"
                textClassName="text-[12px] font-normal text-fg-tertiary"
              />
            )}
            {callMessageLabel && (
              <IconListItem
                icon={Phone}
                label={callMessageLabel}
                iconSize={14}
                iconColor="text-compare-selected"
                textClassName="text-[12px] font-normal text-fg-tertiary"
              />
            )}
          </div>
        </>
      )}
    </Card>
  );
}
