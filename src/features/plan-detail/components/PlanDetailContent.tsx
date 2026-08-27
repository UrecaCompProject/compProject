import { BadgePercent } from 'lucide-react';

import { IconListItem } from '@/features/shared';

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

// 요금제 상세 콘텐츠 자체. BottomSheet를 직접 소유하지 않기 때문에
// /plan/:id 라우트(PlanDetailPage)와 채팅 인풋의 요금제 퀵시트(PlanQuickSheet)가
// 각자 자기 BottomSheet(+footer, 구독 시트) 안에 이 컴포넌트만 끼워 넣어 재사용한다.
export default function PlanDetailContent({
  plan,
  isLoading,
  error,
}: PlanDetailContentProps) {
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
    <div className="flex flex-col gap-6 px-4 pt-4">
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
