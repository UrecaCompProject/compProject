import { useState } from 'react';

import { Button, useModalStore } from '@/shared';

import { useMyCoupons } from '../../model/useMyCoupons';
import ProductCard from '../shared/ProductCard';
import SearchBar from '../shared/SearchBar';

import CouponBarcodeModal from './CouponBarcodeModal';

import type { Coupon } from '../../types';

type CouponBoxProps = {
  // 쿠폰이 없을 때 "게임하러 가기" 버튼 → 리워드 홈으로 이동
  onGoToReward: () => void;
};

export default function CouponBox({ onGoToReward }: CouponBoxProps) {
  const [query, setQuery] = useState('');
  const openModal = useModalStore((state) => state.open);
  const { data: coupons = [], isLoading, error } = useMyCoupons();

  const usableCoupons = coupons.filter(
    (coupon) => coupon.status === 'available',
  );
  const normalizedQuery = query.trim().toLowerCase();
  const availableCoupons = usableCoupons.filter((coupon) =>
    `${coupon.brand} ${coupon.name}`.toLowerCase().includes(normalizedQuery),
  );

  const handleSelectCoupon = (coupon: Coupon) => {
    openModal({
      content: (
        <CouponBarcodeModal coupon={coupon} barcodeValue={coupon.barcode} />
      ),
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <p className="text-body text-fg-tertiary">쿠폰을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <p className="text-body text-semantic-error">
          쿠폰을 불러오지 못했어요.
        </p>
      </div>
    );
  }

  // 쿠폰이 0개면 검색바 없이 안내 문구와 리워드 홈 이동 버튼만 보여준다.
  if (usableCoupons.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-10 py-5 text-center">
        <div className="flex h-64 w-64 shrink-0 items-center justify-center">
          <img
            src="/coupon-empty-state.png"
            alt=""
            className="h-full w-full object-contain"
          />
        </div>

        <div className="mt-7.5">
          <h3 className="text-[20px] font-bold text-fg-secondary">
            지금 쿠폰이 없어요
          </h3>
          <p className="mt-1 text-[14px] font-medium text-fg-tertiary">
            열심히 배지를 모으러 가볼까요?
          </p>
        </div>

        <Button
          type="button"
          size="lg"
          className="mt-15 w-full"
          onClick={onGoToReward}
        >
          게임하러 가기
        </Button>
      </div>
    );
  }

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
            <ProductCard
              key={coupon.id}
              product={coupon}
              onSelect={handleSelectCoupon}
            />
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
