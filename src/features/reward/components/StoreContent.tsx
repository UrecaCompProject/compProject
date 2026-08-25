import { useState } from 'react';

import { useModalStore } from '@/features/shared';

import { products } from '../mocks/products';

import ExchangeContent from './ExchangeContent';
import ProductGrid from './ProductGrid';
import SearchBar from './SearchBar';
import StoreTop from './StoreTop';

import type { RewardProduct } from '../types';

type StoreContentProps = {
  onGoToCoupon: () => void;
};

export default function StoreContent({ onGoToCoupon }: StoreContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const openModal = useModalStore((state) => state.open);

  const filteredProducts = products.filter((product) =>
    `${product.brand} ${product.name}`
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase()),
  );

  const handleSelect = (product: RewardProduct) => {
    openModal({
      content: (
        <ExchangeContent product={product} onGoToCoupon={onGoToCoupon} />
      ),
    });
  };

  return (
    <>
      <StoreTop badgeBalance={5} />

      <section className="flex min-h-full flex-col gap-5 bg-surface-page px-4 py-5">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        <ProductGrid products={filteredProducts} onSelect={handleSelect} />
      </section>
    </>
  );
}
