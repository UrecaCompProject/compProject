import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import type { PlanRow } from '../model/plan';

// Supabase PlanRow를 프론트엔드 RecommendedPlan으로 변환
export function toRecommendedPlan(row: PlanRow): RecommendedPlan {
  return {
    planId: String(row.id),
    planName: row.name,
    category: row.category,
    targetAge: row.target_age,
    monthlyFee: row.monthly_fee,
    data: row.data,
    dataSpeedAfter: row.data_speed_after,
    voice: row.voice,
    message: row.message,
    shareData: row.share_data,
    tethering: row.tethering,
    notes: row.notes,
    benefits: row.benefits ?? [],
    reason: row.notes ?? '',
    savingAmount: 0,
  };
}
