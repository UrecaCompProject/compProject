import { useState } from 'react';

import PlanSubscriptionSheet from '@/features/ai-consult/components/PlanSubscriptionSheet';
import { BottomSheet, Button } from '@/features/shared';
import type { RecommendedPlan } from '@/lib/aiConsult';

import PlanCatalogList from './PlanCatalogList';
import PlanDetailContent from './PlanDetailContent';

import type { PlanDetailItem } from '../types';

type PlanQuickSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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

export default function PlanQuickSheet({
  open,
  onOpenChange,
}: PlanQuickSheetProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanDetailItem | null>(null);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedPlan(null);
      setIsSubscribeOpen(false);
    }
    onOpenChange(nextOpen);
  };

  const backToList = () => setSelectedPlan(null);

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={handleOpenChange}
        onBack={selectedPlan ? backToList : undefined}
        title={selectedPlan ? '요금제 조회' : '요금제'}
        size="full"
        bodyClassName="px-0 bg-surface-page"
        footer={
          selectedPlan && (
            <div className="flex w-full gap-2">
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
          )
        }
      >
        {selectedPlan ? (
          <PlanDetailContent
            plan={selectedPlan}
            isLoading={false}
            error={null}
          />
        ) : (
          <div className="flex flex-col min-h-full gap-4 px-4 pt-8 pb-8">
            <h2 className="text-[24px] font-extrabold leading-[150%] text-fg-primary">
              <span className="text-brand-promo-primary">원하는 조건</span>
              으로
              <br />
              요금제를 찾아보세요
            </h2>
            <PlanCatalogList onSelectPlan={setSelectedPlan} />
          </div>
        )}
      </BottomSheet>

      {selectedPlan && (
        <PlanSubscriptionSheet
          open={isSubscribeOpen}
          onOpenChange={setIsSubscribeOpen}
          plan={toRecommendedPlan(selectedPlan)}
        />
      )}
    </>
  );
}
