import { useState } from 'react';

import { useModalStore } from '@/features/shared';

import { products } from '../../mocks/products';
import Badge from '../shared/Badge';
import ProductCard from '../shared/ProductCard';
import SearchBar from '../shared/SearchBar';

import ExchangeCouponModal from './ExchangeCouponModal';

import type { RewardProduct } from '../../types';

type StoreContentProps = {
  onGoToCoupon: () => void;
};

export default function StoreContent({ onGoToCoupon }: StoreContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const openModal = useModalStore((state) => state.open);
  const badgeBalance = 100;

  const filteredProducts = products.filter((product) =>
    `${product.brand} ${product.name}`
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase()),
  );

  const handleSelect = (product: RewardProduct) => {
    openModal({
      content: (
        <ExchangeCouponModal product={product} onGoToCoupon={onGoToCoupon} />
      ),
    });
  };

  return (
    <>
      <section className="relative w-full border-b-2 border-brand-promo-primary bg-surface-card">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-bold-16-140 font-bold text-brand-promo-primary">
            배지 상점
          </h1>

          <Badge
            size="large"
            value={badgeBalance}
            ariaLabel={`보유 배지 ${badgeBalance}개`}
          />
        </div>
      </section>

      <section className="flex gap-5 min-h-full flex-col bg-surface-page px-4 py-5">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        <section className="mx-auto grid w-full min-w-[288px] grid-cols-2 gap-x-4 gap-y-4.5 sm:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={handleSelect}
            />
          ))}
        </section>
      </section>
    </>
  );
}
