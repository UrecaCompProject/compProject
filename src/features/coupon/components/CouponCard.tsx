import type { Coupon } from '../types';

type CouponCardProps = {
  coupon: Coupon;
};

export default function CouponCard({ coupon }: CouponCardProps) {
  return (
    <article
      className="group flex min-h-[233px] min-w-[140px] w-full max-w-[171px]
    cursor-pointer flex-col items-center gap-2
    rounded-[20px] bg-white px-1 py-2"
    >
      <div className="relative flex aspect-square w-full max-w-[163px] items-center justify-center overflow-hidden rounded-[8px] bg-[#F9F9F9]">
        <img
          src={coupon.image}
          alt={`${coupon.name} 상품 이미지`}
          className="h-auto max-h-[77px] w-full max-w-[124px] object-contain"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-fg-primary/0 transition-colors duration-200 group-hover:bg-fg-primary/20"
        />
      </div>

      <h3 className="h-[21px] w-full shrink-0 truncate px-1 text-center text-body-lg leading-[21px] text-fg-primary">
        {coupon.name}
      </h3>
      <p className="text-center text-regular-12-130 leading-[14px] text-fg-tertiary">
        유효기간: {coupon.expiresAt}
      </p>
    </article>
  );
}
