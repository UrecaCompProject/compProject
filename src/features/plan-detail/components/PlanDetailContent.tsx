import { AGE_GROUP_OPTIONS } from '../types';

import PlanInfoSection from './PlanInfoSection';

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
    <div className="flex flex-col gap-4 pt-4 pb-2">
      <div className="flex flex-wrap gap-2">
        {[plan.category, plan.dataTier, ageChipLabel(plan.targetAge)]
          .filter(Boolean)
          .map((label) => (
            <span
              key={label}
              className="px-3 py-2 border rounded-full border-border text-chip text-fg-tertiary"
            >
              {label}
            </span>
          ))}
      </div>

      <p className="text-[22px] font-bold text-brand-promo-secondary">
        월 {plan.monthlyFee.toLocaleString()}원
      </p>

      <PlanInfoSection plan={plan} />
    </div>
  );
}
