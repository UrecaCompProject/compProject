import { Card } from '@/shared';

import UsageProgressRow from './UsageProgressRow';

interface MyPageCallSectionProps {
  callTotal?: number;
  callPercent: number;
  callUsedSeconds?: number;
  videoCallUsedSeconds?: number;
  videoCallTotal?: number;
}

// 초 단위 통화량을 "MM분 SS초" 형태로 변환한다.
function toMinSecLabel(totalSeconds: number | undefined) {
  if (totalSeconds == null) return null;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}분 ${String(seconds).padStart(2, '0')}초`;
}

// 사용량 / 총량(분)을 기준으로 진행률을 계산한다.
function toPercent(
  usedSeconds: number | undefined,
  totalMinutes: number | undefined,
) {
  if (usedSeconds == null || !totalMinutes) return 0;
  return Math.min(100, (usedSeconds / 60 / totalMinutes) * 100);
}

export default function MyPageCallSection({
  callTotal,
  callPercent,
  callUsedSeconds,
  videoCallUsedSeconds,
  videoCallTotal,
}: MyPageCallSectionProps) {
  const callUsedLabel = toMinSecLabel(callUsedSeconds);
  const videoCallUsedLabel = toMinSecLabel(videoCallUsedSeconds);
  const videoCallPercent = toPercent(videoCallUsedSeconds, videoCallTotal);

  return (
    <Card radius="none" gap="16" className="px-4 py-5">
      <div className="text-bold-16-140">통화</div>

      <UsageProgressRow
        label="유무선 통화"
        value={callUsedLabel ?? '-'}
        total={callTotal != null ? `${callTotal}분` : '-'}
        percent={callPercent}
      />
      {videoCallTotal != null && (
        <UsageProgressRow
          label="영상 & 부가 통화"
          value={videoCallUsedLabel ?? '-'}
          total={`${videoCallTotal}분`}
          percent={videoCallPercent}
        />
      )}
    </Card>
  );
}
