import type { ComponentType } from 'react';
import { useMemo, useState } from 'react';

import { usePlanCatalog, useCurrentPlan, usePlans } from '@/entities/plan';
import { useIsLoggedIn } from '@/entities/user';
import { BottomSheet } from '@/shared';
import type { CompareResult, RecommendedPlan } from '@/shared/lib/aiConsult';
import type { PlanCompareData, PlanDetailItem } from '@/shared/types/plan';

interface CompareResultSheetSlots {
  PlanCompare: ComponentType<{
    data: PlanCompareData;
    variant?: 'compact' | 'full';
    className?: string;
    onShowFullCompare?: () => void;
    onChangePlan?: () => void;
    onDetailCurrent?: () => void;
    onDetailSelected?: () => void;
    planOptions?: { id: string; name: string }[];
    currentPlanId?: string;
    selectedPlanId?: string;
    onSelectCurrentPlan?: (id: string) => void;
    onSelectSelectedPlan?: (id: string) => void;
    myPlanId?: string;
    currentHighlighted?: boolean;
    selectedIsMine?: boolean;
  }>;
  PlanDetailContent: ComponentType<{
    plan: PlanDetailItem | null;
    isLoading: boolean;
    error: string | null;
  }>;
}

interface CompareResultSheetProps {
  result?: CompareResult;
  onSubscribe?: (plan: RecommendedPlan) => void;
  onRecompare?: (planAName: string, planBName: string) => void;
  slots: CompareResultSheetSlots;
}

function toFeeText(monthlyFee: number | undefined): string {
  if (monthlyFee === undefined) return '-';
  return `${monthlyFee.toLocaleString()}원`;
}

function toColumnData(
  plan: RecommendedPlan | undefined,
  prefix: 'current' | 'selected',
): Partial<PlanCompareData> {
  if (prefix === 'current') {
    return {
      currentPlanName: plan?.planName ?? '-',
      currentFee: toFeeText(plan?.monthlyFee),
      currentDiscount: '-',
      currentData: plan?.data ?? '-',
      currentTethering: plan?.tethering ?? '-',
      currentShareData: plan?.shareData ?? '-',
      currentVoice: plan?.voice ?? '-',
      currentMessage: plan?.message ?? '-',
      currentBenefits: plan?.benefits ?? [],
    } satisfies Partial<PlanCompareData>;
  }
  return {
    selectedPlanName: plan?.planName ?? '-',
    selectedFee: toFeeText(plan?.monthlyFee),
    selectedDiscount: '-',
    selectedData: plan?.data ?? '-',
    selectedTethering: plan?.tethering ?? '-',
    selectedShareData: plan?.shareData ?? '-',
    selectedVoice: plan?.voice ?? '-',
    selectedMessage: plan?.message ?? '-',
    selectedBenefits: plan?.benefits ?? [],
  } satisfies Partial<PlanCompareData>;
}

export default function CompareResultSheet({
  result,
  onSubscribe,
  slots: { PlanCompare, PlanDetailContent },
}: CompareResultSheetProps) {
  const [open, setOpen] = useState(false);
  const [detailView, setDetailView] = useState<null | 'current' | 'selected'>(
    null,
  );
  const isLoggedIn = useIsLoggedIn();
  const { data: catalog = [] } = usePlanCatalog();
  const { data: myPlan } = useCurrentPlan(isLoggedIn);
  const {
    data: detailPlans = [],
    isLoading: detailLoading,
    error: detailError,
  } = usePlans();

  const [pickedCurrentId, setPickedCurrentId] = useState<string | null>(null);
  const [pickedSelectedId, setPickedSelectedId] = useState<string | null>(null);

  const planById = useMemo(() => {
    const map = new Map<string, RecommendedPlan>();
    for (const plan of [result?.planA, result?.planB, myPlan ?? undefined]) {
      if (plan?.planId) map.set(plan.planId, plan);
    }
    for (const plan of catalog) map.set(plan.planId, plan);
    return map;
  }, [catalog, result?.planA, result?.planB, myPlan]);

  const currentId =
    pickedCurrentId ??
    myPlan?.planId ??
    result?.planA.planId ??
    catalog[0]?.planId ??
    '';
  const selectedId = pickedSelectedId ?? result?.planB.planId ?? '';

  const currentPlan = planById.get(currentId) ?? result?.planA;
  const selectedPlan = planById.get(selectedId) ?? result?.planB;

  const currentHighlighted = myPlan ? currentId !== myPlan.planId : true;
  const selectedIsMine = !!myPlan && selectedId === myPlan.planId;

  const planOptions = useMemo(
    () => catalog.map((plan) => ({ id: plan.planId, name: plan.planName })),
    [catalog],
  );

  const data = {
    ...toColumnData(currentPlan, 'current'),
    ...toColumnData(selectedPlan, 'selected'),
  } as PlanCompareData;

  const sharedProps = {
    data,
    planOptions: planOptions.length > 0 ? planOptions : undefined,
    currentPlanId: currentId,
    selectedPlanId: selectedId,
    onSelectCurrentPlan: setPickedCurrentId,
    onSelectSelectedPlan: setPickedSelectedId,
    myPlanId: myPlan?.planId,
    currentHighlighted,
    selectedIsMine,
  };

  const detailId = detailView === 'current' ? currentId : selectedId;
  const detailPlan = detailPlans.find((plan) => plan.id === detailId) ?? null;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setDetailView(null);
  };

  return (
    <div className="mt-2">
      <PlanCompare
        {...sharedProps}
        variant="compact"
        className="w-full"
        onShowFullCompare={
          currentPlan && selectedPlan ? () => setOpen(true) : undefined
        }
      />

      <BottomSheet
        open={open}
        onOpenChange={handleOpenChange}
        onBack={detailView ? () => setDetailView(null) : undefined}
        title={detailView ? '요금제 상세' : '요금제 비교'}
        description={detailView ? undefined : result?.summary}
        size="full"
        bodyClassName={detailView ? 'px-0 bg-surface-page' : 'px-5'}
        scrollResetKey={detailView ?? 'compare'}
      >
        {detailView ? (
          <PlanDetailContent
            plan={detailPlan}
            isLoading={detailLoading}
            error={detailError ? '요금제 정보를 불러오지 못했습니다.' : null}
          />
        ) : (
          <PlanCompare
            {...sharedProps}
            variant="full"
            className="w-full"
            onChangePlan={
              selectedPlan ? () => onSubscribe?.(selectedPlan) : undefined
            }
            onDetailCurrent={
              currentPlan ? () => setDetailView('current') : undefined
            }
            onDetailSelected={
              selectedPlan ? () => setDetailView('selected') : undefined
            }
          />
        )}
      </BottomSheet>
    </div>
  );
}
