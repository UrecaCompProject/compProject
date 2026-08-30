import dayjs from 'dayjs';

import { supabase } from '@/shared/lib/supabaseClient';

import type { UsageMonthlyRow } from './getUsage';

// userId의 과거 사용량(usage_monthly) 추이를 조회한다. 이번 달은 아직 집계 중이라 제외한다.
// usage_monthly는 user_id = auth.uid() 소유자 전용 RLS라 인증된 클라이언트로만 조회 가능.
export async function getUsageTrend(
  userId: string,
): Promise<UsageMonthlyRow[]> {
  const currentYearMonth = dayjs().format('YYYY-MM');

  const { data, error } = await supabase
    .from('usage_monthly')
    .select('*')
    .eq('user_id', userId)
    .lt('year_month', currentYearMonth)
    .order('year_month', { ascending: true });

  if (error) {
    throw new Error(`사용량 추이 조회 실패: ${error.message}`);
  }

  return (data ?? []) as UsageMonthlyRow[];
}
