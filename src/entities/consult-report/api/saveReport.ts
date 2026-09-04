import type { ReportOutput } from '@/shared/lib/aiConsult';
import { supabase } from '@/shared/lib/supabaseClient';

// AI 상담 레포트를 consultation_reports 및 report_recommendations 테이블에 저장합니다.
// recommendedPlans는 "요금제 추천받기" 요청마다 생긴 라운드(target/detail/plans)의
// 배열이라, report_recommendations(라운드 구분 없는 플랫 테이블)에는 모든 라운드의
// 요금제를 순서대로 풀어서 저장한다. 라운드 구분(target/detail)은 analysis_input에
// recommendedPlanGroups로 그대로 보존한다.
export async function saveReport(report: ReportOutput) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error('로그인이 필요합니다.');
  }

  const flattenedPlans = report.recommendedPlans.flatMap(
    (group) => group.plans,
  );

  const { data: reportData, error: reportError } = await supabase
    .from('consultation_reports')
    .insert({
      user_id: userData.user.id,
      summary_title:
        report.otherNotes.title || `${report.currentPlan} 요금제 추천 리포트`,
      summary: report.otherNotes.summary,
      analysis_input: {
        currentPlan: report.currentPlan,
        usageType: report.otherNotes.usageType,
        importantConditions: report.otherNotes.importantConditions,
        qaPairs: report.otherNotes.qaPairs,
        recommendedPlans: flattenedPlans.map((p) => p.planName),
        recommendedPlanGroups: report.recommendedPlans,
        comparedPlan: report.comparedPlan,
        changedPlan: report.changedPlan,
      },
      total_savings: flattenedPlans[0]?.savingAmount ?? 0,
    })
    .select('id')
    .single();

  if (reportError) {
    throw new Error(`리포트 저장 실패: ${reportError.message}`);
  }

  const reportId = reportData.id;

  const recommendationsToSave = flattenedPlans
    .filter((plan) => plan.planId)
    .map((plan, index) => ({
      report_id: reportId,
      plan_id: Number(plan.planId),
      reason: plan.reason ?? '',
      savings: plan.savingAmount ?? 0,
      sort_order: index,
    }));

  if (recommendationsToSave.length > 0) {
    const { error: recError } = await supabase
      .from('report_recommendations')
      .insert(recommendationsToSave);

    if (recError) {
      throw new Error(`추천 저장 실패: ${recError.message}`);
    }
  }

  return reportId;
}
