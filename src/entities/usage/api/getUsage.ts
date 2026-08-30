import dayjs from 'dayjs';

import { supabase } from '@/shared/lib/supabaseClient';

export type UsageMonthlyRow = {
  id: string;
  user_id: string;
  year_month: string;
  data_used_gb: number;
  call_used_min: number;
  sms_used_count: number;
  created_at: string;
  updated_at: string;
};

// userId의 이번 달 사용량(usage_monthly)을 조회한다.
// usage_monthly는 user_id = auth.uid() 소유자 전용 RLS라 인증된 클라이언트로만 조회 가능.
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

  return (data ?? []) as UsageMonthlyRow[];
}
