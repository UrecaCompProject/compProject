import type { RecommendedPlan } from '@/shared/lib/aiConsult';
import { supabase } from '@/shared/lib/supabaseClient';

import { toRecommendedPlan } from '../lib/toRecommendedPlan';

import type { PlanRow } from '../model/plan';

// 로그인한 사용자의 현재 요금제 원본 row(current_plans → plans)를 조회합니다.
// data_amount_gb 등 DB 원본 수치가 필요한 화면(MyPage 사용량 등)은 이 함수를 쓴다.
export async function getCurrentPlanRow(): Promise<PlanRow | null> {
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
  return plan ?? null;
}

// 로그인한 사용자의 현재 요금제를 AI 상담/비교 화면에서 쓰는 RecommendedPlan 형태로 조회합니다.
export async function getCurrentPlan(): Promise<RecommendedPlan | null> {
  const plan = await getCurrentPlanRow();
  return plan ? toRecommendedPlan(plan) : null;
}
