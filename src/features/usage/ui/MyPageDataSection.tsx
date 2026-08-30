import { Card } from '@/shared';

import UsageProgressRow from './UsageProgressRow';

import type { Dayjs } from 'dayjs';

interface MyPageDataSectionProps {
  billingPeriodStart: Dayjs;
  billingPeriodEnd: Dayjs;
  daysUntilPeriodEnd: number;
  dataRemaining: number | null;
  dataTotal?: number;
  dataPercent: number;
  dataSpeedAfter?: string;
}

export default function MyPageDataSection({
  billingPeriodStart,
  billingPeriodEnd,
  daysUntilPeriodEnd,
  dataRemaining,
  dataTotal,
  dataPercent,
  dataSpeedAfter,
}: MyPageDataSectionProps) {
  return (
    <Card radius="none" gap="16" className="px-4 py-5">
      <div className="text-bold-16-140">데이터 상세</div>

      <div className="flex flex-col gap-1">
        <div className="text-bold-16-140 leading-[130%]">
          오늘 기준으로{' '}
          <span className="text-reward-active">{daysUntilPeriodEnd}일</span>{' '}
          남았습니다
        </div>
        <div className="text-regular-12-130 text-fg-disabled">
          {billingPeriodStart.format('YYYY.MM.DD')} ~{' '}
          {billingPeriodEnd.format('YYYY.MM.DD')}
        </div>
      </div>

      <UsageProgressRow
        label="5G 데이터"
        value={dataRemaining != null ? `${dataRemaining.toFixed(2)}GB` : '-'}
        total={dataTotal != null ? `${dataTotal.toFixed(2)}GB` : '-'}
        percent={dataPercent}
      />
      <UsageProgressRow
        label={`${dataSpeedAfter ?? ''} 속도 데이터`}
        value="무제한"
        percent={100}
      />
    </Card>
  );
}
