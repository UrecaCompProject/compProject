import type { RecommendedPlan } from './aiConsult';
import type { PlanDetailItem } from '../types/plan';

// AI 추천 결과(RecommendedPlan)를 요금제 상세 화면(PlanDetailContent)이 쓰는
// PlanDetailItem으로 변환한다. AI 추천 데이터에는 dataTier/ottBenefits/addOns/
// couponText 등이 없으므로 기본값을 채운다.
export function toPlanDetailItem(plan: RecommendedPlan): PlanDetailItem {
  return {
    id: plan.planId,
    name: plan.planName,
    category: plan.category ?? '',
    targetAge: plan.targetAge ?? '',
    dataTier: '',
    monthlyFee: plan.monthlyFee ?? 0,
    data: plan.data ?? '-',
    dataSpeedAfter: plan.dataSpeedAfter ?? '',
    voice: plan.voice ?? '',
    callAmountMin: plan.callAmountMin ?? null,
    message: plan.message ?? '',
    smsAmount: plan.smsAmount ?? null,
    shareData: plan.shareData ?? '-',
    tethering: plan.tethering ?? '-',
    notes: plan.notes ?? '',
    benefits: plan.benefits ?? [],
    ottBenefits: [],
    addOns: [],
    contractPeriodMonths: null,
    couponText: null,
  };
}
