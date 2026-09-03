import { Card } from '@/shared';

import UsageProgressRow from './UsageProgressRow';

interface MyPageSmsSectionProps {
  smsRemaining: number | null;
  smsTotal?: number;
  smsPercent: number;
}

export default function MyPageSmsSection({
  smsRemaining,
  smsTotal,
  smsPercent,
}: MyPageSmsSectionProps) {
  // sms_amount는 무제한 요금제일 경우 9999로 저장되어 있어, 그대로 표시하면 의미가 없다.
  const isUnlimited = smsTotal != null && smsTotal >= 9999;

  return (
    <Card radius="none" gap="16" className="px-4 py-5">
      <div className="text-bold-16-140">문자</div>

      <UsageProgressRow
        label="메세지"
        value={
          isUnlimited
            ? '무제한'
            : smsRemaining != null
              ? `${smsRemaining}건`
              : '-'
        }
        total={
          isUnlimited ? undefined : smsTotal != null ? `${smsTotal}건` : '-'
        }
        percent={isUnlimited ? 100 : smsPercent}
      />
    </Card>
  );
}
