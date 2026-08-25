import type { Coupon } from '../types';

type CouponCardProps = {
  coupon: Coupon;
};

export default function CouponCard({ coupon }: CouponCardProps) {
  return (
    <article>
      <div>
        <img src={coupon.image} alt="" />
      </div>

      <h3>{coupon.name}</h3>
      <p>{coupon.expiresAt}까지</p>
    </article>
  );
}
