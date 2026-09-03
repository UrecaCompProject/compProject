import type { ComponentType } from 'react';

import { useCurrentPlan } from '@/entities/plan';
import { useIsLoggedIn } from '@/entities/user';
import { BottomSheet } from '@/shared';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';
import { toPlanDetailItem } from '@/shared/lib/planDetail';
import type { PlanDetailItem } from '@/shared/types/plan';

interface PlanDetailContentProps {
  plan: PlanDetailItem | null;
  isLoading: boolean;
  error: string | null;
  isCurrent?: boolean;
}

interface RecommendationDetailSheetProps {
  plan: RecommendedPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribe: (plan: RecommendedPlan) => void;
  // 비교 대상이 없는 화면(예: 레포트 상세)에서는 "비교하기" 버튼 자체를 숨긴다.
  onCompare?: (plan: RecommendedPlan) => void;
  PlanDetailContent: ComponentType<PlanDetailContentProps>;
  PlanDetailFooter: ComponentType<{
    onSubscribe?: () => void;
    onCompare?: () => void;
  }>;
}

// 추천 요금제 카드 클릭 시 표시되는 상세 정보 BottomSheet — PlanQuickSheet와
// 마찬가지로 이 시트 하나만 뜨고(중첩 없음), 본문/footer는 plan-detail의
// 공용 컴포넌트(PlanDetailContent/PlanDetailFooter)를 그대로 재사용한다.
export default function RecommendationDetailSheet({
  plan,
  open,
  onOpenChange,
  onSubscribe,
  onCompare,
  PlanDetailContent,
  PlanDetailFooter,
}: RecommendationDetailSheetProps) {
  const isLoggedIn = useIsLoggedIn();
  const { data: currentPlan } = useCurrentPlan(isLoggedIn);

  if (!plan) return null;

  const isCurrent = !!currentPlan && plan.planId === currentPlan.planId;

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="요금제 조회"
      bg="bg-surface-page"
      bodyClassName="px-4"
      footer={
        isCurrent ? undefined : (
          <PlanDetailFooter
            onSubscribe={() => onSubscribe(plan)}
            onCompare={onCompare ? () => onCompare(plan) : undefined}
          />
        )
      }
    >
      <PlanDetailContent
        plan={toPlanDetailItem(plan)}
        isLoading={false}
        error={null}
        isCurrent={isCurrent}
      />
    </BottomSheet>
  );
}
