import { useEffect, useState } from 'react';

import { useModalStore } from '@/features/shared';

import { getPlans } from '../api/getPlans';
import { usePlanFilters } from '../hooks/usePlanFilters';
import { nextSort, sortPlans } from '../types';

import PlanFilterModal from './PlanFilterModal';
import PlanListCard from './PlanListCard';
import PlanSearchBar from './PlanSearchBar';

import type { PlanDetailItem, SortOption } from '../types';

interface PlanCatalogListProps {
  onSelectPlan: (plan: PlanDetailItem) => void;
}

// 요금제 검색/필터/정렬 리스트 자체.
// /plan 라우트(PlanPage)와 채팅 인풋의 요금제 퀵시트(PlanQuickSheet)가 이 컴포넌트를 공유한다.
// 좌우 패딩은 안 넣어뒀으니, 감싸는 쪽에서 필요에 맞게 넣어줘야 한다.
export default function PlanCatalogList({
  onSelectPlan,
}: PlanCatalogListProps) {
  const { open, close } = useModalStore();

  const [plans, setPlans] = useState<PlanDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('recommended');

  const { filters, setFilters, filteredPlans } = usePlanFilters(plans);
  const sortedPlans = sortPlans(filteredPlans, sort);

  useEffect(() => {
    let cancelled = false;
    getPlans()
      .then((result) => {
        if (!cancelled) {
          setPlans(result);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setPlans([]);
          setError(
            err instanceof Error
              ? err.message
              : '요금제 목록을 불러오지 못했습니다.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
    <div className="flex flex-col gap-4">
      <PlanSearchBar
        sort={sort}
        onOpenFilter={handleOpenFilter}
        onCycleSort={() => setSort((prev) => nextSort(prev))}
      />

      {isLoading && (
        <p className="py-8 text-center text-caption text-fg-tertiary">
          요금제를 불러오는 중...
        </p>
      )}
      {!isLoading && error && (
        <p className="py-8 text-center text-caption text-error">{error}</p>
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
