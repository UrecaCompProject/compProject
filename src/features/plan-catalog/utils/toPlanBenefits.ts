import {
  Check,
  Database,
  Gift,
  MessageSquare,
  Phone,
  type LucideIcon,
} from 'lucide-react';

import type { PlanCardBenefit } from '@/features/plan-catalog/components/PlanCard';
import type { RecommendedPlan } from '@/lib/aiConsult';

function getBenefitIcon(label: string): LucideIcon {
  if (label.includes('데이터') || label.includes('증량')) return Database;
  if (label.includes('통화')) return Phone;
  if (label.includes('넷플릭스') || label.includes('OTT')) return Gift;
  return Check;
}

export function toPlanBenefits(plan: RecommendedPlan): PlanCardBenefit[] {
  const benefits: PlanCardBenefit[] = [];
  if (plan.data) {
    benefits.push({
      icon: Database,
      label: `${plan.data}${plan.dataSpeedAfter ? ` (소진 후 ${plan.dataSpeedAfter})` : ''}`,
    });
  }
  if (plan.voice) benefits.push({ icon: Phone, label: plan.voice });
  if (plan.message) benefits.push({ icon: MessageSquare, label: plan.message });
  (plan.benefits ?? []).slice(0, 2).forEach((benefit) => {
    benefits.push({ icon: getBenefitIcon(benefit), label: benefit });
  });
  return benefits;
}
