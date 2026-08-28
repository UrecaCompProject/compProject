import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';

import { getPlanCatalog, useCurrentPlan } from '@/entities/plan';
import { useIsLoggedIn } from '@/entities/user';
import PlanCompare, {
  type PlanCompareData,
} from '@/features/plan-change/ui/PlanCompare';
import { PlanSubscriptionSheet } from '@/features/plan-subscription';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';

function toFeeText(monthlyFee: number | undefined): string {
  if (monthlyFee === undefined) return '-';
  return `${monthlyFee.toLocaleString()}원`;
}

function toPlanCompareData(
  currentPlan: RecommendedPlan | null,
  selectedPlan: RecommendedPlan,
): PlanCompareData {
  return {
    currentPlanName: currentPlan?.planName ?? '미등록',
    currentFee: toFeeText(currentPlan?.monthlyFee),
    currentDiscount: '-',
    currentData: currentPlan?.data ?? '-',
    currentTethering: currentPlan?.tethering ?? '-',
    currentShareData: currentPlan?.shareData ?? '-',
    currentVoice: currentPlan?.voice ?? '-',
    currentMessage: currentPlan?.message ?? '-',

    selectedPlanName: selectedPlan.planName,
    selectedFee: toFeeText(selectedPlan.monthlyFee),
    selectedDiscount: '-',
    selectedData: selectedPlan.data ?? '-',
    selectedTethering: selectedPlan.tethering ?? '-',
    selectedShareData: selectedPlan.shareData ?? '-',
    selectedVoice: selectedPlan.voice ?? '-',
    selectedMessage: selectedPlan.message ?? '-',
  };
}

export default function PlanChangePage() {
  const { id } = useParams<{ id: string }>();
  const isLoggedIn = useIsLoggedIn();

  const { data: plans = [] } = useQuery({
    queryKey: ['plans', 'catalog'],
    queryFn: getPlanCatalog,
  });
  const { data: currentPlan = null } = useCurrentPlan(isLoggedIn);

  const [subscriptionOpen, setSubscriptionOpen] = useState(false);

  // id와 plans가 모두 준비되면 해당 요금제를 찾아 selectedPlan으로 사용
  const selectedPlan = useMemo(() => {
    if (!id || plans.length === 0) return null;
    return plans.find((p) => p.planId === id) ?? null;
  }, [id, plans]);

  const compareData = useMemo(() => {
    if (!selectedPlan) return null;
    return toPlanCompareData(currentPlan, selectedPlan);
  }, [currentPlan, selectedPlan]);

  if (!selectedPlan) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <p className="text-body-sm text-fg-tertiary">
          요금제 정보를 불러오는 중...
        </p>
      </main>
    );
  }

  if (!compareData) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <p className="text-body-sm text-error">
          요금제 정보를 불러올 수 없어요.
        </p>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-6">
      <PlanCompare
        data={compareData}
        onChangePlan={() => setSubscriptionOpen(true)}
        className="w-full"
      />
      <PlanSubscriptionSheet
        open={subscriptionOpen}
        onOpenChange={setSubscriptionOpen}
        plan={selectedPlan}
      />
    </main>
  );
}
