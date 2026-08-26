import type { RecommendedPlan } from '@/lib/aiConsult';
import { supabase } from '@/lib/supabaseClient';

import { toRecommendedPlan, type PlanRow } from './getPlanCatalog';

// 로그인한 사용자의 현재 요금제(current_plans)와 요금제 상세(plans)를 조회합니다.
export async function getCurrentPlan(): Promise<RecommendedPlan | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('로그인이 필요합니다.');
  }

  const { data, error } = await supabase
    .from('current_plans')
    .select('plan_id, plans(*)')
    .single();

  if (error) {
    // 현재 요금제가 등록되지 않은 경우 null 반환
    if (error.code === 'PGRST116') return null;
    throw new Error(`현재 요금제 조회 실패: ${error.message}`);
  }

  if (!data || !data.plans) return null;

  const planOrArray = data.plans as unknown as PlanRow | PlanRow[] | null;
  const plan = Array.isArray(planOrArray) ? planOrArray[0] : planOrArray;
  if (!plan) return null;

  return toRecommendedPlan(plan);
}
