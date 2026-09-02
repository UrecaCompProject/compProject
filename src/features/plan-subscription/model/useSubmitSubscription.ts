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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['plans', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['usage'] });
      // 채팅(useChat의 effectiveCurrentPlan)이 참조하는 zustand 스토어는 이
      // react-query 캐시와 별도라서, 갱신하지 않으면 요금제 변경 후에도
      // 리포트·비교 등에 예전 현재 요금제가 계속 반영된다.
      useSubscriptionStore.getState().loadCurrentPlan();
      // 어느 화면(채팅 인라인 카드/상담 리포트/요금제 카탈로그)에서 가입·변경했든
      // 성공하는 순간 항상 기록 — 채팅이 이 값을 지켜보다가 안내 말풍선을 띄운다.
      useSubscriptionStore.getState().setLastChangedPlan(variables.plan);
    },
  });
}
