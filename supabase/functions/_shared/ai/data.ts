// JSON 파일로 관리되는 샘플 요금제 데이터 로더.
// pgvector 기반 RAG로 마이그레이션되기 전까지는 단순 JSON 삽입 방식을 사용합니다.
const plansPath = new URL('../data/plans.json', import.meta.url);

export interface Plan {
  id: string;
  name: string;
  dataGB: number;
  voiceMin: number;
  smsCount: number;
  price: number;
  ott?: string[];
  tags?: string[];
}

let cachedPlans: Plan[] | null = null;

export async function loadPlans(): Promise<Plan[]> {
  if (cachedPlans) return cachedPlans;
  const text = await Deno.readTextFile(plansPath);
  cachedPlans = JSON.parse(text) as Plan[];
  return cachedPlans;
}
