import { useState } from 'react';

import { Anchor, Database, Phone, MessageSquare, Tv } from 'lucide-react';

import type { RecommendedPlan } from '@/lib/aiConsult';

import PlanDetailSheet from './PlanDetailSheet';

interface RecommendationCardsProps {
  plans: RecommendedPlan[];
}

const BENEFIT_ICONS: Record<string, React.ReactNode> = {
  데이터: <Database size={14} />,
  통화: <Phone size={14} />,
  문자: <MessageSquare size={14} />,
  넷플릭스: <Tv size={14} />,
};

function getBenefitIcon(benefit: string) {
  const key = Object.keys(BENEFIT_ICONS).find((k) => benefit.includes(k));
  return key ? BENEFIT_ICONS[key] : <Anchor size={14} />;
}

export default function RecommendationCards({
  plans,
}: RecommendationCardsProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<RecommendedPlan | null>(null);

  const handleDetail = (plan: RecommendedPlan) => {
    setSelected(plan);
    setOpen(true);
  };

  if (plans.length === 0) return null;

  return (
    <div className="mt-3">
      <div className="flex overflow-x-auto gap-3 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {plans.map((plan) => (
          <div
            key={plan.planId}
            className="min-w-[280px] max-w-[280px] flex-shrink-0 snap-start bg-surface-card rounded-2xl border border-color-border p-4 shadow-sm"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-body font-semibold text-fg-primary leading-tight">
                {plan.planName}
              </h4>
              <Anchor size={18} className="text-brand-promo-primary" />
            </div>

            <p className="text-body-lg font-bold text-brand-promo-primary mb-4">
              월{' '}
              {plan.monthlyFee !== undefined
                ? plan.monthlyFee.toLocaleString()
                : '-'}
              원
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-caption text-fg-secondary">
                <Database size={14} className="text-fg-tertiary" />
                <span>5G 데이터 {plan.data ?? '-'} + 3G 무제한</span>
              </div>
              <div className="flex items-center gap-2 text-caption text-fg-secondary">
                <Phone size={14} className="text-fg-tertiary" />
                <span>통화·문자 무제한</span>
              </div>
              {(plan.benefits ?? []).slice(0, 2).map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-caption text-fg-secondary"
                >
                  <span className="text-fg-tertiary">
                    {getBenefitIcon(benefit)}
                  </span>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-auto">
              <button
                type="button"
                onClick={() => handleDetail(plan)}
                className="flex-1 h-9 rounded-lg border border-brand-promo-primary text-brand-promo-primary text-caption font-medium hover:bg-surface-page transition-colors cursor-pointer"
              >
                자세히 보기
              </button>
              <button
                type="button"
                className="flex-1 h-9 rounded-lg bg-brand-promo-primary text-white text-caption font-medium hover:bg-brand-promo-secondary transition-colors cursor-pointer"
              >
                가입 하기
              </button>
            </div>
          </div>
        ))}
      </div>

      <PlanDetailSheet open={open} onOpenChange={setOpen} plan={selected} />
    </div>
  );
}
