import { useState } from 'react';

import { coupons } from '../mocks/coupons';

import CouponList from './CouponList';
import CouponSearch from './CouponSearch';
import CouponSummary from './CouponSummary';
import EmptyCoupons from './EmptyCoupons';

export default function CouponBox() {
  const [query, setQuery] = useState('');

  const availableCoupons = coupons.filter(
    (coupon) =>
      coupon.status === 'available' &&
      coupon.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <CouponSummary count={availableCoupons.length} />

      <CouponSearch value={query} onChange={setQuery} />

      {availableCoupons.length > 0 ? (
        <CouponList coupons={availableCoupons} />
      ) : (
        <EmptyCoupons />
      )}
    </div>
  );
}
