import { Button, useModalStore } from '@/shared';

import ProductCard from '../shared/ProductCard';

import type { Coupon } from '../../types';

type CouponBarcodeModalProps = {
  coupon: Coupon;
  barcodeValue?: string;
};

const DEFAULT_BARCODE_VALUE = '8801234567890';

function createBarcodeBars(value: string) {
  return value
    .replace(/\D/g, '')
    .padEnd(13, '0')
    .slice(0, 13)
    .split('')
    .flatMap((digit, index) => {
      const width = (Number(digit) % 4) + 1;
      return [
        { key: `${index}-wide`, width },
        { key: `${index}-thin`, width: index % 3 === 0 ? 1 : 2 },
      ];
    });
}

export default function CouponBarcodeModal({
  coupon,
  barcodeValue = DEFAULT_BARCODE_VALUE,
}: CouponBarcodeModalProps) {
  const closeModal = useModalStore((state) => state.close);
  const normalizedBarcode = barcodeValue
    .replace(/\D/g, '')
    .padEnd(13, '0')
    .slice(0, 13);
  const barcodeBars = createBarcodeBars(normalizedBarcode);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <ProductCard product={coupon} />

      <div className="w-full rounded-2xl border border-border bg-surface-card px-4 py-5">
        <div
          className="mx-auto flex h-24 w-full max-w-[240px] items-stretch justify-center gap-px"
          aria-label={`바코드 번호 ${normalizedBarcode}`}
          role="img"
        >
          {barcodeBars.map((bar) => (
            <span
              key={bar.key}
              className="h-full bg-fg-primary"
              style={{ width: `${bar.width * 3}px` }}
            />
          ))}
        </div>

        <p className="mt-3 font-mono text-body-lg font-bold text-fg-primary">
          {normalizedBarcode.replace(/(\d{4})(\d{4})(\d{5})/, '$1 $2 $3')}
        </p>
      </div>

      <p className="text-caption text-fg-tertiary">
        매장 직원에게 바코드를 보여주세요.
      </p>

      <div className="flex w-full flex-col gap-2">
        <Button type="button" className="w-full" onClick={closeModal}>
          확인
        </Button>
      </div>
    </div>
  );
}
