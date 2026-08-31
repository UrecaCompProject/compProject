import Badge from './Badge';

import type { RewardProduct, Coupon } from '../../types';

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

  // DB의 name에 브랜드명이 이미 포함된 경우(예: "wavve 1개월 상품권")
  // brand를 다시 앞에 붙이면 중복 표기되므로, name이 brand로 시작하면 그대로 쓴다.
  const displayName = product.name
    .toLowerCase()
    .startsWith(product.brand.toLowerCase())
    ? product.name
    : `${product.brand} ${product.name}`;

  const content = (
    <>
      <div
        style={{ backgroundImage: `url(${product.imageUrl})` }}
        className="
          aspect-square w-full
          rounded-lg bg-surface-page bg-size-[80%] bg-center bg-no-repeat
        "
      />

      <h2 className=" shrink-0 truncate w-full px-1 text-center font-medium leading-[130%]">
        {displayName}
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
      aria-label={`${displayName} 선택`}
      type="button"
      onClick={() => onSelect(product)}
      className={className}
    >
      {content}
    </button>
  );
}
