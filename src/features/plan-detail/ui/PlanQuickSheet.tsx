import { useMemo, useState } from 'react';

import { PlanSubscriptionSheet } from '@/features/plan-subscription';
import { BottomSheet, Button } from '@/shared';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';

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
  const subscribing = isSubscribeOpen && !!selectedPlan;

  // 신청 시트 초기화 이펙트가 매 렌더 재실행되지 않도록 참조를 안정화한다.
  const recommendedPlan = useMemo(
    () => (selectedPlan ? toRecommendedPlan(selectedPlan) : null),
    [selectedPlan],
  );

  // 신청 플로우는 자체 BottomSheet를 만들지 않고 이 시트에 내용만 갈아끼운다.
  // 첫 단계에서 뒤로가기 → 요금제 상세로 복귀.
  return (
    <PlanSubscriptionSheet
      plan={recommendedPlan}
      active={subscribing}
      onExit={() => setIsSubscribeOpen(false)}
      onComplete={() => setIsSubscribeOpen(false)}
      renderShell={(shell) => (
        <BottomSheet
          open={open}
          onOpenChange={handleOpenChange}
          onBack={
            subscribing ? shell.onBack : selectedPlan ? backToList : undefined
          }
          title={
            subscribing ? shell.title : selectedPlan ? '요금제 조회' : '요금제'
          }
          description={subscribing ? shell.description : undefined}
          size={
            subscribing
              ? shell.size === 'content'
                ? 'content'
                : 'full'
              : 'full'
          }
          bodyClassName={subscribing ? 'px-5' : 'px-0 bg-surface-page'}
          footer={
            subscribing ? (
              shell.footer
            ) : selectedPlan ? (
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
            ) : null
          }
        >
          {subscribing ? (
            shell.children
          ) : selectedPlan ? (
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
      )}
    />
  );
}
