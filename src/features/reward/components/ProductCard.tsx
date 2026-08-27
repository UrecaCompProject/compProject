import SmallBadge from './SmallBadge';

import type { RewardProduct } from '../types';

type ProductCardProps = {
  product: RewardProduct;
  onSelect?: (product: RewardProduct) => void;
};

export default function ProductCard({ product, onSelect }: ProductCardProps) {
  const className = `
    flex min-h-[241px] min-w-[179px] w-full max-w-[171px]
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
          rounded-2xl
          bg-[#F9F9F9]
        "
      >
        <img
          src={product.imageUrl}
          alt=""
          className="h-[77px] w-[124px] object-contain"
        />
      </div>

      <h2 className="h-[21px] w-[163px] shrink-0 truncate px-1 text-center text-body-lg font-medium leading-[21px] text-fg-primary">
        {product.brand} {product.name}
      </h2>

      <SmallBadge
        value={product.badgeCost}
        ariaLabel={`필요 배지 ${product.badgeCost}개`}
      />
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
