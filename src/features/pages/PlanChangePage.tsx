import { useEffect, useMemo, useState } from 'react';

import { useParams } from 'react-router';

import PlanSubscriptionSheet from '@/features/ai-consult/components/PlanSubscriptionSheet';
import { useSubscriptionStore } from '@/features/ai-consult/store/useSubscriptionStore';
import { getPlanCatalog } from '@/features/plan-catalog/api/getPlanCatalog';
import PlanCompare, {
  type PlanCompareData,
} from '@/features/plan-change/components/PlanCompare';
import type { RecommendedPlan } from '@/lib/aiConsult';

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
  const currentPlan = useSubscriptionStore((s) => s.currentPlan);
  const loadCurrentPlan = useSubscriptionStore((s) => s.loadCurrentPlan);
  const [selectedPlan, setSelectedPlan] = useState<RecommendedPlan | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [plans] = await Promise.all([
          getPlanCatalog(),
          loadCurrentPlan(),
        ]);
        if (cancelled || !id) return;
        const found = plans.find((p) => p.planId === id);
        if (!found) {
          setError('요금제를 찾을 수 없습니다.');
          return;
        }
        setSelectedPlan(found);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : '요금제 조회에 실패했어요.',
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id, loadCurrentPlan]);

  const compareData = useMemo(() => {
    if (!selectedPlan) return null;
    return toPlanCompareData(currentPlan, selectedPlan);
  }, [currentPlan, selectedPlan]);

  if (isLoading) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <p className="text-body-sm text-fg-tertiary">
          요금제 정보를 불러오는 중...
        </p>
      </main>
    );
  }

  if (error || !compareData) {
    return (
      <main className="flex flex-1 items-center justify-center px-4">
        <p className="text-body-sm text-error">
          {error || '요금제 정보를 불러올 수 없어요.'}
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
