import { Card } from '@/shared';

import UsageProgressRow from './UsageProgressRow';

interface MyPageCallSectionProps {
  callTotal?: number;
  callPercent: number;
  callUsedSeconds?: number;
}

// callUsedSeconds는 초 단위이므로 "MM분 SS초" 형태로 변환한다.
function toMinSecLabel(totalSeconds: number | undefined) {
  if (totalSeconds == null) return null;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}분 ${String(seconds).padStart(2, '0')}초`;
}

export default function MyPageCallSection({
  callTotal,
  callPercent,
  callUsedSeconds,
}: MyPageCallSectionProps) {
  const callUsedLabel = toMinSecLabel(callUsedSeconds);

  return (
    <Card radius="none" gap="16" className="px-4 py-5">
      <div className="text-bold-16-140">통화</div>

      <UsageProgressRow
        label="유무선 통화"
        value={callUsedLabel ?? '-'}
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
