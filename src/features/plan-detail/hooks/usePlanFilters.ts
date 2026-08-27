import { useMemo, useState } from 'react';

import {
  DEFAULT_PLAN_FILTER,
  matchesPlanFilter,
  type PlanDetailItem,
  type PlanFilterState,
} from '../types';

export function usePlanFilters(plans: PlanDetailItem[]) {
  const [filters, setFilters] = useState<PlanFilterState>(DEFAULT_PLAN_FILTER);

  const filteredPlans = useMemo(
    () => plans.filter((plan) => matchesPlanFilter(plan, filters)),
    [plans, filters],
  );

  const resetFilters = () => setFilters(DEFAULT_PLAN_FILTER);

  return { filters, setFilters, filteredPlans, resetFilters };
}
