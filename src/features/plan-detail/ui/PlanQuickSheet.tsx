import { useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useCurrentPlan } from '@/entities/plan';
import { useIsLoggedIn } from '@/entities/user';
import PlanCompare, {
  type PlanCompareData,
} from '@/features/plan-change/ui/PlanCompare';
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
  const [compareOpen, setCompareOpen] = useState(false);

  const isLoggedIn = useIsLoggedIn();
  const { data: currentPlan = null } = useCurrentPlan(isLoggedIn);

  // 비교 데이터 — 현재 가입된 요금제 vs 선택한 요금제
  const compareData: PlanCompareData | null = useMemo(() => {
    if (!selectedPlan || !currentPlan) return null;
    return {
      currentPlanName: currentPlan.planName,
      currentFee: `${currentPlan.monthlyFee?.toLocaleString() ?? '-'}원`,
      currentDiscount: '-',
      currentData: currentPlan.data ?? '-',
      currentTethering: currentPlan.tethering ?? '-',
      currentShareData: currentPlan.shareData ?? '-',
      currentVoice: currentPlan.voice ?? '-',
      currentMessage: currentPlan.message ?? '-',
      currentBenefits: currentPlan.benefits ?? [],
      selectedPlanName: selectedPlan.name,
      selectedFee: `${selectedPlan.monthlyFee.toLocaleString()}원`,
      selectedDiscount: '-',
      selectedData: selectedPlan.data ?? '-',
      selectedTethering: selectedPlan.tethering ?? '-',
      selectedShareData: selectedPlan.shareData ?? '-',
      selectedVoice: selectedPlan.voice ?? '-',
      selectedMessage: selectedPlan.message ?? '-',
      selectedBenefits: selectedPlan.benefits ?? [],
    };
  }, [selectedPlan, currentPlan]);

  // 바텀시트 본문 스크롤 컨테이너 — 뷰 전환 시 스크롤 위치를 제어한다.
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const listScrollTopRef = useRef(0);
  const getScroller = () =>
    scrollAnchorRef.current?.closest('.overflow-y-auto') ?? null;

  const handleSelectPlan = (plan: PlanDetailItem) => {
    const scroller = getScroller();
    if (scroller) listScrollTopRef.current = scroller.scrollTop;
    setSelectedPlan(plan);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedPlan(null);
      setIsSubscribeOpen(false);
      setCompareOpen(false);
      listScrollTopRef.current = 0;
    }
    onOpenChange(nextOpen);
  };

  const backToList = () => setSelectedPlan(null);
  const subscribing = isSubscribeOpen && !!selectedPlan;
  // 비교 화면 — 별도 바텀시트를 띄우지 않고 이 시트의 내용만 갈아끼운다.
  const comparing = compareOpen && !!selectedPlan && !subscribing;

  // 뷰 전환 시 스크롤 위치 조정(paint 전):
  // 상세/비교 화면은 항상 최상단, 목록 화면은 이전에 보던 위치로 복원.
  // 신청 플로우 스크롤은 PlanSubscriptionSheet가 직접 관리하므로 건드리지 않는다.
  useLayoutEffect(() => {
    if (!open || subscribing) return;
    const scroller = getScroller();
    if (!scroller) return;
    scroller.scrollTop = selectedPlan ? 0 : listScrollTopRef.current;
  }, [selectedPlan, subscribing, comparing, open]);

  // 신청 시트 초기화 이펙트가 매 렌더 재실행되지 않도록 참조를 안정화한다.
  const recommendedPlan = useMemo(
    () => (selectedPlan ? toRecommendedPlan(selectedPlan) : null),
    [selectedPlan],
  );

  // 신청/비교 플로우 모두 자체 BottomSheet를 만들지 않고 이 시트에 내용만 갈아끼운다.
  // 뒤로가기: 신청/비교 → 요금제 상세, 상세 → 목록.
  return (
    <PlanSubscriptionSheet
      plan={recommendedPlan}
      active={subscribing}
      onExit={() => setIsSubscribeOpen(false)}
      onComplete={() => setIsSubscribeOpen(false)}
      renderShell={(shell, bodyRef) => (
        <BottomSheet
          open={open}
          onOpenChange={handleOpenChange}
          bodyRef={bodyRef}
          onBack={
            subscribing
              ? shell.onBack
              : comparing
                ? () => setCompareOpen(false)
                : selectedPlan
                  ? backToList
                  : undefined
          }
          title={
            subscribing
              ? shell.title
              : comparing
                ? '요금제 비교'
                : selectedPlan
                  ? '요금제 조회'
                  : '요금제'
          }
          description={subscribing ? shell.description : undefined}
          size={
            subscribing
              ? shell.size === 'content'
                ? 'content'
                : 'full'
              : 'full'
          }
          bodyClassName={
            subscribing ? 'px-5' : comparing ? 'px-5' : 'px-0 bg-surface-page'
          }
          footer={
            subscribing ? (
              shell.footer
            ) : comparing ? null : selectedPlan ? (
              <div className="flex w-full gap-2 p-4">
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => setCompareOpen(true)}
                  disabled={!currentPlan}
                >
                  비교 하기
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="flex-1"
                  onClick={() => setIsSubscribeOpen(true)}
                >
                  신청 하기
                </Button>
              </div>
            ) : null
          }
        >
          <div ref={scrollAnchorRef} className="contents" />
          {subscribing ? (
            shell.children
          ) : comparing && compareData ? (
            <PlanCompare
              data={compareData}
              variant="full"
              className="w-full"
              onChangePlan={() => {
                setCompareOpen(false);
                setIsSubscribeOpen(true);
              }}
            />
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
              <PlanCatalogList onSelectPlan={handleSelectPlan} />
            </div>
          )}
        </BottomSheet>
      )}
    />
  );
}
