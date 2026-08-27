import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router';

import PlanSubscriptionSheet from '@/features/ai-consult/components/PlanSubscriptionSheet';
import {
  getPlans,
  PlanDetailContent,
  type PlanDetailItem,
} from '@/features/plan-detail';
import { BottomSheet, Button } from '@/features/shared';
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

export default function PlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<PlanDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPlans()
      .then((result) => {
        if (!cancelled) {
          setPlans(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : '요금제 정보를 불러오지 못했습니다.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
        <PlanDetailContent plan={plan} isLoading={isLoading} error={error} />
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
