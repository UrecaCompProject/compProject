import type { ReportOutput } from '@/shared/lib/aiConsult';
import { supabase } from '@/shared/lib/supabaseClient';

// AI 상담 레포트를 consultation_reports 및 report_recommendations 테이블에 저장합니다.
export async function saveReport(report: ReportOutput) {
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
      },
      total_savings: report.monthlySavingAmount,
    })
    .select('id')
    .single();

  if (reportError) {
    throw new Error(`레포트 저장 실패: ${reportError.message}`);
  }

  const reportId = reportData.id;

  // 요금제 이름을 plan_id로 변환
  const planNames = report.recommendedPlans.filter(Boolean);
  if (planNames.length > 0) {
    const { data: plans, error: planError } = await supabase
      .from('plans')
      .select('id, name')
      .in('name', planNames);

    if (planError) {
      throw new Error(`요금제 조회 실패: ${planError.message}`);
    }

    const planIdByName = new Map(plans?.map((p) => [p.name, p.id]) ?? []);
    const recommendations = planNames.map((name, index) => ({
      report_id: reportId,
      plan_id: planIdByName.get(name) ?? null,
      reason: report.recommendationReason,
      savings: report.monthlySavingAmount,
      sort_order: index,
    }));

    const { error: recError } = await supabase
      .from('report_recommendations')
      .insert(recommendations);

    if (recError) {
      throw new Error(`추천 저장 실패: ${recError.message}`);
    }
  }

  return reportId;
}
