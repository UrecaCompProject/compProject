import { useState } from 'react';

import couponExchangeImage from '@/assets/images/coupon-exchange.svg';
import { Button, useModalStore } from '@/features/shared';

import ProductCard from './ProductCard';

import type { RewardProduct } from '../types';

type ExchangePhase = 'confirm' | 'success';

type ExchangeContentProps = {
  product: RewardProduct;
  onGoToCoupon: () => void;
};

export default function ExchangeCouponModal({
  product,
  onGoToCoupon,
}: ExchangeContentProps) {
  const [phase, setPhase] = useState<ExchangePhase>('confirm');
  const closeModal = useModalStore((state) => state.close);

  const handleGoToCoupon = () => {
    closeModal();
    onGoToCoupon();
  };

  if (phase === 'success') {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <img
          src={couponExchangeImage}
          alt="교환 완료 상품권"
          className="mt-4 h-[121px] w-full max-w-[236px] object-contain"
        />

        <div className="flex flex-col gap-2">
          <h2 className="text-title text-fg-primary">교환이 완료됐어요</h2>
          <p className="text-caption text-fg-tertiary">
            발급된 쿠폰은 나의 쿠폰함에서 확인할 수 있어요.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2">
          <Button type="button" className="w-full" onClick={handleGoToCoupon}>
            쿠폰함에서 확인하기
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={closeModal}
          >
            상점 계속 보기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <ProductCard product={product} />

      <p className="text-body-lg font-bold text-fg-primary">
        이 상품을 교환할까요?
      </p>

      <div className="flex w-full flex-col gap-2">
        <Button
          type="button"
          className="w-full"
          onClick={() => setPhase('success')}
        >
          교환하기
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={closeModal}
        >
          취소
        </Button>
      </div>
    </div>
  );
}
