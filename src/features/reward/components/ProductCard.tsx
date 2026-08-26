import badgeImage from '@/assets/images/badge.png';

import type { RewardProduct } from '../types';

type ProductCardProps = {
  product: RewardProduct;
  onSelect?: (product: RewardProduct) => void;
};

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const className = `
    flex min-h-[233px] w-full max-w-[171px]
    flex-col items-center gap-2 rounded-[20px]
    border-0 bg-white px-1 py-2
    font-inherit
    ${onSelect ? 'transition-transform active:scale-[0.98]' : ''}
  `;

  const content = (
    <>
      <div
        className="
          flex aspect-square w-full max-w-[163px]
          items-center justify-center
          rounded-[8px]
          bg-[#F9F9F9]
        "
      >
        <img
          src={product.imageUrl}
          alt=""
          className="h-[77px] w-[124px] object-contain"
        />
      </div>

      <h2 className="h-[21px] w-full shrink-0 truncate px-1 text-center text-[16px] font-medium leading-[21px] text-fg-primary">
        {product.brand} {product.name}
      </h2>

      <div
        aria-label={`필요 배지 ${product.badgeCost}개`}
        className="inline-flex h-5 items-center gap-1 rounded-full border border-reward-locked bg-surface-card px-2 text-[12px] font-semibold leading-none text-brand-promo-primary"
      >
        <img src={badgeImage} alt="" className="block h-3 w-3 shrink-0" />

        {product.badgeCost.toLocaleString()}
      </div>
    </>
  );

  if (!onSelect) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button
      aria-label={`${product.brand} ${product.name} 선택`}
      type="button"
      onClick={() => onSelect(product)}
      className={className}
    >
      {content}
    </button>
  );
}
