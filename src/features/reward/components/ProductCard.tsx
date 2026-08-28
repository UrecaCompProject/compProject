import Badge from './Badge';

import type { RewardProduct, Coupon } from '../types';

type ProductCardProps<T extends RewardProduct | Coupon> = {
  product: T;
  onSelect?: (product: T) => void;
};

export default function ProductCard<T extends RewardProduct | Coupon>({
  product,
  onSelect,
}: ProductCardProps<T>) {
  const className = `
    flex w-full
    flex-col items-center gap-2 rounded-2xl bg-white p-2
    font-inherit
    ${onSelect ? 'transition-transform active:scale-[0.98]' : ''}
  `;

  const content = (
    <>
      <div
        style={{ backgroundImage: `url(${product.imageUrl})` }}
        className="
          aspect-square w-full
          rounded-lg bg-[#F9F9F9] bg-size-[80%] bg-center bg-no-repeat
        "
      />

      <h2 className=" shrink-0 truncate w-full px-1 text-center font-medium leading-[130%]">
        {product.brand} {product.name}
      </h2>

      {'badgeCost' in product ? (
        <Badge
          size="small"
          value={product.badgeCost}
          ariaLabel={`필요 배지 ${product.badgeCost}개`}
        />
      ) : (
        <div className="text-[14px] text-fg-tertiary">
          유효기간 : {product.expiresAt}
        </div>
      )}
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
