import { supabase } from '@/shared/lib/supabaseClient';

// current_plans.user_id가 public.users(id)를 참조하므로,
// auth.users에 사용자가 있어도 public.users에 프로필 row가 없으면
// 외래키 제약 위반으로 upsert가 실패한다. 트리거(handle_new_user)가
// 동기화를 담당하지만 DB에 적용되지 않은 경우를 방어하기 위해
// upsert 전에 public.users에 row가 존재하는지 확인하고 없으면 생성한다.
async function ensureUserProfile(
  userId: string,
  email: string | undefined,
  phone: string | undefined,
  name: string | undefined,
): Promise<void> {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (existing) return;

  await supabase.from('users').upsert(
    {
      id: userId,
      email: email ?? null,
      phone: phone ?? null,
      nickname: name ?? '사용자',
      age_group: '미제공',
    },
    { onConflict: 'id' },
  );
}

// 로그인한 사용자의 current_plans를 갱신한다. user_id가 PK라
// upsert로 최초 등록/기존 요금제 변경을 모두 처리한다.
export async function postChangePlan(planId: number): Promise<void> {
  if (Number.isNaN(planId)) {
    throw new Error(
      '요금제 가입 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
    );
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('로그인이 필요합니다.');
  }

  const user = userData.user;
  await ensureUserProfile(
    user.id,
    user.email,
    user.user_metadata?.phone,
    user.user_metadata?.name,
  );

  const { error } = await supabase.from('current_plans').upsert(
    {
      user_id: user.id,
      plan_id: planId,
      started_at: new Date().toISOString().slice(0, 10),
    },
    { onConflict: 'user_id' },
  );

  if (error) {
    throw new Error(
      '요금제 가입 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
    );
  }
}
