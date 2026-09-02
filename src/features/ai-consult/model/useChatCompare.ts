import { useCallback } from 'react';

import type {
  ConsultInput,
  ConsultResponse,
  RecommendedPlan,
} from '@/shared/lib/aiConsult';
import { requestConsult } from '@/shared/lib/aiConsult';

import { buildAIMessage, buildErrorMessage } from '../lib/chatHelpers';

type SetMessages = React.Dispatch<
  React.SetStateAction<import('../types').ChatMessage[]>
>;

interface UseChatCompareParams {
  profile: ConsultInput;
  isLoggedIn: boolean;
  effectiveCurrentPlan: string | undefined;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  setMessages: SetMessages;
  addAIResponse: (
    response: ConsultResponse,
    request: ConsultInput,
    defaultMode: ConsultInput['mode'],
  ) => void;
  startRequest: () => AbortSignal;
  clearRequest: (signal?: AbortSignal) => void;
}

// 요금제 비교 로직 — 현재 요금제가 있으면 바로 AI 비교를 요청하고, 없으면
// 카탈로그 기반 비교 컴포넌트(PlanCompare, planCompare 메시지)를 띄워
// 사용자가 직접 두 요금제를 골라 비교하게 한다.
export function useChatCompare({
  profile,
  isLoggedIn,
  effectiveCurrentPlan,
  isLoading,
  setIsLoading,
  setMessages,
  addAIResponse,
  startRequest,
  clearRequest,
}: UseChatCompareParams) {
  const fetchCompare = useCallback(
    async (planBName: string, planAName?: string) => {
      setIsLoading(true);
      const signal = startRequest();
      try {
        const comparePlanA = planAName ?? effectiveCurrentPlan;
        const request: ConsultInput = {
          ...profile,
          userMessage: '현재 요금제와 비교',
          mode: 'compare',
          isLoggedIn,
          comparePlanA,
          comparePlanB: planBName,
        };
        const response = await requestConsult(request, signal);
        addAIResponse(response, request, 'compare');
      } catch (error) {
        // 사용자가 의도적으로 중지한 경우 — 중지 안내 메시지 표시
        if (error instanceof DOMException && error.name === 'AbortError') {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now(),
              type: 'ai' as const,
              sentence:
                '비교 요청을 중지했어요. 다시 시도하거나 새 질문을 입력해 주세요.',
              quickReplies: ['메뉴로 돌아가기'],
            },
          ]);
          return;
        }
        setMessages((prev) => [...prev, buildErrorMessage(error)]);
      } finally {
        setIsLoading(false);
        clearRequest(signal);
      }
    },
    [
      profile,
      isLoggedIn,
      effectiveCurrentPlan,
      setIsLoading,
      setMessages,
      addAIResponse,
      startRequest,
      clearRequest,
    ],
  );

  // 추천 카드의 '비교하기' — 현재 요금제가 있으면 바로 AI 비교를 요청하고,
  // 없으면 카탈로그 기반 비교 컴포넌트를 띄워 직접 고르게 한다.
  const handlePlanCompare = useCallback(
    (plan: RecommendedPlan) => {
      // 로딩 중이면 중복 요청 차단 — 중지 후 isLoading이 false가 되면 다시 클릭 가능
      if (isLoading) return;
      if (!effectiveCurrentPlan) {
        setMessages((prev) => [
          ...prev,
          buildAIMessage(
            '비교할 요금제를 선택해 주세요.',
            ['메뉴로 돌아가기'],
            {
              planCompare: true,
            },
          ),
        ]);
        return;
      }
      fetchCompare(plan.planName);
    },
    [isLoading, effectiveCurrentPlan, fetchCompare, setMessages],
  );

  return {
    fetchCompare,
    handlePlanCompare,
  };
}
