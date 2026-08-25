import { Search } from 'lucide-react';

import { Input } from '@/features/shared';

type CouponSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function CouponSearch({ value, onChange }: CouponSearchProps) {
  return (
    <div className="relative">
      <Input
        value={value}
        placeholder="상품명 검색..."
        onChange={(event) => onChange(event.target.value)}
        className="pr-10"
      />

      <Search
        aria-hidden="true"
        size={20}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-promo-primary"
      />
    </div>
  );
}
