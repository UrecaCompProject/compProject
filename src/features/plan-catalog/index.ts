// plan-catalog의 공개 API는 entities/plan으로 이관됨
// 하위 호환을 위해 entities/plan에서 re-export
export {
  PlanCard,
  type PlanCardBenefit,
  type PlanCardProps,
  toRecommendedPlan,
  toPlanBenefits,
  getPlanCatalog,
  getCurrentPlan,
} from '@/entities/plan';
export type { PlanRow } from '@/entities/plan';
