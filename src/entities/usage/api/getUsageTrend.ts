import dayjs from 'dayjs';

import { supabase } from '@/shared/lib/supabaseClient';

import { toUsageMonthlyRow, type UsageMonthlyRow } from './getUsage';

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

  return ((data ?? []) as Record<string, unknown>[]).map(toUsageMonthlyRow);
}
