import { toRecommendedPlan } from '@/entities/plan';
import type { PlanRow, RecommendedPlan } from '@/entities/plan';
import type {
  CompareResult,
  RecommendedPlanGroup,
} from '@/shared/lib/aiConsult';
import { supabase, supabaseAnon } from '@/shared/lib/supabaseClient';

export type ReportQAPair = {
  question: string;
  answer: string;
};

export type ReportAnalysisInput = {
  usageType: string;
  currentPlan: string;
  recommendedPlans: string[];
  importantConditions: string[];
  qaPairs: ReportQAPair[];
  comparedPlan: CompareResult | null;
  changedPlan: RecommendedPlan | null;
  // 라운드(target/detail) 구분이 보존된 원본 — 이 필드가 없는 옛 레포트는
  // recommendedPlanDetails(관계형 조인, 라운드 구분 없음)로만 표시한다.
  recommendedPlanGroups?: RecommendedPlanGroup[];
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

export type ReportRecommendationRow = {
  report_id: string;
  plan_id: number;
  reason: string | null;
  savings: number | null;
  sort_order: number;
};

export function mapReportRecommendations(
  recommendations: ReportRecommendationRow[],
  plans: PlanRow[],
): Map<string, RecommendedPlan[]> {
  const planById = new Map(plans.map((plan) => [plan.id, plan]));
  const plansByReport = new Map<string, RecommendedPlan[]>();

  for (const recommendation of recommendations) {
    const plan = planById.get(recommendation.plan_id);
    if (!plan) continue;

    const list = plansByReport.get(recommendation.report_id) ?? [];
    list.push({
      ...toRecommendedPlan(plan),
      reason: recommendation.reason ?? plan.name,
      savingAmount: recommendation.savings ?? 0,
      planId: String(plan.id),
    });
    plansByReport.set(recommendation.report_id, list);
  }

  return plansByReport;
}

// 저장된 추천 관계를 plan_id로 직접 조회하고, 기존 레포트는 이름으로 보완한다.
export async function getReport(userId: string): Promise<ReportRow[]> {
  const { data, error } = await supabase
    .from('consultation_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`리포트 조회 실패: ${error.message}`);

  const reports = (data ?? []) as ReportRowBase[];
  if (reports.length === 0) return [];

  const reportIds = reports.map((report) => report.id);
  const { data: recommendations, error: recommendationsError } = await supabase
    .from('report_recommendations')
    .select('report_id, plan_id, reason, savings, sort_order')
    .in('report_id', reportIds)
    .order('sort_order', { ascending: true });

  if (recommendationsError) {
    throw new Error(`추천 조회 실패: ${recommendationsError.message}`);
  }

  const recommendationRows = (recommendations ??
    []) as ReportRecommendationRow[];
  const names = reports.flatMap(
    (report) => report.analysis_input?.recommendedPlans ?? [],
  );
  const ids = recommendationRows.map(
    (recommendation) => recommendation.plan_id,
  );
  if (ids.length === 0 && names.length === 0) {
    return reports.map((report) => ({ ...report, recommendedPlanDetails: [] }));
  }

  const planQuery = supabaseAnon.from('plans').select('*');
  const { data: plans, error: plansError } =
    ids.length > 0
      ? await planQuery.in('id', ids)
      : await planQuery.in('name', [...new Set(names)]);

  if (plansError) throw new Error(`요금제 조회 실패: ${plansError.message}`);

  const planRows = (plans ?? []) as PlanRow[];

  // 기존 데이터처럼 추천 관계가 없고 이름만 저장된 레포트도 카드로 복원한다.
  if (names.length > 0 && ids.length > 0) {
    const missingNames = [
      ...new Set(
        names.filter((name) => !planRows.some((plan) => plan.name === name)),
      ),
    ];
    if (missingNames.length > 0) {
      const { data: namedPlans, error: namedPlansError } = await supabaseAnon
        .from('plans')
        .select('*')
        .in('name', missingNames);
      if (namedPlansError) {
        throw new Error(`요금제 이름 조회 실패: ${namedPlansError.message}`);
      }
      planRows.push(...((namedPlans ?? []) as PlanRow[]));
    }
  }
  const plansByReport = mapReportRecommendations(recommendationRows, planRows);
  const planByName = new Map(planRows.map((plan) => [plan.name, plan]));

  return reports.map((report) => {
    const stored = plansByReport.get(report.id) ?? [];
    if (stored.length > 0) return { ...report, recommendedPlanDetails: stored };

    const fallback = (report.analysis_input?.recommendedPlans ?? [])
      .map((name) => planByName.get(name))
      .filter((plan): plan is PlanRow => !!plan)
      .map(toRecommendedPlan);
    return { ...report, recommendedPlanDetails: fallback };
  });
}
