import { Card } from '@/shared';
import type { CompareResult, RecommendedPlan } from '@/shared/lib/aiConsult';

interface ComparedPlanCardProps {
  comparedPlan: CompareResult;
}

function ComparedPlanRow({
  plan,
  advantage,
  isRecommended,
}: {
  plan: RecommendedPlan;
  advantage: string;
  isRecommended: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border-2 px-4 py-3 flex flex-col gap-1 ${
        isRecommended ? 'border-brand-promo-primary' : 'border-border'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="min-w-0 wrap-normal break-keep font-medium">
          {plan.planName}
        </span>
        {isRecommended && (
          <span className="shrink-0 text-[12px] font-semibold text-brand-promo-primary">
            추천
          </span>
        )}
      </div>
      {plan.monthlyFee !== undefined && (
        <div className="text-[14px] text-fg-tertiary">
          월 {plan.monthlyFee.toLocaleString('ko-KR')}원
        </div>
      )}
      {advantage && (
        <div className="wrap-normal break-keep text-[12px] text-fg-tertiary">
          {advantage}
        </div>
      )}
    </div>
  );
}

export default function ComparedPlanCard({
  comparedPlan,
}: ComparedPlanCardProps) {
  const {
    planA,
    planB,
    planAAdvantage,
    planBAdvantage,
    recommendedPlanId,
    reason,
  } = comparedPlan;

  return (
    <Card radius="none" gap="16" className="px-4 py-5">
      <div className="text-bold-16-140">요금제 비교</div>
      <div className="flex flex-col gap-3">
        <ComparedPlanRow
          plan={planA}
          advantage={planAAdvantage}
          isRecommended={planA.planId === recommendedPlanId}
        />
        <ComparedPlanRow
          plan={planB}
          advantage={planBAdvantage}
          isRecommended={planB.planId === recommendedPlanId}
        />
      </div>
      {reason && (
        <div className="wrap-normal break-keep text-[13px] text-fg-tertiary">
          {reason}
        </div>
      )}
    </Card>
  );
}
