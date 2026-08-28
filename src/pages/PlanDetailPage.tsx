import { useState } from 'react';

import { useNavigate, useParams } from 'react-router';

import {
  PlanDetailContent,
  usePlans,
  type PlanDetailItem,
} from '@/features/plan-detail';
import { PlanSubscriptionSheet } from '@/features/plan-subscription';
import { BottomSheet, Button } from '@/shared';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';

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

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: plans = [], isLoading, error } = usePlans();
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  const plan = plans.find((item) => item.id === id) ?? null;
  const backToList = () => navigate('/plan');

  return (
    <>
      <BottomSheet
        open
        onOpenChange={(open) => {
          if (!open) backToList();
        }}
        onBack={backToList}
        title={plan?.name ?? '요금제'}
        size="large"
        bodyClassName="px-0 bg-surface-page"
        footer={
          plan && (
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
        <PlanDetailContent
          plan={plan}
          isLoading={isLoading}
          error={
            error instanceof Error
              ? error.message
              : error
                ? '요금제 정보를 불러오지 못했습니다.'
                : null
          }
        />
      </BottomSheet>

      {plan && (
        <PlanSubscriptionSheet
          open={isSubscribeOpen}
          onOpenChange={setIsSubscribeOpen}
          plan={toRecommendedPlan(plan)}
        />
      )}
    </>
  );
}
