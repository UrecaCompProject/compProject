import type { RecommendedPlan, ReportOutput } from '@/shared/lib/aiConsult';
import { supabase, supabaseAnon } from '@/shared/lib/supabaseClient';

// AI 상담 레포트를 consultation_reports 및 report_recommendations 테이블에 저장합니다.
export async function saveReport(
  report: ReportOutput,
  recommendations: RecommendedPlan[] = [],
) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('로그인이 필요합니다.');
  }

  const { data: reportData, error: reportError } = await supabase
    .from('consultation_reports')
    .insert({
      user_id: userData.user.id,
      summary_title: `${report.currentPlan} 요금제 추천 레포트`,
      summary: report.summary,
      analysis_input: {
        usageType: report.usageType,
        currentPlan: report.currentPlan,
        recommendedPlans: report.recommendedPlans,
        monthlySavingAmount: report.monthlySavingAmount,
        recommendationReason: report.recommendationReason,
        importantConditions: report.importantConditions,
        qaPairs: report.qaPairs,
      },
      total_savings: report.monthlySavingAmount,
    })
    .select('id')
    .single();

  if (reportError) {
    throw new Error(`레포트 저장 실패: ${reportError.message}`);
  }

  const reportId = reportData.id;

  // 요금제 이름을 plan_id로 변환. 원본 추천 배열이 있으면 그 plan_id를 우선 사용
  const planNames = report.recommendedPlans.filter(Boolean);
  if (planNames.length > 0) {
    const planIdByName = new Map(
      recommendations.map((p) => [p.planName, p.planId]),
    );
    const missingNames = planNames.filter((name) => !planIdByName.has(name));
    let dbPlanIdByName = new Map<string, number>();

    if (missingNames.length > 0) {
      const { data: plans, error: plansError } = await supabaseAnon
        .from('plans')
        .select('id, name')
        .in('name', missingNames);
      if (plansError) {
        throw new Error(`요금제 조회 실패: ${plansError.message}`);
      }
      dbPlanIdByName = new Map(
        (plans ?? []).map((plan) => [plan.name, plan.id]),
      );
    }

    const recommendationsToSave = planNames
      .map((name, index) => {
        const source = recommendations.find((p) => p.planName === name);
        const planId =
          source?.planId ?? planIdByName.get(name) ?? dbPlanIdByName.get(name);
        if (!planId) return null;
        return {
          report_id: reportId,
          plan_id: Number(planId),
          reason: source?.reason ?? report.recommendationReason,
          savings: source?.savingAmount ?? report.monthlySavingAmount,
          sort_order: index,
        };
      })
      .filter(
        (
          recommendation,
        ): recommendation is NonNullable<typeof recommendation> =>
          !!recommendation,
      );

    if (recommendationsToSave.length > 0) {
      const { error: recError } = await supabase
        .from('report_recommendations')
        .insert(recommendationsToSave);

      if (recError) {
        throw new Error(`추천 저장 실패: ${recError.message}`);
      }
    }
  }

  return reportId;
}
