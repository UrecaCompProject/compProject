import { useMemo, useState } from 'react';

import { usePlanCatalog } from '@/entities/plan';
import PlanCompare, {
  type PlanCompareData,
} from '@/features/plan-change/ui/PlanCompare';
import type { PlanCompareOption } from '@/features/plan-change/ui/PlanCompareHeaderSelect';
import { BottomSheet, Button } from '@/shared';
import type { CompareResult, RecommendedPlan } from '@/shared/lib/aiConsult';

interface CompareResultSheetProps {
  result: CompareResult;
  onSubscribe?: () => void;
  /** 헤더 토글로 요금제를 변경했을 때 새 비교 요청을 보내는 콜백.
   *  (planAName, planBName) 순서로 전달한다. */
  onRecompare?: (planAName: string, planBName: string) => void;
}

function toFeeText(monthlyFee: number | undefined): string {
  if (monthlyFee === undefined) return '-';
  return `${monthlyFee.toLocaleString()}원`;
}

function toPlanCompareData(
  planA: RecommendedPlan,
  planB: RecommendedPlan,
): PlanCompareData {
  return {
    currentPlanName: planA.planName,
    currentFee: toFeeText(planA.monthlyFee),
    currentDiscount: '-',
    currentData: planA.data ?? '-',
    currentTethering: planA.tethering ?? '-',
    currentShareData: planA.shareData ?? '-',
    currentVoice: planA.voice ?? '-',
    currentMessage: planA.message ?? '-',

    selectedPlanName: planB.planName,
    selectedFee: toFeeText(planB.monthlyFee),
    selectedDiscount: '-',
    selectedData: planB.data ?? '-',
    selectedTethering: planB.tethering ?? '-',
    selectedShareData: planB.shareData ?? '-',
    selectedVoice: planB.voice ?? '-',
    selectedMessage: planB.message ?? '-',
  };
}

// RecommendedPlan[]을 PlanCompareOption[]으로 변환
function toPlanOptions(plans: RecommendedPlan[]): PlanCompareOption[] {
  return plans.map((p) => ({ id: p.planId, name: p.planName }));
}

/** planId로 요금제를 찾아 RecommendedPlan을 반환 */
function findPlanById(
  plans: RecommendedPlan[],
  planId: string,
): RecommendedPlan | undefined {
  return plans.find((p) => p.planId === planId);
}

/** planName으로 요금제를 찾아 RecommendedPlan을 반환 */
function findPlanByName(
  plans: RecommendedPlan[],
  planName: string,
): RecommendedPlan | undefined {
  return plans.find((p) => p.planName === planName);
}

export default function CompareResultSheet({
  result,
  onSubscribe,
  onRecompare,
}: CompareResultSheetProps) {
  const [open, setOpen] = useState(false);
  const { data: catalogPlans = [] } = usePlanCatalog();

  // 토글에서 선택된 요금제 — 초기값은 비교 결과의 planA/planB
  // catalogPlans에 해당 요금제가 있으면 catalog 데이터로 교체 (더 풍부한 정보)
  const initialPlanA = useMemo(
    () => findPlanByName(catalogPlans, result.planA.planName) ?? result.planA,
    [catalogPlans, result.planA],
  );
  const initialPlanB = useMemo(
    () => findPlanByName(catalogPlans, result.planB.planName) ?? result.planB,
    [catalogPlans, result.planB],
  );
  const [selectedPlanA, setSelectedPlanA] =
    useState<RecommendedPlan>(initialPlanA);
  const [selectedPlanB, setSelectedPlanB] =
    useState<RecommendedPlan>(initialPlanB);

  const planOptions = useMemo(
    () => toPlanOptions(catalogPlans),
    [catalogPlans],
  );

  const data = toPlanCompareData(selectedPlanA, selectedPlanB);

  // 헤더 토글에서 현재 요금제(planA)를 변경했을 때
  const handleSelectCurrent = (planId: string) => {
    const plan = findPlanById(catalogPlans, planId);
    if (!plan) return;
    setSelectedPlanA(plan);
    onRecompare?.(plan.planName, selectedPlanB.planName);
  };

  // 헤더 토글에서 비교 대상(planB)을 변경했을 때
  const handleSelectSelected = (planId: string) => {
    const plan = findPlanById(catalogPlans, planId);
    if (!plan) return;
    setSelectedPlanB(plan);
    onRecompare?.(selectedPlanA.planName, plan.planName);
  };

  return (
    <>
      <div className="mt-2 rounded-2xl bg-surface-page p-3 text-center">
        <p className="text-body-sm font-medium text-fg-primary">
          {selectedPlanA.planName} <span className="text-fg-tertiary">vs</span>{' '}
          {selectedPlanB.planName}
        </p>
      </div>
      <Button
        variant="secondary"
        size="md"
        className="w-full mt-2"
        onClick={() => setOpen(true)}
      >
        비교 상세 보기
      </Button>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="요금제 비교"
        description={result.summary}
        size="large"
        bodyClassName="px-0"
      >
        <PlanCompare
          data={data}
          planOptions={planOptions}
          currentPlanId={selectedPlanA.planId}
          selectedPlanId={selectedPlanB.planId}
          onSelectCurrentPlan={handleSelectCurrent}
          onSelectSelectedPlan={handleSelectSelected}
          onChangePlan={onSubscribe}
          className="w-full"
        />
      </BottomSheet>
    </>
  );
}
