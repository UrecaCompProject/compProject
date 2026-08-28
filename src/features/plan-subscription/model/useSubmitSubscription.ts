import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import { submitSubscription } from '../api/submitSubscription';

import type { SubscriptionForm } from '../types';

interface SubmitParams {
  plan: RecommendedPlan;
  form: SubscriptionForm;
  currentPlanId?: number | null;
}

// 요금제 가입 신청 뮤테이션 — 성공 시 현재 요금제 캐시 무효화
export function useSubmitSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ plan, form, currentPlanId }: SubmitParams) =>
      submitSubscription({
        plan,
        form,
        currentPlanId: form.type === 'change' ? (currentPlanId ?? null) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'current'] });
    },
  });
}
