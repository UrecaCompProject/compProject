import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

import { useCurrentPlan } from '@/entities/plan';
import { useAuth, useIsLoggedIn } from '@/entities/user';

import { getUsage } from '../api/getUsage';
import { getUsageTrend } from '../api/getUsageTrend';

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

// MyPage에서 필요한 현재 요금제·이번 달 사용량·사용량 추이를 조회하고,
// 잔여량/진행률/혜택 매칭까지 계산해서 반환하는 훅.
export function useUsage() {
  const { user } = useAuth();
  const isLoggedIn = useIsLoggedIn();

  const { data: currentPlan } = useCurrentPlan(isLoggedIn);

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
  // call_used_min은 실제로 초 단위이므로 분 단계로 변환해 잔여량을 계산한다.
  const callUsedSeconds = latestUsage?.callUsedSeconds ?? 0;
  const callUsedMinutes = callUsedSeconds / 60;

  const callRemaining = toRemaining(
    callUsedMinutes,
    currentPlan?.callAmountMin,
  );
  const smsRemaining = toRemaining(
    latestUsage?.sms_used_count,
    currentPlan?.smsAmount,
  );

  const dataPercent = toPercent(dataRemaining, currentPlan?.dataAmountGb);
  const callPercent = toPercent(callRemaining, currentPlan?.callAmountMin);
  const smsPercent = toPercent(smsRemaining, currentPlan?.smsAmount);

  // console.log(dataPercent, callPercent, smsPercent);

  const gbBenefit = currentPlan?.benefits?.find((benefit) =>
    benefit.includes('GB→'),
  );

  return {
    currentPlan,
    trendData,
    billingPeriodStart,
    billingPeriodEnd,
    daysUntilPeriodEnd,
    dataRemaining,
    dataPercent,
    callRemaining,
    callPercent,
    callUsedSeconds,
    smsRemaining,
    smsPercent,
    gbBenefit,
  };
}
