import CouponCard from './CouponCard';

import type { Coupon } from '../types';

type CouponListProps = {
  coupons: Coupon[];
};

export default function CouponList({ coupons }: CouponListProps) {
  return (
    <section
      className="
    mx-auto grid w-full min-w-[288px] max-w-[350px]
    grid-cols-2 gap-x-2 gap-y-[18px]
    sm:max-w-[529px] sm:grid-cols-3
  "
    >
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id} coupon={coupon} />
      ))}
    </section>
  );
}
