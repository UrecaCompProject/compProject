import { toRecommendedPlan } from '@/entities/plan';
import type { PlanRow, RecommendedPlan } from '@/entities/plan';
import { supabase, supabaseAnon } from '@/shared/lib/supabaseClient';

export type ReportAnalysisInput = {
  usageType: string;
  currentPlan: string;
  recommendedPlans: string[];
  importantConditions: string[];
  monthlySavingAmount: number;
  recommendationReason: string;
};

export type ReportRow = {
  id: string;
  user_id: string;
  summary_title: string | null;
  summary: string;
  analysis_input: ReportAnalysisInput;
  current_plan_id: number | null;
  total_savings: number;
  created_at: string;
  updated_at: string;
  // analysis_input.recommendedPlans(요금제 이름 배열)를 plans 테이블과 join해 채운다.
  recommendedPlanDetails: RecommendedPlan[];
};

type ReportRowBase = Omit<ReportRow, 'recommendedPlanDetails'>;

// userId가 만든 레포트 전체 목록을 조회한다. 상세는 여기서 받은 배열의
// analysis_input을 그대로 props로 넘겨서 보여주고, 별도로 재조회하지 않는다.
// consultation_reports는 user_id = auth.uid() 소유자 전용 RLS라 anon 클라이언트로는 조회 불가.
export async function getReport(userId: string): Promise<ReportRow[]> {
  const { data, error } = await supabase
    .from('consultation_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`레포트 조회 실패: ${error.message}`);
  }

  const reports = (data ?? []) as ReportRowBase[];

  const planNames = [
    ...new Set(
      reports.flatMap((report) => report.analysis_input.recommendedPlans),
    ),
  ].filter(Boolean);

  if (planNames.length === 0) {
    return reports.map((report) => ({ ...report, recommendedPlanDetails: [] }));
  }

  // plans는 공개 데이터라 anon 클라이언트로 조회 (getPlanCatalog와 동일한 이유).
  const { data: plans, error: plansError } = await supabaseAnon
    .from('plans')
    .select('*')
    .in('name', planNames);

  if (plansError) {
    throw new Error(`요금제 조회 실패: ${plansError.message}`);
  }

  const planByName = new Map(
    ((plans ?? []) as PlanRow[]).map((plan) => [plan.name, plan]),
  );

  return reports.map((report) => ({
    ...report,
    recommendedPlanDetails: report.analysis_input.recommendedPlans
      .map((name) => planByName.get(name))
      .filter((plan): plan is PlanRow => !!plan)
      .map(toRecommendedPlan),
  }));
}
