import { useState } from 'react';

import { Check } from 'lucide-react';

import { usePlanCatalog } from '@/entities/plan';
import { Button } from '@/shared';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';

interface PlanSelectorProps {
  onSelect: (planName: string) => void;
  disabled?: boolean;
  mode?: 'current' | 'target';
}

export default function PlanSelector({
  onSelect,
  disabled = false,
  mode = 'current',
}: PlanSelectorProps) {
  const { data: plans = [], isLoading, error } = usePlanCatalog();
  const [selected, setSelected] = useState<RecommendedPlan | null>(null);

  const handleConfirm = () => {
    if (!selected || disabled) return;
    onSelect(selected.planName);
  };

  return (
    <div className="mt-3 space-y-3">
      {isLoading && (
        <p className="text-center text-caption text-fg-tertiary py-4">
          요금제 목록을 불러오는 중...
        </p>
      )}

      {error && (
        <p className="text-center text-caption text-semantic-error py-4">
          {error instanceof Error
            ? error.message
            : '요금제 목록을 불러오지 못했습니다.'}
        </p>
      )}

      {!isLoading && !error && plans.length === 0 && (
        <p className="text-center text-caption text-fg-tertiary py-4">
          등록된 요금제가 없습니다.
        </p>
      )}

      {!isLoading && !error && plans.length > 0 && (
        <>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {plans.map((plan) => {
              const isSelected = plan.planId === selected?.planId;
              return (
                <button
                  key={plan.planId}
                  type="button"
                  onClick={() => setSelected(plan)}
                  disabled={disabled}
                  className={`w-full text-left rounded-2xl border p-3 transition-colors ${
                    disabled
                      ? 'cursor-not-allowed opacity-60'
                      : 'cursor-pointer'
                  } ${
                    isSelected
                      ? 'border-brand-promo-primary bg-brand-promo-primary/5'
                      : 'border-border bg-white hover:bg-surface-page'
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-body-sm font-semibold text-fg-primary">
                      {plan.planName}
                    </span>
                    <span className="text-body-sm font-bold text-brand-promo-secondary">
                      월 {plan.monthlyFee?.toLocaleString() ?? '-'}원
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-caption text-fg-secondary">
                    {plan.data && <span>데이터 {plan.data}</span>}
                    {plan.voice && <span>음성 {plan.voice}</span>}
                  </div>
                  {isSelected && (
                    <div className="mt-1 flex items-center gap-1 text-caption text-brand-promo-primary">
                      <Check size={12} />
                      선택됨
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={handleConfirm}
            disabled={!selected || disabled}
          >
            {mode === 'target'
              ? '선택한 요금제와 비교하기'
              : '선택한 요금제로 비교하기'}
          </Button>
        </>
      )}
    </div>
  );
}
