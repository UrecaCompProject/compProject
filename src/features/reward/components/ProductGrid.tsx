import ProductCard from './ProductCard';

import type { RewardProduct } from '../types';

type ProductGridProps = {
  products: RewardProduct[];
  onSelect: (product: RewardProduct) => void;
};

export default function ProductGrid({ products, onSelect }: ProductGridProps) {
  if (products.length === 0) {
    return <p>검색 결과가 없습니다.</p>;
  }
  return (
    <section
      className="
    mx-auto grid w-full min-w-[288px] max-w-[350px]
    grid-cols-2 gap-x-2 gap-y-[18px]
    sm:max-w-[529px] sm:grid-cols-3
  "
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onSelect={onSelect} />
      ))}
    </section>
  );
}
