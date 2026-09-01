import { useLayoutEffect, useRef } from 'react';

import { BadgePercent } from 'lucide-react';

import { IconListItem } from '@/shared';

import { AGE_GROUP_OPTIONS } from '../types';

import PlanInfoSection from './PlanInfoSection';
import PlanTag from './PlanTag';

import type { PlanDetailItem } from '../types';

function ageChipLabel(targetAge: string): string {
  return (
    AGE_GROUP_OPTIONS.find((option) => option.key === targetAge)?.label ??
    targetAge
  );
}

interface PlanDetailContentProps {
  plan: PlanDetailItem | null;
  isLoading: boolean;
  error: string | null;
}

export default function PlanDetailContent({
  plan,
  isLoading,
  error,
}: PlanDetailContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  // 다른 요금제를 다시 열었을 때 이전 스크롤 위치가 남지 않도록,
  // 상세 내용이 바뀌는 시점마다 바텀시트 스크롤 컨테이너를 맨 위로 되돌린다.
  useLayoutEffect(() => {
    const scrollParent = rootRef.current?.closest('.overflow-y-auto');
    scrollParent?.scrollTo({ top: 0 });
  }, [plan?.id]);

  if (isLoading) {
    return (
      <p className="py-8 text-center text-caption text-fg-tertiary">
        요금제 정보를 불러오는 중...
      </p>
    );
  }

  if (error || !plan) {
    return (
      <p className="py-8 text-center text-caption text-error">
        {error ?? '해당 요금제를 찾을 수 없습니다.'}
      </p>
    );
  }

  return (
    <div ref={rootRef} className="flex flex-col gap-4 px-4 pt-4">
      {/* 상단 요금제 섹션: 태그 / 타이틀+가격+쿠폰 */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {[plan.category, plan.dataTier, ageChipLabel(plan.targetAge)]
            .filter(Boolean)
            .map((label) => (
              <PlanTag key={label} label={label} />
            ))}
        </div>

        <div className="flex flex-col gap-4">
          {/* 요금제 조회 리스트(PlanListCard)와 동일한 타이틀/가격 스타일 */}
          <div className="flex flex-col gap-1.5">
            <h3 className="text-[16px] font-semibold text-fg-primary">
              {plan.name}
            </h3>
            <p className="font-bold text-reward-active">
              <span className="text-[14px]">월 </span>
              <span className="text-[20px]">
                {plan.monthlyFee.toLocaleString()}
              </span>
              <span className="text-[14px]">원</span>
            </p>
          </div>

          {plan.couponText && (
            <IconListItem
              icon={BadgePercent}
              label={plan.couponText}
              variant="bordered"
              iconSize={16}
              iconColor="text-coupon-primary"
              textClassName="text-[12px] font-semibold text-coupon-primary"
              className="rounded-lg border-coupon-primary bg-coupon-soft"
            />
          )}
        </div>
      </div>

      <PlanInfoSection plan={plan} />
    </div>
  );
}
