import CouponCard from './CouponCard';

import type { Coupon } from '../types';

type CouponListProps = {
  coupons: Coupon[];
};

export default function CouponList({ coupons }: CouponListProps) {
  return (
    <section className="grid grid-cols-2 gap-2">
      {coupons.map((coupon) => (
        <CouponCard key={coupon.id} coupon={coupon} />
      ))}
    </section>
  );
}
