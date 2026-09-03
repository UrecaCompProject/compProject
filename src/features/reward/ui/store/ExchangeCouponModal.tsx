import { useState } from 'react';

import { Button, useModalStore } from '@/shared';
import couponExchangeImage from '@/shared/assets/images/coupon-exchange.svg';

import { useExchangeProduct } from '../../model/useExchangeProduct';
import ProductCard from '../shared/ProductCard';

import type { RewardProduct } from '../../types';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const closeModal = useModalStore((state) => state.close);
  const exchangeProduct = useExchangeProduct();

  const handleExchange = async () => {
    setErrorMessage(null);
    try {
      await exchangeProduct.mutateAsync({
        productId: product.id,
        badgeCost: product.badgeCost,
      });
      setPhase('success');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : '교환에 실패했습니다.',
      );
    }
  };

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

      {errorMessage && (
        <p className="text-caption text-semantic-error">{errorMessage}</p>
      )}

      <div className="flex w-full flex-col gap-2">
        <Button
          type="button"
          className="w-full"
          onClick={handleExchange}
          disabled={exchangeProduct.isPending}
        >
          {exchangeProduct.isPending ? '교환 중...' : '교환하기'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={closeModal}
          disabled={exchangeProduct.isPending}
        >
          취소
        </Button>
      </div>
    </div>
  );
}
