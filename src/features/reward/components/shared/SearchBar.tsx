import { Search } from 'lucide-react';

import { Input } from '@/features/shared';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative rounded-full">
      <Input
        type="search"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder="상품명 검색..."
        className="border border-border bg-white pr-11 text-caption focus:border-brand-promo-primary"
      />

      <Search
        size={22}
        aria-hidden="true"
        className="
    pointer-events-none
    absolute right-4 top-1/2
    -translate-y-1/2
    text-brand-promo-primary
  "
      />
    </div>
  );
}
