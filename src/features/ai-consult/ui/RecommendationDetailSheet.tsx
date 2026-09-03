import type { ComponentType } from 'react';

import { BottomSheet, Button } from '@/shared';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';
import type { PlanDetailItem } from '@/shared/types/plan';

interface PlanDetailContentProps {
  plan: PlanDetailItem | null;
  isLoading: boolean;
  error: string | null;
}

interface RecommendationDetailSheetProps {
  plan: RecommendedPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribe: (plan: RecommendedPlan) => void;
  onCompare: (plan: RecommendedPlan) => void;
  PlanDetailContent: ComponentType<PlanDetailContentProps>;
}

// 추천 응답용 RecommendedPlan을 plan-detail의 PlanDetailItem으로 변환한다.
// AI 추천 데이터에는 dataTier/ottBenefits/addOns/couponText 등이 없으므로 기본값을 채운다.
function toPlanDetailItem(plan: RecommendedPlan): PlanDetailItem {
  return {
    id: plan.planId,
    name: plan.planName,
    category: plan.category ?? '',
    targetAge: plan.targetAge ?? '',
    dataTier: '',
    monthlyFee: plan.monthlyFee ?? 0,
    data: plan.data ?? '-',
    dataSpeedAfter: plan.dataSpeedAfter ?? '',
    voice: plan.voice ?? '',
    callAmountMin: plan.callAmountMin ?? null,
    message: plan.message ?? '',
    smsAmount: plan.smsAmount ?? null,
    shareData: plan.shareData ?? '-',
    tethering: plan.tethering ?? '-',
    notes: plan.notes ?? '',
    benefits: plan.benefits ?? [],
    ottBenefits: [],
    addOns: [],
    contractPeriodMonths: null,
    couponText: null,
  };
}

// 추천 요금제 카드 클릭 시 표시되는 상세 정보 BottomSheet
export default function RecommendationDetailSheet({
  plan,
  open,
  onOpenChange,
  onSubscribe,
  onCompare,
  PlanDetailContent,
}: RecommendationDetailSheetProps) {
  if (!plan) return null;

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="요금제 조회"
      footer={
        <div className="flex gap-2 w-full p-4">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            onClick={() => onCompare(plan)}
          >
            비교 하기
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={() => onSubscribe(plan)}
          >
            신청 하기
          </Button>
        </div>
      }
    >
      <PlanDetailContent
        plan={toPlanDetailItem(plan)}
        isLoading={false}
        error={null}
      />
    </BottomSheet>
  );
}
