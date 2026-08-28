import { useNavigate } from 'react-router';

import { PlanCatalogList } from '@/features/plan-detail';

export default function PlanPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-full gap-4 px-4 pt-8 bg-surface-page pb-28">
      <h2 className="text-[24px] font-extrabold leading-[150%] text-fg-primary">
        <span className="text-brand-promo-primary">원하는 조건</span>
        으로
        <br />
        요금제를 찾아보세요
      </h2>

      <PlanCatalogList onSelectPlan={(plan) => navigate(`/plan/${plan.id}`)} />
    </div>
  );
}
