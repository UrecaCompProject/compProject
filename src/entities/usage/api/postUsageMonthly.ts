import dayjs from 'dayjs';

import { supabase } from '@/shared/lib/supabaseClient';

// 요금제 가입/변경이 성공하면 이번 달 usage_monthly row를 0 사용량으로 시작해 둔다.
// 이미 이번 달 row가 있으면(같은 달 재가입/재변경 등) 기존 사용량을 덮어쓰지 않고 그대로 둔다.
export async function ensureCurrentMonthUsage(): Promise<void> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('로그인이 필요합니다.');
  }
  const userId = userData.user.id;
  const yearMonth = dayjs().format('YYYY-MM');

  const { data: existing, error: selectError } = await supabase
    .from('usage_monthly')
    .select('id')
    .eq('user_id', userId)
    .eq('year_month', yearMonth)
    .maybeSingle();

  if (selectError) {
    throw new Error(`사용량 조회 실패: ${selectError.message}`);
  }
  if (existing) return;

  const { error: insertError } = await supabase.from('usage_monthly').insert({
    user_id: userId,
    year_month: yearMonth,
    data_used_gb: 0,
    call_used_min: 0,
    sms_used_count: 0,
  });

  if (insertError) {
    throw new Error(`사용량 초기화 실패: ${insertError.message}`);
  }
}
