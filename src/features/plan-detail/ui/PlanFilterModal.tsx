import { useMemo, useState } from 'react';

import { Button } from '@/shared';

import {
  AGE_GROUP_OPTIONS,
  DATA_RANGE_OPTIONS,
  DEFAULT_PLAN_FILTER,
  matchesPlanFilter,
  PRICE_RANGE_OPTIONS,
  type PlanDetailItem,
  type PlanFilterState,
} from '../types';

interface PlanFilterModalProps {
  plans: PlanDetailItem[];
  initialFilters: PlanFilterState;
  onApply: (filters: PlanFilterState) => void;
}

function FilterSection<K extends string>({
  title,
  options,
  value,
  onSelect,
}: {
  title: string;
  options: { key: K; label: string }[];
  value: K;
  onSelect: (key: K) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h4 className="text-body font-semibold text-fg-primary">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option.key}
            type="button"
            variant="chip"
            size="chip"
            active={option.key === value}
            aria-pressed={option.key === value}
            onClick={() => onSelect(option.key)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </section>
  );
}

export default function PlanFilterModal({
  plans,
  initialFilters,
  onApply,
}: PlanFilterModalProps) {
  const [draft, setDraft] = useState<PlanFilterState>(initialFilters);

  const matchCount = useMemo(
    () => plans.filter((plan) => matchesPlanFilter(plan, draft)).length,
    [plans, draft],
  );

  return (
    <div className="flex flex-col gap-5">
      <FilterSection
        title="요금 범위"
        options={PRICE_RANGE_OPTIONS}
        value={draft.price}
        onSelect={(price) => setDraft((prev) => ({ ...prev, price }))}
      />
      <div className="h-px bg-border" />
      <FilterSection
        title="데이터"
        options={DATA_RANGE_OPTIONS}
        value={draft.data}
        onSelect={(data) => setDraft((prev) => ({ ...prev, data }))}
      />
      <div className="h-px bg-border" />
      <FilterSection
        title="연령대"
        options={AGE_GROUP_OPTIONS}
        value={draft.age}
        onSelect={(age) => setDraft((prev) => ({ ...prev, age }))}
      />

      <div className="flex gap-2 border-t border-border pt-4">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => setDraft(DEFAULT_PLAN_FILTER)}
        >
          전체 해제
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          className="flex-1"
          onClick={() => onApply(draft)}
        >
          {matchCount}개 요금제 보기
        </Button>
      </div>
    </div>
  );
}
