// @ts-nocheck
// JSON 파일로 관리되는 샘플 요금제 데이터 로더.
import plansJson from '../data/plans.json' with { type: 'json' };

export interface Plan {
  id: number;
  name: string;
  category: string;
  target_age: string;
  data_tier: string;
  monthly_fee: number;
  data: string;
  data_speed_after: string;
  voice: string;
  message: string;
  share_data: string;
  tethering: string;
  benefits: string[];
  notes: string;
}

let cachedPlans: Plan[] | null = null;

export async function loadPlans(): Promise<Plan[]> {
  if (cachedPlans) return cachedPlans;
  cachedPlans = (plansJson as { plans: Plan[] }).plans;
  return cachedPlans;
}
