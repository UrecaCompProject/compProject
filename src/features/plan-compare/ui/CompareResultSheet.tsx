import { useMemo, useState } from 'react';

import { usePlanCatalog, useCurrentPlan } from '@/entities/plan';
import { useIsLoggedIn } from '@/entities/user';
import PlanCompare, {
  type PlanCompareData,
} from '@/features/plan-change/ui/PlanCompare';
import { PlanDetailContent, usePlans } from '@/features/plan-detail';
import { BottomSheet } from '@/shared';
import type { CompareResult, RecommendedPlan } from '@/shared/lib/aiConsult';

interface CompareResultSheetProps {
  /** AI 비교 결과. '요금제 비교하기'로 바로 진입한 경우엔 없다(카탈로그로만 비교). */
  result?: CompareResult;
  onSubscribe?: (plan: RecommendedPlan) => void;
  /** dev에서 추가된 콜백. 이 버전은 헤더 드롭다운 선택 시 카탈로그에서
   *  로컬로 요금제를 교체하므로 새 비교 요청을 보내지 않는다(미사용). */
  onRecompare?: (planAName: string, planBName: string) => void;
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
}: CompareResultSheetProps) {
  const [open, setOpen] = useState(false);
  // 바텀시트 내부에서 '요금제 상세보기'로 전환된 컬럼 (null이면 비교 화면)
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

  // 드롭다운 선택값 — null이면 기본값(내 요금제 / AI가 비교한 요금제 / 카탈로그 첫 요금제)을 따른다.
  const [pickedCurrentId, setPickedCurrentId] = useState<string | null>(null);
  const [pickedSelectedId, setPickedSelectedId] = useState<string | null>(null);

  // id로 요금제를 찾을 때 카탈로그를 우선하고, 없으면 AI 결과/내 요금제로 보완한다.
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

  // 왼쪽 컬럼이 실제 내 요금제가 아니면 색으로 강조한다.
  const currentHighlighted = myPlan ? currentId !== myPlan.planId : true;
  // 오른쪽 컬럼이 이미 내가 이용 중인 요금제면 '요금제 변경하기'를 막는다.
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
        onShowFullCompare={() => setOpen(true)}
      />

      <BottomSheet
        open={open}
        onOpenChange={handleOpenChange}
        onBack={detailView ? () => setDetailView(null) : undefined}
        title={detailView ? '요금제 상세' : '요금제 비교'}
        description={detailView ? undefined : result?.summary}
        size="large"
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
            onDetailCurrent={() => setDetailView('current')}
            onDetailSelected={() => setDetailView('selected')}
          />
        )}
      </BottomSheet>
    </div>
  );
}
