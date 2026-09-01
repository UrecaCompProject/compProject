import { useState } from 'react';

import useEmblaCarousel from 'embla-carousel-react';

import { PlanCard, toPlanBenefits } from '@/entities/plan';
import { useIsLoggedIn } from '@/features/auth';
import { Button } from '@/shared';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import RecommendationDetailSheet from './RecommendationDetailSheet';

interface RecommendationCardsProps {
  plans: RecommendedPlan[];
  onPlanSubscribe?: (plan: RecommendedPlan) => void;
  onPlanCompare?: (plan: RecommendedPlan) => void;
  onGenerateReport?: (plans: RecommendedPlan[]) => void;
  isLoading?: boolean;
  isGeneratingReport?: boolean;
  canShowReportButton?: boolean;
}

export default function RecommendationCards({
  plans,
  onPlanSubscribe,
  onPlanCompare,
  onGenerateReport,
  isLoading = false,
  isGeneratingReport = false,
  canShowReportButton = false,
}: RecommendationCardsProps) {
  const isLoggedIn = useIsLoggedIn();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<RecommendedPlan | null>(null);
  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    loop: false,
  });

  const handleOpen = (plan: RecommendedPlan) => {
    setSelected(plan);
    setOpen(true);
  };

  const handleSubscribe = (plan: RecommendedPlan) => {
    setOpen(false);
    onPlanSubscribe?.(plan);
  };

  const handleCompare = (plan: RecommendedPlan) => {
    setOpen(false);
    onPlanCompare?.(plan);
  };

  const handleGenerateReport = () => {
    if (!onGenerateReport || isLoading) return;
    onGenerateReport(plans);
  };

  if (plans.length === 0) return null;

  return (
    <div className="mt-3 space-y-3">
      <div
        ref={emblaRef}
        className="overflow-hidden select-none"
        aria-label="추천 요금제 목록"
      >
        <div className="flex items-stretch gap-3">
          {plans.map((plan) => (
            <div
              key={plan.planId}
              className="w-fit shrink-0 flex first:ml-4 last:mr-4"
            >
              <PlanCard
                title={plan.planName}
                price={plan.monthlyFee ?? 0}
                benefits={toPlanBenefits(plan)}
                context="chat"
                reason={plan.reason}
                className="h-full"
                onDetail={() => handleOpen(plan)}
                onSelect={() => handleSubscribe(plan)}
              />
            </div>
          ))}
        </div>
      </div>

      {isLoggedIn && canShowReportButton && (
        <Button
          variant="secondary"
          size="md"
          className="w-full"
          onClick={handleGenerateReport}
          disabled={isLoading}
        >
          {isGeneratingReport ? '레포트 생성 중...' : '레포트 생성'}
        </Button>
      )}

      <RecommendationDetailSheet
        plan={selected}
        open={open}
        onOpenChange={setOpen}
        onSubscribe={handleSubscribe}
        onCompare={handleCompare}
      />
    </div>
  );
}
