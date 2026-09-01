import Barcode from 'react-barcode';

import { Button, useModalStore } from '@/shared';

import ProductCard from '../shared/ProductCard';

import type { Coupon } from '../../types';

type CouponBarcodeModalProps = {
  coupon: Coupon;
  barcodeValue?: string;
};

const DEFAULT_BARCODE_VALUE = '8801234567890';

export default function CouponBarcodeModal({
  coupon,
  barcodeValue = DEFAULT_BARCODE_VALUE,
}: CouponBarcodeModalProps) {
  const closeModal = useModalStore((state) => state.close);
  const normalizedBarcode = barcodeValue
    .replace(/\D/g, '')
    .padEnd(13, '0')
    .slice(0, 13);

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <ProductCard product={coupon} />

      <div className="w-full rounded-2xl border border-border bg-surface-card px-4 py-3">
        <div className="flex w-full justify-center overflow-hidden">
          <Barcode
            value={normalizedBarcode}
            format="CODE128"
            width={1.4}
            height={56}
            displayValue={false}
            margin={0}
            background="transparent"
            lineColor="#1f2229"
          />
        </div>

        <p className="mt-2 font-mono text-caption font-bold text-fg-primary">
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
