import { Card } from '@/shared';

import UsageProgressRow from './UsageProgressRow';

interface MyPageCallSectionProps {
  callRemaining: number | null;
  callTotal?: number;
  callPercent: number;
}

export default function MyPageCallSection({
  callRemaining,
  callTotal,
  callPercent,
}: MyPageCallSectionProps) {
  return (
    <Card radius="none" gap="16" className="px-4 py-5">
      <div className="text-bold-16-140">통화</div>

      <UsageProgressRow
        label="유무선 통화"
        value={callRemaining != null ? `${callRemaining}분` : '-'}
        total={callTotal != null ? `${callTotal}분` : '-'}
        percent={callPercent}
      />
      <UsageProgressRow
        label="영상 & 부가 통화"
        value="300분"
        total="300분"
        percent={100 - (0 / 300) * 100}
      />
    </Card>
  );
}
