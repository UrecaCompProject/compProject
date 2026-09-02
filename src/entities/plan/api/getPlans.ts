import { supabaseAnon } from '@/shared/lib/supabaseClient';
import type { PlanDetailItem } from '@/shared/types/plan';

type PlanRow = {
  id: number;
  name: string;
  category: string;
  target_age: string;
  data_tier: string;
  monthly_fee: number;
  data: string;
  data_speed_after: string;
  voice: string;
  call_amount_min: number | null;
  message: string;
  sms_amount: number | null;
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

function toPlanDetailItem(row: PlanRow): PlanDetailItem {
  return {
    id: String(row.id),
    name: row.name,
    category: row.category,
    targetAge: row.target_age,
    dataTier: row.data_tier,
    monthlyFee: row.monthly_fee,
    data: row.data,
    dataSpeedAfter: row.data_speed_after,
    voice: row.voice,
    callAmountMin: row.call_amount_min,
    message: row.message,
    smsAmount: row.sms_amount,
    shareData: row.share_data,
    tethering: row.tethering,
    notes: row.notes,
    benefits: row.benefits ?? [],
    ottBenefits: row.ott_benefits ?? [],
    addOns: row.add_ons ?? [],
    contractPeriodMonths: row.contract_period_months,
  };
}

// 요금제 조회(목록/상세/필터) 화면 전용 조회 함수.
// plan-catalog의 getPlanCatalog()와 같은 공개 plans 테이블을 보되,
// AI 추천용 RecommendedPlan 대신 상세 화면에 필요한 필드를 모두 담은 PlanDetailItem을 반환한다.
export async function getPlans(): Promise<PlanDetailItem[]> {
  const { data, error } = await supabaseAnon
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw new Error(`요금제 목록 조회 실패: ${error.message}`);
  }

  return (data ?? []).map((row) => toPlanDetailItem(row as PlanRow));
}
