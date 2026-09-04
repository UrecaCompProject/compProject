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
    isCurrent?: boolean;
  }>;
  PlanDetailFooter: ComponentType<{ onSubscribe?: () => void }>;
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
  slots: { PlanCompare, PlanDetailContent, PlanDetailFooter },
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
  const detailSubscribeTarget =
    detailView === 'current' ? currentPlan : selectedPlan;
  // "current"/"selected"는 비교 화면의 좌/우 컬럼 구분일 뿐, 실제로 내가
  // 가입 중인 요금제인지는 myPlan과 별도로 비교해야 한다.
  const isDetailCurrentPlan = !!myPlan && detailPlan?.id === myPlan.planId;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setDetailView(null);
  };

  // 신청/변경 흐름으로 넘어갈 때는 이 시트를 열어둔 채로 새 신청 시트를
  // 위에 띄우지 않고, 이 시트부터 닫아서 신청이 끝났을 때 남는 시트가 없게 한다.
  const handleSubscribeClick = (targetPlan: RecommendedPlan) => {
    handleOpenChange(false);
    onSubscribe?.(targetPlan);
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
        bodyClassName={detailView ? 'px-4 bg-surface-page' : 'px-5'}
        scrollResetKey={detailView ?? 'compare'}
        footer={
          detailView && detailSubscribeTarget && !isDetailCurrentPlan ? (
            <PlanDetailFooter
              onSubscribe={() => handleSubscribeClick(detailSubscribeTarget)}
            />
          ) : undefined
        }
      >
        {detailView ? (
          <div className="pt-4">
            <PlanDetailContent
              plan={detailPlan}
              isLoading={detailLoading}
              error={detailError ? '요금제 정보를 불러오지 못했습니다.' : null}
              isCurrent={isDetailCurrentPlan}
            />
          </div>
        ) : (
          <PlanCompare
            {...sharedProps}
            variant="full"
            className="w-full"
            onChangePlan={
              selectedPlan
                ? () => handleSubscribeClick(selectedPlan)
                : undefined
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
