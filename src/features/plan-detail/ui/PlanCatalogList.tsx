import { useState } from 'react';

import { useModalStore } from '@/shared';

import { usePlanFilters } from '../model/usePlanFilters';
import { usePlans } from '../model/usePlans';
import { sortPlans } from '../types';

import PlanFilterModal from './PlanFilterModal';
import PlanListCard from './PlanListCard';
import PlanSearchBar from './PlanSearchBar';

import type { PlanDetailItem, SortOption } from '../types';

interface PlanCatalogListProps {
  onSelectPlan: (plan: PlanDetailItem) => void;
}

export default function PlanCatalogList({
  onSelectPlan,
}: PlanCatalogListProps) {
  const { open, close } = useModalStore();
  const { data: plans = [], isLoading, error } = usePlans();
  const [sort, setSort] = useState<SortOption>('recommended');

  const { filters, setFilters, filteredPlans } = usePlanFilters(plans);
  const sortedPlans = sortPlans(filteredPlans, sort);

  const handleOpenFilter = () => {
    open({
      title: '어떤 요금제를 찾으시나요?',
      content: (
        <PlanFilterModal
          plans={plans}
          initialFilters={filters}
          onApply={(next) => {
            setFilters(next);
            close();
          }}
        />
      ),
    });
  };

  return (
    <div className="flex flex-col min-h-full gap-4">
      <PlanSearchBar
        sort={sort}
        onOpenFilter={handleOpenFilter}
        onSortChange={setSort}
      />

      {isLoading && (
        <p className="py-8 text-center text-caption text-fg-tertiary">
          요금제를 불러오는 중...
        </p>
      )}
      {error && (
        <p className="py-8 text-center text-caption text-semantic-error">
          {error instanceof Error
            ? error.message
            : '요금제 목록을 불러오지 못했습니다.'}
        </p>
      )}
      {!isLoading && !error && sortedPlans.length === 0 && (
        <p className="py-8 text-center text-caption text-fg-tertiary">
          조건에 맞는 요금제가 없습니다.
        </p>
      )}
      {sortedPlans.map((plan) => (
        <PlanListCard
          key={plan.id}
          plan={plan}
          onClick={() => onSelectPlan(plan)}
        />
      ))}
    </div>
  );
}
