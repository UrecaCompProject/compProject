import type { RecommendedPlan } from '@/shared/lib/aiConsult';
import { supabaseAnon } from '@/shared/lib/supabaseClient';

import { toRecommendedPlan } from '../lib/toRecommendedPlan';

// 요금제 카탈로그는 공개 데이터이므로, 사용자 세션 상태와 무관하게
// anon key로 조회해 잘못된 토큰/만료 세션으로 403이 뜨는 걸 막는다.
export async function getPlanCatalog(): Promise<RecommendedPlan[]> {
  const { data, error } = await supabaseAnon
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`요금제 목록 조회 실패: ${error.message}`);
  }

  return (data ?? []).map((row) => toRecommendedPlan(row));
}
