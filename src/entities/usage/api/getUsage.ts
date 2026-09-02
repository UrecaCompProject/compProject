import dayjs from 'dayjs';

import { supabase } from '@/shared/lib/supabaseClient';

export type UsageMonthlyRow = {
  id: string;
  user_id: string;
  year_month: string;
  data_used_gb: number;
  callUsedSeconds: number;
  sms_used_count: number;
  created_at: string;
  updated_at: string;
};

// Supabase의 call_used_min 컬럼은 실제로 초(second) 단위를 저장한다.
// 도메인 타입에서는 단위가 명확하도록 callUsedSeconds로 매핑한다.
export function toUsageMonthlyRow(
  raw: Record<string, unknown>,
): UsageMonthlyRow {
  const { call_used_min, ...rest } = raw;
  return {
    ...(rest as Omit<UsageMonthlyRow, 'callUsedSeconds'>),
    callUsedSeconds: Number(call_used_min),
  };
}

export async function getUsage(userId: string): Promise<UsageMonthlyRow[]> {
  const currentYearMonth = dayjs().format('YYYY-MM');

  const { data, error } = await supabase
    .from('usage_monthly')
    .select('*')
    .eq('user_id', userId)
    .eq('year_month', currentYearMonth)
    .order('year_month', { ascending: false });

  if (error) {
    throw new Error(`사용량 조회 실패: ${error.message}`);
  }

  console.log(data);

  return ((data ?? []) as Record<string, unknown>[]).map(toUsageMonthlyRow);
}
