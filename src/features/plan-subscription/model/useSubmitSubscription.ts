import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postChangePlan } from '@/entities/plan';
import { ensureCurrentMonthUsage } from '@/entities/usage';
import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import { submitSubscription } from '../api/submitSubscription';

import { useSubscriptionStore } from './useSubscriptionStore';

import type { SubscriptionForm } from '../types';

interface SubmitParams {
  plan: RecommendedPlan;
  form: SubscriptionForm;
  currentPlanId?: number | null;
}

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
    onSuccess: (_data, variables) => {
      // currentPlan은 TanStack Query 캐시를 유일한 신뢰원으로 한다.
      // Zustand 스토어와의 이중 동기화는 제거.
      queryClient.invalidateQueries({ queryKey: ['plans', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['usage'] });
      // 어느 화면(채팅 인라인 카드/상담 리포트/요금제 카탈로그)에서 가입·변경했든
      // 성공하는 순간 항상 기록 — 채팅이 이 값을 지켜보다가 안내 말풍선을 띄운다.
      useSubscriptionStore.getState().setLastChangedPlan(variables.plan);
    },
  });
}
