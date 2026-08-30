import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import type { PlanDetailItem } from '../types';

// PlanDetailItem(요금제 상세 목록 데이터)을 RecommendedPlan(가입 시트 공용 타입)으로 변환
export function toRecommendedPlan(plan: PlanDetailItem): RecommendedPlan {
  return {
    planId: plan.id,
    planName: plan.name,
    reason: '',
    savingAmount: 0,
    monthlyFee: plan.monthlyFee,
    data: plan.data,
    benefits: plan.benefits,
    category: plan.category,
    targetAge: plan.targetAge,
    dataSpeedAfter: plan.dataSpeedAfter,
    voice: plan.voice,
    message: plan.message,
    shareData: plan.shareData,
    tethering: plan.tethering,
    notes: plan.notes,
  };
}
