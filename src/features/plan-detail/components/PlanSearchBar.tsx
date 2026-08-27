import { ArrowUpDown, Search } from 'lucide-react';

import { SORT_LABELS } from '../types';

import type { SortOption } from '../types';

interface PlanSearchBarProps {
  sort: SortOption;
  onOpenFilter: () => void;
  onCycleSort: () => void;
}

export default function PlanSearchBar({
  sort,
  onOpenFilter,
  onCycleSort,
}: PlanSearchBarProps) {
  return (
    <div className="flex items-center gap-3 bg-surface-page">
      <button
        type="button"
        onClick={onOpenFilter}
        className="flex flex-1 items-center gap-1 text-[14px] font-medium text-fg-tertiary"
      >
        <Search size={17} />
        검색필터
      </button>

      <button
        type="button"
        onClick={onCycleSort}
        className="flex shrink-0 items-center gap-1 text-[14px] font-medium text-fg-tertiary"
      >
        <ArrowUpDown size={17} />
        {SORT_LABELS[sort]}
      </button>
    </div>
  );
}
