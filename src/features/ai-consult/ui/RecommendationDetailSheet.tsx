import { Check } from 'lucide-react';

import { BottomSheet, Button } from '@/shared';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';

interface RecommendationDetailSheetProps {
  plan: RecommendedPlan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubscribe: (plan: RecommendedPlan) => void;
  onCompare: (plan: RecommendedPlan) => void;
}

// 추천 요금제 카드 클릭 시 표시되는 상세 정보 BottomSheet
export default function RecommendationDetailSheet({
  plan,
  open,
  onOpenChange,
  onSubscribe,
  onCompare,
}: RecommendationDetailSheetProps) {
  if (!plan) return null;

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={plan.planName}
      description={
        [plan.category, plan.targetAge].filter(Boolean).join(' · ') || undefined
      }
      footer={
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            onClick={() => onCompare(plan)}
          >
            비교 하기
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={() => onSubscribe(plan)}
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
            <InfoRow label="데이터" value={plan.data ?? '-'} />
            <InfoRow
              label="데이터 소진 후"
              value={plan.dataSpeedAfter ?? '-'}
            />
            <InfoRow label="음성 통화" value={plan.voice ?? '-'} />
            <InfoRow label="메세지" value={plan.message ?? '-'} />
          </div>
        </section>

        <section>
          <h5 className="text-body font-semibold text-fg-primary mb-2">
            콘텐츠 및 부가 혜택
          </h5>
          <div className="bg-surface-page rounded-2xl p-4">
            {(plan.benefits ?? []).length > 0 ? (
              <ul className="space-y-2">
                {plan.benefits!.map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-body-sm text-fg-secondary"
                  >
                    <span className="mt-0.5 text-fg-tertiary">
                      <Check size={14} />
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
            <InfoRow label="데이터 공유" value={plan.shareData ?? '-'} />
            <InfoRow label="테더링" value={plan.tethering ?? '-'} />
            <InfoRow label="비고" value={plan.notes ?? '-'} />
          </div>
        </section>

        {plan.reason && (
          <section>
            <h5 className="text-body font-semibold text-fg-primary mb-2">
              추천 사유
            </h5>
            <p className="bg-surface-page rounded-2xl p-4 text-body-sm text-fg-secondary leading-relaxed">
              {plan.reason}
            </p>
          </section>
        )}
      </div>
    </BottomSheet>
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
