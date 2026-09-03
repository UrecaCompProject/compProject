// RecommendedPlan은 shared/lib/aiConsult에 정의된 비즈니스 타입을 re-export
// FSD 규칙상 entities는 shared에 의존할 수 있으므로 이 방향은 유효
export type { RecommendedPlan } from '@/shared/lib/aiConsult';

// Supabase plans 테이블 로우 타입 — getPlanCatalog, getCurrentPlan, getPlans에서 공통 사용
export type PlanRow = {
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

// shared/types/plan.ts에서 이관된 기본 Plan 타입
export interface Plan {
  id: string;
  name: string;
  category: string;
  targetAge: string;
  dataTier: string;
  monthlyFee: number;
  data: string;
  dataSpeedAfter: string;
  voice: string;
  message: string;
  shareData: string;
  tethering: string;
  benefits: string[];
  notes?: string;
}
