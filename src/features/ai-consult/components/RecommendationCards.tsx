import { useState } from 'react';

import useEmblaCarousel from 'embla-carousel-react';
import {
  Check,
  Database,
  Gift,
  MessageSquare,
  Phone,
  type LucideIcon,
} from 'lucide-react';

import { useIsLoggedIn } from '@/features/auth';
import PlanCard, {
  type PlanCardBenefit,
} from '@/features/plan-catalog/components/PlanCard';
import { BottomSheet, Button } from '@/features/shared';
import type { RecommendedPlan } from '@/lib/aiConsult';

interface RecommendationCardsProps {
  plans: RecommendedPlan[];
  onPlanSubscribe?: (plan: RecommendedPlan) => void;
  onGenerateReport?: (plans: RecommendedPlan[]) => void;
  isLoading?: boolean;
}

const getBenefitIcon = (label: string): LucideIcon => {
  if (label.includes('데이터') || label.includes('증량')) return Database;
  if (label.includes('통화')) return Phone;
  if (label.includes('넷플릭스') || label.includes('OTT')) return Gift;
  return Check;
};

const BenefitIcon = ({ label }: { label: string }) => {
  if (label.includes('데이터') || label.includes('증량'))
    return <Database size={14} />;
  if (label.includes('통화')) return <Phone size={14} />;
  if (label.includes('넷플릭스') || label.includes('OTT'))
    return <Gift size={14} />;
  return <Check size={14} />;
};

const toPlanBenefits = (plan: RecommendedPlan): PlanCardBenefit[] => {
  const benefits: PlanCardBenefit[] = [];
  if (plan.data) {
    benefits.push({
      icon: Database,
      label: `${plan.data}${plan.dataSpeedAfter ? ` (소진 후 ${plan.dataSpeedAfter})` : ''}`,
    });
  }
  if (plan.voice) benefits.push({ icon: Phone, label: plan.voice });
  if (plan.message) benefits.push({ icon: MessageSquare, label: plan.message });
  (plan.benefits ?? []).slice(0, 2).forEach((benefit) => {
    benefits.push({ icon: getBenefitIcon(benefit), label: benefit });
  });
  return benefits;
};

export default function RecommendationCards({
  plans,
  onPlanSubscribe,
  onGenerateReport,
  isLoading = false,
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

  const handleSubscribe = (plan?: RecommendedPlan) => {
    if (!onPlanSubscribe) return;
    if (plan) setSelected(plan);
    setOpen(false);
    onPlanSubscribe(plan ?? selected!);
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
        <div className="flex h-full">
          {plans.map((plan) => (
            <div
              key={plan.planId}
              className="w-fit shrink-0 h-full pr-1 last:pr-0"
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

      {isLoggedIn ? (
        <Button
          variant="secondary"
          size="md"
          className="w-full"
          onClick={handleGenerateReport}
          disabled={isLoading}
        >
          {isLoading ? '레포트 생성 중...' : '레포트 생성'}
        </Button>
      ) : (
        <p className="text-body-sm text-fg-secondary px-1">
          레포트 저장은 로그인 후에 가능해요.
        </p>
      )}

      {selected && (
        <BottomSheet
          open={open}
          onOpenChange={setOpen}
          title={selected.planName}
          description={
            [selected.category, selected.targetAge]
              .filter(Boolean)
              .join(' · ') || undefined
          }
          footer={
            <div className="flex gap-2 w-full">
              <Button variant="outline" size="md" className="flex-1">
                비교 하기
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => handleSubscribe()}
              >
                신청 하기
              </Button>
            </div>
          }
        >
          <div className="space-y-5 pb-2">
            <section>
              <h5 className="text-body font-semibold text-fg-primary mb-2">
                기본 제공량
              </h5>
              <div className="bg-surface-page rounded-2xl p-4 space-y-2">
                <InfoRow label="데이터" value={selected.data ?? '-'} />
                <InfoRow
                  label="데이터 소진 후"
                  value={selected.dataSpeedAfter ?? '-'}
                />
                <InfoRow label="음성 통화" value={selected.voice ?? '-'} />
                <InfoRow label="메세지" value={selected.message ?? '-'} />
              </div>
            </section>

            <section>
              <h5 className="text-body font-semibold text-fg-primary mb-2">
                콘텐츠 및 부가 혜택
              </h5>
              <div className="bg-surface-page rounded-2xl p-4">
                {(selected.benefits ?? []).length > 0 ? (
                  <ul className="space-y-2">
                    {selected.benefits!.map((benefit, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-body-sm text-fg-secondary"
                      >
                        <span className="mt-0.5 text-fg-tertiary">
                          <BenefitIcon label={benefit} />
                        </span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-body-sm text-fg-disabled">
                    추가 혜택 정보가 없습니다.
                  </p>
                )}
              </div>
            </section>

            <section>
              <h5 className="text-body font-semibold text-fg-primary mb-2">
                제한 및 유의사항
              </h5>
              <div className="bg-surface-page rounded-2xl p-4 space-y-2">
                <InfoRow
                  label="데이터 공유"
                  value={selected.shareData ?? '-'}
                />
                <InfoRow label="테더링" value={selected.tethering ?? '-'} />
                <InfoRow label="비고" value={selected.notes ?? '-'} />
              </div>
            </section>

            {selected.reason && (
              <section>
                <h5 className="text-body font-semibold text-fg-primary mb-2">
                  추천 사유
                </h5>
                <p className="bg-surface-page rounded-2xl p-4 text-body-sm text-fg-secondary leading-relaxed">
                  {selected.reason}
                </p>
              </section>
            )}
          </div>
        </BottomSheet>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-body-sm text-fg-secondary">{label}</span>
      <span className="text-body-sm font-medium text-fg-primary">{value}</span>
    </div>
  );
}
