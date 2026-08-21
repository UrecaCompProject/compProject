// @ts-nocheck
// JSON 파일로 관리되는 샘플 요금제 데이터 로더.
import plansJson from '../data/plans.json' with { type: 'json' };
import planEmbeddingsJson from '../data/plan_embeddings.json' with { type: 'json' };

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

export interface PlanEmbedding {
  id: string;
  embedding: number[];
}

let cachedPlans: Plan[] | null = null;
let cachedEmbeddings: PlanEmbedding[] | null = null;

export async function loadPlans(): Promise<Plan[]> {
  if (cachedPlans) return cachedPlans;
  cachedPlans = (plansJson as { plans: Plan[] }).plans;
  return cachedPlans;
}

export async function loadPlanEmbeddings(): Promise<PlanEmbedding[]> {
  if (cachedEmbeddings) return cachedEmbeddings;
  cachedEmbeddings = planEmbeddingsJson as PlanEmbedding[];
  return cachedEmbeddings;
}
