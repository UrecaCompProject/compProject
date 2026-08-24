import { useState } from 'react';

import {
  Anchor,
  Check,
  Database,
  Gift,
  MessageSquare,
  Phone,
} from 'lucide-react';

import { BottomSheet, Button, Card } from '@/features/shared';
import type { RecommendedPlan } from '@/lib/aiConsult';

interface RecommendationCardsProps {
  plans: RecommendedPlan[];
}

const BenefitIcon = ({ label }: { label: string }) => {
  if (label.includes('데이터') || label.includes('증량'))
    return <Database size={14} />;
  if (label.includes('통화')) return <Phone size={14} />;
  if (label.includes('넷플릭스') || label.includes('OTT'))
    return <Gift size={14} />;
  return <Check size={14} />;
};

export default function RecommendationCards({
  plans,
}: RecommendationCardsProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<RecommendedPlan | null>(null);

  const handleOpen = (plan: RecommendedPlan) => {
    setSelected(plan);
    setOpen(true);
  };

  if (plans.length === 0) return null;

  return (
    <div className="mt-3">
      <div
        className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="추천 요금제 목록"
      >
        {plans.map((plan) => (
          <Card
            key={plan.planId}
            border="default"
            radius="16"
            gap="12"
            className="min-w-[280px] max-w-[280px] flex-shrink-0 snap-start"
          >
            <div className="flex items-start justify-between">
              <h4 className="text-body font-semibold text-fg-primary leading-tight">
                {plan.planName}
              </h4>
              <Anchor size={18} className="text-brand-promo-primary" />
            </div>

            <p className="text-body-lg font-bold text-brand-promo-primary">
              월{' '}
              {plan.monthlyFee !== undefined
                ? plan.monthlyFee.toLocaleString()
                : '-'}
              원
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-caption text-fg-secondary">
                <Database size={14} className="text-fg-tertiary" />
                <span>
                  {plan.data ?? '-'}
                  {plan.dataSpeedAfter
                    ? ` (소진 후 ${plan.dataSpeedAfter})`
                    : ''}
                </span>
              </div>
              <div className="flex items-center gap-2 text-caption text-fg-secondary">
                <Phone size={14} className="text-fg-tertiary" />
                <span>{plan.voice ?? '-'}</span>
              </div>
              <div className="flex items-center gap-2 text-caption text-fg-secondary">
                <MessageSquare size={14} className="text-fg-tertiary" />
                <span>{plan.message ?? '-'}</span>
              </div>
              {(plan.benefits ?? []).slice(0, 2).map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-caption text-fg-secondary"
                >
                  <span className="text-fg-tertiary">
                    <BenefitIcon label={benefit} />
                  </span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleOpen(plan)}
              >
                자세히 보기
              </Button>
              <Button variant="primary" size="sm" className="flex-1">
                가입 하기
              </Button>
            </div>
          </Card>
        ))}
      </div>

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
              <Button variant="primary" size="md" className="flex-1">
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
