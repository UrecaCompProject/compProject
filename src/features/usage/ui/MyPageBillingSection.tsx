import { BadgePercent } from 'lucide-react';

import { Card, IconListItem, Line } from '@/shared';

interface MyPageBillingSectionProps {
  gbBenefit?: string;
  monthlyFee?: number;
}

export default function MyPageBillingSection({
  gbBenefit,
  monthlyFee,
}: MyPageBillingSectionProps) {
  return (
    <Card radius="none" gap="16" className="px-4 py-5">
      <div className="text-bold-16-140">요금 조회 / 납부 정보</div>
      <Line />
      {gbBenefit && (
        <IconListItem
          icon={BadgePercent}
          label={gbBenefit}
          variant="bordered"
          iconSize={16}
          iconColor="text-coupon-primary"
          textClassName="text-[12px] font-semibold text-coupon-primary"
          className="rounded-lg border-coupon-primary bg-coupon-soft leading-[100%]"
        />
      )}
      <div className="flex justify-between">
        <div className="text-bold-16-140">최종 예상 요금</div>
        <div className="text-bold-16-140 text-reward-active">
          월 {monthlyFee?.toLocaleString() ?? '-'}원
        </div>
      </div>
    </Card>
  );
}
