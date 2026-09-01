import { useMemo, useState } from 'react';

import { usePlanCatalog, useCurrentPlan } from '@/entities/plan';
import { useIsLoggedIn } from '@/entities/user';
import PlanCompare, {
  type PlanCompareData,
} from '@/features/plan-change/ui/PlanCompare';
import { BottomSheet } from '@/shared';
import type { CompareResult, RecommendedPlan } from '@/shared/lib/aiConsult';

interface CompareResultSheetProps {
  result: CompareResult;
  onSubscribe?: (plan: RecommendedPlan) => void;
}

function toFeeText(monthlyFee: number | undefined): string {
  if (monthlyFee === undefined) return '-';
  return `${monthlyFee.toLocaleString()}원`;
}

function toColumnData(
  plan: RecommendedPlan | undefined,
  prefix: 'current' | 'selected',
): Partial<PlanCompareData> {
  const cap =
    prefix === 'current'
      ? ({
          currentPlanName: plan?.planName ?? '-',
          currentFee: toFeeText(plan?.monthlyFee),
          currentDiscount: '-',
          currentData: plan?.data ?? '-',
          currentTethering: plan?.tethering ?? '-',
          currentShareData: plan?.shareData ?? '-',
          currentVoice: plan?.voice ?? '-',
          currentMessage: plan?.message ?? '-',
          currentBenefits: plan?.benefits ?? [],
        } satisfies Partial<PlanCompareData>)
      : ({
          selectedPlanName: plan?.planName ?? '-',
          selectedFee: toFeeText(plan?.monthlyFee),
          selectedDiscount: '-',
          selectedData: plan?.data ?? '-',
          selectedTethering: plan?.tethering ?? '-',
          selectedShareData: plan?.shareData ?? '-',
          selectedVoice: plan?.voice ?? '-',
          selectedMessage: plan?.message ?? '-',
          selectedBenefits: plan?.benefits ?? [],
        } satisfies Partial<PlanCompareData>);
  return cap;
}

export default function CompareResultSheet({
  result,
  onSubscribe,
}: CompareResultSheetProps) {
  const [open, setOpen] = useState(false);
  const isLoggedIn = useIsLoggedIn();
  const { data: catalog = [] } = usePlanCatalog();
  const { data: myPlan } = useCurrentPlan(isLoggedIn);

  // 드롭다운 선택값 — null이면 기본값(내 요금제 / AI가 비교한 요금제)을 따른다.
  const [pickedCurrentId, setPickedCurrentId] = useState<string | null>(null);
  const [pickedSelectedId, setPickedSelectedId] = useState<string | null>(null);

  // id로 요금제를 찾을 때 카탈로그를 우선하고, 없으면 AI 결과/내 요금제로 보완한다.
  const planById = useMemo(() => {
    const map = new Map<string, RecommendedPlan>();
    for (const plan of [result.planA, result.planB, myPlan ?? undefined]) {
      if (plan?.planId) map.set(plan.planId, plan);
    }
    for (const plan of catalog) map.set(plan.planId, plan);
    return map;
  }, [catalog, result.planA, result.planB, myPlan]);

  const currentId = pickedCurrentId ?? myPlan?.planId ?? result.planA.planId;
  const selectedId = pickedSelectedId ?? result.planB.planId;

  const currentPlan = planById.get(currentId) ?? result.planA;
  const selectedPlan = planById.get(selectedId) ?? result.planB;

  // 왼쪽 컬럼이 실제 내 요금제가 아니면 파란색으로 강조한다.
  const currentHighlighted = myPlan ? currentId !== myPlan.planId : true;

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
    currentHighlighted,
  };

  return (
    <div className="mt-2">
      <PlanCompare
        {...sharedProps}
        variant="compact"
        className="w-full"
        onShowFullCompare={() => setOpen(true)}
      />

      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="요금제 비교"
        description={result.summary}
        size="large"
        bodyClassName="px-5"
      >
        <PlanCompare
          {...sharedProps}
          variant="full"
          className="w-full"
          onChangePlan={() => onSubscribe?.(selectedPlan)}
        />
      </BottomSheet>
    </div>
  );
}
