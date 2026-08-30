import { supabase } from '@/shared/lib/supabaseClient';

// 로그인한 사용자의 current_plans를 갱신한다. user_id가 PK라
// upsert로 최초 등록/기존 요금제 변경을 모두 처리한다.
export async function postChangePlan(planId: number): Promise<void> {
  if (Number.isNaN(planId)) {
    throw new Error('변경할 요금제의 ID가 올바르지 않습니다.');
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('로그인이 필요합니다.');
  }

  const { error } = await supabase.from('current_plans').upsert(
    {
      user_id: userData.user.id,
      plan_id: planId,
      started_at: new Date().toISOString().slice(0, 10),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    throw new Error(`요금제 변경 실패: ${error.message}`);
  }
}
