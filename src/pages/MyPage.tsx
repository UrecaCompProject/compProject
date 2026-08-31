import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { BadgePercent } from 'lucide-react';

import { useCurrentPlan } from '@/entities/plan';
import { getUsage, getUsageTrend } from '@/entities/usage';
import { useAuth, useIsLoggedIn } from '@/entities/user';
import { maskPhone } from '@/features/auth/lib/signup';
import { UsageProgressRow, UsageTrendSection } from '@/features/usage';
import { Card, IconListItem, InfoRow, Line } from '@/shared';

// UsageProgressRow는 "남은 양"을 보여주므로 총량에서 사용량을 뺀 잔여량을 계산한다.
function toRemaining(used: number | undefined, total: number | undefined) {
  if (used == null || total == null) return null;
  return Math.max(0, total - used);
}

// 잔여량 기준 진행률 — 잔여량/총량 정보가 없으면 0%
function toPercent(remaining: number | null, total: number | undefined) {
  if (remaining == null || !total) return 0;
  return Math.min(100, (remaining / total) * 100);
}

export default function MyPage() {
  const { user } = useAuth();
  const isLoggedIn = useIsLoggedIn();

  const { data: currentPlan } = useCurrentPlan(isLoggedIn);
  console.log(currentPlan, user);

  const { data: usageRows } = useQuery({
    queryKey: ['usage', user?.id],
    queryFn: () => getUsage(user!.id),
    enabled: isLoggedIn && !!user,
  });
  // usage_monthly는 year_month 내림차순 정렬이라 첫 번째 행이 최신 달
  const latestUsage = usageRows?.[0];

  const { data: trendRows } = useQuery({
    queryKey: ['usage', 'trend', user?.id],
    queryFn: () => getUsageTrend(user!.id),
    enabled: isLoggedIn && !!user,
  });
  // year_month("YYYY-MM")의 월 부분만 뽑아 "N월" 라벨로 변환
  const trendData = (trendRows ?? []).map((row) => ({
    month: `${Number(row.year_month.split('-')[1])}월`,
    usage: row.data_used_gb,
  }));

  const today = dayjs();
  const billingPeriodStart = today.startOf('month');
  const billingPeriodEnd = today.endOf('month');
  const daysUntilPeriodEnd = billingPeriodEnd.diff(today, 'day');

  const dataRemaining = toRemaining(
    latestUsage?.data_used_gb,
    currentPlan?.dataAmountGb,
  );
  const callRemaining = toRemaining(
    latestUsage?.call_used_min,
    currentPlan?.callAmountMin,
  );
  const smsRemaining = toRemaining(
    latestUsage?.sms_used_count,
    currentPlan?.smsAmount,
  );

  const gbBenefit = currentPlan?.benefits?.find((benefit) =>
    benefit.includes('GB→'),
  );

  return (
    <div className="bg-surface-page">
      <div className="flex flex-col px-4 py-3">
        <div className="leading-[170%] text-fg-tertiary text-[14px] ">
          <span className="text-medium">모바일</span>
          <span className="ml-3 text-regular">
            {maskPhone(user?.user_metadata?.phone ?? '')}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card radius="none" gap="16" className="px-4 py-5">
          <div className="text-bold-16-140">가입 정보</div>

          <div className="flex flex-col gap-2">
            <InfoRow
              label="요금제"
              value={currentPlan?.planName ?? '-'}
              highlight
            />
            {/* <InfoRow
              label="모바일 기기"
              value="IPhone 14 Pro_128(A2890-128)"
              highlight
            /> */}
            <InfoRow
              label="요금제 신청일"
              // 현재 user 정보가 바뀔 일이 요금제 바꾸는 것 밖에 없어서 user.updated_at으로 둠
              value={dayjs(user?.updated_at).format('YYYY-MM-DD')}
            />
            <InfoRow
              label="가입일"
              value={
                user?.created_at
                  ? dayjs(user.created_at).format('YYYY-MM-DD')
                  : '-'
              }
            />
          </div>
        </Card>

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
              월 {currentPlan?.monthlyFee?.toLocaleString() ?? '-'}원
            </div>
          </div>
        </Card>

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
            value={
              dataRemaining != null ? `${dataRemaining.toFixed(2)}GB` : '-'
            }
            total={
              currentPlan?.dataAmountGb != null
                ? `${currentPlan.dataAmountGb.toFixed(2)}GB`
                : '-'
            }
            percent={toPercent(dataRemaining, currentPlan?.dataAmountGb)}
          />
          <UsageProgressRow
            label={`${currentPlan?.dataSpeedAfter ?? ''} 속도 데이터`}
            value="무제한"
            percent={100}
          />
        </Card>

        <Card radius="none" gap="16" className="px-4 py-5">
          <div className="text-bold-16-140">통화</div>

          <UsageProgressRow
            label="유무선 통화"
            value={callRemaining != null ? `${callRemaining}분` : '-'}
            total={
              currentPlan?.callAmountMin != null
                ? `${currentPlan.callAmountMin}분`
                : '-'
            }
            percent={toPercent(callRemaining, currentPlan?.callAmountMin)}
          />
          <UsageProgressRow
            label="영상 & 부가 통화"
            value="300분"
            total="300분"
            percent={100 - (0 / 300) * 100}
          />
        </Card>

        <Card radius="none" gap="16" className="px-4 py-5">
          <div className="text-bold-16-140">문자</div>

          <UsageProgressRow
            label="메세지"
            value={smsRemaining != null ? `${smsRemaining}건` : '-'}
            total={
              currentPlan?.smsAmount != null
                ? `${currentPlan.smsAmount}건`
                : '-'
            }
            percent={toPercent(smsRemaining, currentPlan?.smsAmount)}
          />
        </Card>

        <UsageTrendSection data={trendData} />
      </div>
    </div>
  );
}
