import dayjs from 'dayjs';

import { Button, Card, InfoRow } from '@/shared';

interface MyPageInfoSectionProps {
  planName: string;
  updatedAt?: string;
  createdAt?: string;
  hasPlan?: boolean;
  onRequestPlanRecommend?: () => void;
}

export default function MyPageInfoSection({
  planName,
  updatedAt,
  createdAt,
  hasPlan = true,
  onRequestPlanRecommend,
}: MyPageInfoSectionProps) {
  return (
    <Card radius="none" gap="16" className="px-4 py-5">
      <div className="text-bold-16-140">가입 정보</div>

      {hasPlan ? (
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
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-medium-14-140 text-fg-secondary">
            현재 요금제가 없어요! 같이 요금제를 찾아볼까요?
          </p>
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={onRequestPlanRecommend}
          >
            요금제 추천받기
          </Button>
          <InfoRow
            label="가입일"
            value={createdAt ? dayjs(createdAt).format('YYYY-MM-DD') : '-'}
          />
        </div>
      )}
    </Card>
  );
}
