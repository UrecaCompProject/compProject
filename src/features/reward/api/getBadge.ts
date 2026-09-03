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

// user_badges의 balance/total_earned에 amount만큼 더하고 updated_at을 갱신한다.
// (게임 보상, 출석 보상 등 배지 적립원마다 badgeId를 다르게 넘겨 공통으로 사용)
export async function addBadgeBalance(
  userId: string,
  badgeId: string,
  amount: number,
): Promise<void> {
  if (amount <= 0) return;

  const { data: existing, error: selectError } = await supabase
    .from('user_badges')
    .select('balance, total_earned')
    .eq('user_id', userId)
    .eq('badge_id', badgeId)
    .maybeSingle();

  if (selectError) {
    throw new Error(`배지 잔액 조회 실패: ${selectError.message}`);
  }

  const { error: upsertError } = await supabase.from('user_badges').upsert(
    {
      user_id: userId,
      badge_id: badgeId,
      balance: (existing?.balance ?? 0) + amount,
      total_earned: (existing?.total_earned ?? 0) + amount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,badge_id' },
  );

  if (upsertError) {
    throw new Error(`배지 잔액 적립 실패: ${upsertError.message}`);
  }
}
