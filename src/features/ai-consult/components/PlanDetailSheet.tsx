import { Drawer } from 'vaul';

import type { RecommendedPlan } from '@/lib/aiConsult';

interface PlanDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: RecommendedPlan | null;
}

export default function PlanDetailSheet({
  open,
  onOpenChange,
  plan,
}: PlanDetailSheetProps) {
  if (!plan) return null;

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-fg-primary/40 z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-surface-card rounded-t-[20px] px-5 pb-8 pt-2 max-h-[85vh]">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border" />
          <h3 className="text-h3 font-bold text-fg-primary mb-1">
            {plan.planName}
          </h3>
          <p className="text-body-lg text-brand-promo-primary font-semibold mb-6">
            월{' '}
            {plan.monthlyFee !== undefined
              ? plan.monthlyFee.toLocaleString()
              : '-'}
            원
          </p>

          <div className="space-y-4 overflow-y-auto">
            <div className="bg-surface-page rounded-2xl p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-body text-fg-secondary">데이터</span>
                <span className="text-body font-medium text-fg-primary">
                  {plan.data ?? '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-body text-fg-secondary">월 요금</span>
                <span className="text-body font-medium text-fg-primary">
                  {plan.monthlyFee !== undefined
                    ? `${plan.monthlyFee.toLocaleString()}원`
                    : '-'}
                </span>
              </div>
              {plan.savingAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-body text-fg-secondary">절감 금액</span>
                  <span className="text-body font-medium text-success">
                    월 {plan.savingAmount.toLocaleString()}원
                  </span>
                </div>
              )}
            </div>

            <div className="bg-surface-page rounded-2xl p-4">
              <h4 className="text-body font-semibold text-fg-primary mb-2">
                혜택
              </h4>
              <ul className="space-y-1.5">
                {(plan.benefits ?? []).length > 0 ? (
                  plan.benefits!.map((benefit, index) => (
                    <li
                      key={index}
                      className="text-body-sm text-fg-secondary flex items-start gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-brand-promo-primary mt-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))
                ) : (
                  <li className="text-body-sm text-fg-disabled">
                    추가 혜택 정보가 없습니다.
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-surface-page rounded-2xl p-4">
              <h4 className="text-body font-semibold text-fg-primary mb-2">
                추천 사유
              </h4>
              <p className="text-body-sm text-fg-secondary leading-relaxed">
                {plan.reason}
              </p>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
