import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postChangePlan } from '@/entities/plan';
import { ensureCurrentMonthUsage } from '@/entities/usage';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import { submitSubscription } from '../api/submitSubscription';

import type { SubscriptionForm } from '../types';

interface SubmitParams {
  plan: RecommendedPlan;
  form: SubscriptionForm;
  currentPlanId?: number | null;
}

// 요금제 가입/변경 신청 뮤테이션.
// 심사 단계가 따로 없어서, 신청 접수 성공을 확정으로 취급해 바로
// current_plans를 갱신한다 (심사 플로우가 생기면 이 호출은 그쪽으로 옮길 것).
export function useSubmitSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ plan, form, currentPlanId }: SubmitParams) => {
      const applicationId = await submitSubscription({
        plan,
        form,
        currentPlanId: form.type === 'change' ? (currentPlanId ?? null) : null,
      });
      await postChangePlan(Number(plan.planId));
      await ensureCurrentMonthUsage();
      return applicationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['usage'] });
    },
  });
}
