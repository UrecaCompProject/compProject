import type { Coupon } from '../types';

type CouponCardProps = {
  coupon: Coupon;
};

export default function CouponCard({ coupon }: CouponCardProps) {
  return (
    <article className="group min-w-0 cursor-pointer">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-reward-locked bg-surface-card p-4 transition-shadow duration-200 group-hover:shadow-md">
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

      <h3 className="mt-2 line-clamp-2 text-center text-caption text-fg-primary">
        {coupon.name}
      </h3>
      <p className="mt-0.5 text-center text-[10px] leading-[14px] text-fg-tertiary">
        유효기간: {coupon.expiresAt}
      </p>
    </article>
  );
}
