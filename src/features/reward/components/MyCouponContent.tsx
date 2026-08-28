import { useState } from 'react';

import { coupons } from '../mocks/coupons';

import ProductCard from './ProductCard';
import SearchBar from './SearchBar';

export default function CouponBox() {
  const [query, setQuery] = useState('');

  const availableCoupons = coupons.filter(
    (coupon) =>
      coupon.status === 'available' &&
      coupon.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-3">
      <section>
        <p className="text-[22px] font-bold leading-[150%] text-fg-primary">
          사용할 수 있는 쿠폰이
          <br />
          <span className="text-brand-promo-primary">
            {availableCoupons.length}개
          </span>{' '}
          있어요
        </p>
      </section>

      <SearchBar value={query} onChange={setQuery} />

      {availableCoupons.length > 0 ? (
        <section className="mx-auto mt-2 grid w-full min-w-[288px] grid-cols-2 gap-x-4 gap-y-4.5 sm:grid-cols-3">
          {availableCoupons.map((coupon) => (
            <ProductCard key={coupon.id} product={coupon} />
          ))}
        </section>
      ) : (
        <div className="flex min-h-60 mt-5 items-center justify-center">
          <p className="text-body text-fg-tertiary">검색 결과가 없어요.</p>
        </div>
      )}
    </div>
  );
}
