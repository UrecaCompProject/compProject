import { useState } from 'react';

import { ChevronLeft } from 'lucide-react';

import PlanSubscriptionSheet from '@/features/ai-consult/components/PlanSubscriptionSheet';
import {
  PlanCatalogList,
  PlanDetailContent,
  type PlanDetailItem,
} from '@/features/plan-detail';
import { Button } from '@/features/shared';
import type { RecommendedPlan } from '@/lib/aiConsult';

function toRecommendedPlan(plan: PlanDetailItem): RecommendedPlan {
  return {
    planId: plan.id,
    planName: plan.name,
    reason: '',
    savingAmount: 0,
    monthlyFee: plan.monthlyFee,
    data: plan.data,
    benefits: plan.benefits,
    category: plan.category,
    targetAge: plan.targetAge,
    dataSpeedAfter: plan.dataSpeedAfter,
    voice: plan.voice,
    message: plan.message,
    shareData: plan.shareData,
    tethering: plan.tethering,
    notes: plan.notes,
  };
}

// 챗인풋 쪽 BottomSheet(진짜 헤더)는 전혀 건드리지 않는다.
// 목록: 뒤로가기 없음 (챗인풋이 준 "요금제" 타이틀 그대로 노출)
// 상세: 이 컴포넌트가 콘텐츠 맨 위에 "< 요금제 조회" 줄을 직접 그려서
//       진짜 헤더처럼 보이게 하고, 뒤로가기는 selectedPlan을 null로 되돌릴 뿐이다.
export default function PlanPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanDetailItem | null>(null);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  if (selectedPlan) {
    return (
      <div className="flex flex-col bg-surface-page">
        <div className="sticky top-0 z-10 px-5 pt-4 pb-3 bg-surface-card">
          <button
            type="button"
            onClick={() => setSelectedPlan(null)}
            className="inline-flex items-center h-8 gap-2"
          >
            <ChevronLeft size={24} />
            <span className="text-title text-fg-primary">요금제 조회</span>
          </button>
        </div>

        <div className="flex flex-col gap-4 px-4 py-4">
          <PlanDetailContent
            plan={selectedPlan}
            isLoading={false}
            error={null}
          />

          <div className="flex gap-2 pt-4 border-t border-border">
            <Button variant="outline" size="lg" className="flex-1">
              비교 하기
            </Button>
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={() => setIsSubscribeOpen(true)}
            >
              신청 하기
            </Button>
          </div>
        </div>

        <PlanSubscriptionSheet
          open={isSubscribeOpen}
          onOpenChange={setIsSubscribeOpen}
          plan={toRecommendedPlan(selectedPlan)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-8 bg-surface-page pb-28">
      <h2 className="text-[24px] font-extrabold leading-[150%] text-fg-primary">
        <span className="text-brand-promo-primary">원하는 조건</span>
        으로
        <br />
        요금제를 찾아보세요
      </h2>

      <PlanCatalogList onSelectPlan={setSelectedPlan} />
    </div>
  );
}
