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
  return (
    <Card radius="none" gap="16" className="px-4 py-5">
      <div className="text-bold-16-140">문자</div>

      <UsageProgressRow
        label="메세지"
        value={smsRemaining != null ? `${smsRemaining}건` : '-'}
        total={smsTotal != null ? `${smsTotal}건` : '-'}
        percent={smsPercent}
      />
    </Card>
  );
}
