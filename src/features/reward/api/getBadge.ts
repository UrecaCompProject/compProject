import { supabase } from '@/shared/lib/supabaseClient';

// userId가 보유한 모든 배지 종류(user_badges)의 balance 합계를 조회한다.
export async function getBadgeBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_badges')
    .select('balance')
    .eq('user_id', userId);

  if (error) {
    throw new Error(`배지 조회 실패: ${error.message}`);
  }

  return (data ?? []).reduce((sum, row) => sum + row.balance, 0);
}
