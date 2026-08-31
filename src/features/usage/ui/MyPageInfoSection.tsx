import dayjs from 'dayjs';

import { Card, InfoRow } from '@/shared';

interface MyPageInfoSectionProps {
  planName: string;
  updatedAt?: string;
  createdAt?: string;
}

export default function MyPageInfoSection({
  planName,
  updatedAt,
  createdAt,
}: MyPageInfoSectionProps) {
  return (
    <Card radius="none" gap="16" className="px-4 py-5">
      <div className="text-bold-16-140">가입 정보</div>

      <div className="flex flex-col gap-2">
        <InfoRow label="요금제" value={planName} highlight />
        <InfoRow
          label="요금제 신청일"
          value={updatedAt ? dayjs(updatedAt).format('YYYY-MM-DD') : '-'}
        />
        <InfoRow
          label="가입일"
          value={createdAt ? dayjs(createdAt).format('YYYY-MM-DD') : '-'}
        />
      </div>
    </Card>
  );
}
