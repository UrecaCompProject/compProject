import type { RecommendedPlan } from '@/lib/aiConsult';
import { supabaseAnon } from '@/lib/supabaseClient';

type PlanRow = {
  id: number;
  name: string;
  carrier: string;
  category: string;
  target_age: string;
  data_tier: string;
  monthly_fee: number;
  data: string;
  data_amount_gb: number;
  data_speed_after: string;
  voice: string;
  call_amount_min: number;
  message: string;
  sms_amount: number;
  share_data: string;
  tethering: string;
  notes: string;
  benefits: string[];
  ott_benefits: string[];
  add_ons: string[];
  contract_period_months: number | null;
  is_active: boolean;
  sort_order: number;
};

function toRecommendedPlan(row: PlanRow): RecommendedPlan {
  return {
    planId: String(row.id),
    planName: row.name,
    category: row.category,
    targetAge: row.target_age,
    monthlyFee: row.monthly_fee,
    data: row.data,
    dataSpeedAfter: row.data_speed_after,
    voice: row.voice,
    message: row.message,
    shareData: row.share_data,
    tethering: row.tethering,
    notes: row.notes,
    benefits: row.benefits ?? [],
    reason: row.notes ?? '',
    savingAmount: 0,
  };
}

export async function getPlanCatalog(): Promise<RecommendedPlan[]> {
  // 요금제 카탈로그는 공개 데이터이므로, 사용자 세션 상태와 무관하게
  // anon key로 조회해 잘못된 토큰/만료 세션으로 403이 뜨는 걸 막는다.
  const { data, error } = await supabaseAnon
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`요금제 목록 조회 실패: ${error.message}`);
  }

  return (data ?? []).map((row) => toRecommendedPlan(row as PlanRow));
}
