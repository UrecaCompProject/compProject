import { useState } from 'react';

import { useModalStore } from '@/shared';

import { useProducts } from '../../model/useProducts';
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

  const { data: products = [], isLoading, error } = useProducts();

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
      <div className="sticky top-0 z-10 will-change-transform">
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

        <div className="bg-surface-page/70 px-4 py-4 backdrop-blur-md">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
      </div>

      <section className="flex gap-5 min-h-full flex-col bg-surface-page px-4 py-5">
        {isLoading && (
          <p className="py-8 text-center text-caption text-fg-tertiary">
            상품을 불러오는 중...
          </p>
        )}
        {error && (
          <p className="py-8 text-center text-caption text-semantic-error">
            상품 목록을 불러오지 못했습니다.
          </p>
        )}
        {!isLoading && !error && filteredProducts.length === 0 && (
          <p className="py-8 text-center text-caption text-fg-tertiary">
            상품이 없습니다.
          </p>
        )}

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
