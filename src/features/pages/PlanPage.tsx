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

// BottomSheet를 또 열지 않는다. 이 페이지가 어디에 놓이든(/plan 라우트,
// 혹은 채팅 인풋이 이미 열어둔 BottomSheet 안) 바깥 껍데기는 그대로 두고
// 이 컴포넌트의 콘텐츠(목록 <-> 상세)만 그 자리에서 갈아끼운다.
export default function PlanPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanDetailItem | null>(null);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  if (selectedPlan) {
    return (
      <div className="flex flex-col bg-surface-page">
        <div className="sticky top-0 z-10 flex items-center gap-2 px-4 h-14 bg-surface-page">
          <button
            type="button"
            aria-label="이전 화면으로 돌아가기"
            onClick={() => setSelectedPlan(null)}
            className="inline-flex items-center justify-center w-8 h-8"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-title text-fg-primary">{selectedPlan.name}</h2>
        </div>

        <div className="px-4">
          <PlanDetailContent
            plan={selectedPlan}
            isLoading={false}
            error={null}
          />
        </div>

        <div
          className="
            sticky bottom-0 flex gap-2 border-t border-border
            bg-surface-card px-4 pt-4
            pb-[calc(20px+env(safe-area-inset-bottom))]
          "
        >
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
