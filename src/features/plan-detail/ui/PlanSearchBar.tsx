import { useRef, useState } from 'react';

import { ChevronDown, Search } from 'lucide-react';

import { useClickOutside } from '@/shared';

import { SORT_LABELS } from '../types';

import type { SortOption } from '../types';

interface PlanSearchBarProps {
  sort: SortOption;
  onOpenFilter: () => void;
  onSortChange: (sort: SortOption) => void;
}

const SORT_OPTIONS: SortOption[] = ['recommended', 'priceAsc', 'priceDesc'];

export default function PlanSearchBar({
  sort,
  onOpenFilter,
  onSortChange,
}: PlanSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useClickOutside(dropdownRef, isOpen, () => setIsOpen(false));

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

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex shrink-0 items-center gap-1 text-[14px] font-medium text-fg-tertiary"
        >
          {SORT_LABELS[sort]}
          <ChevronDown
            size={14}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <ul className="absolute right-0 top-full z-10 mt-1 min-w-30 rounded-lg border border-border bg-surface-card py-1 shadow-md">
            {SORT_OPTIONS.map((option) => (
              <li key={option}>
                <button
                  type="button"
                  onClick={() => {
                    onSortChange(option);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center px-3 py-2 text-[13px] transition-colors hover:bg-surface-page ${
                    option === sort
                      ? 'font-semibold text-brand-promo-primary'
                      : 'text-fg-secondary'
                  }`}
                >
                  {SORT_LABELS[option]}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
