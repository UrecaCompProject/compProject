import { useCallback, useRef, useState } from 'react';

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
  clearRequest: () => void;
}

// 요금제 비교 2단계 플로우와 fetchCompare 로직을 관리
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
  // 비교 요청 시 현재 요금제가 없으면 드랍다운 선택 후 비교를 이어가기 위해
  // 대기 중인 비교 대상 요금제명을 보관
  const pendingComparePlanRef = useRef<string | null>(null);
  // "요금제 비교하기" 메뉴에서 현재 요금제 선택 후 비교 대상 선택으로 넘어가는 2단계 플로우
  const [compareFlow, setCompareFlow] = useState<
    'idle' | 'selectingCurrent' | 'selectingTarget'
  >('idle');
  // 2단계 플로우에서 선택된 현재 요금제명 (fetchCompare에 명시적으로 전달)
  const selectedCurrentPlanRef = useRef<string | null>(null);

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
        clearRequest();
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

  const handlePlanCompare = useCallback(
    (plan: RecommendedPlan) => {
      // 로딩 중이면 중복 요청 차단 — 중지 후 isLoading이 false가 되면 다시 클릭 가능
      if (isLoading) return;
      if (!effectiveCurrentPlan) {
        pendingComparePlanRef.current = plan.planName;
        setMessages((prev) => [
          ...prev,
          buildAIMessage(
            '현재 이용 중인 요금제를 아래에서 선택해주세요.',
            ['메뉴로 돌아가기'],
            { planSelector: true },
          ),
        ]);
        return;
      }
      fetchCompare(plan.planName);
    },
    [isLoading, effectiveCurrentPlan, fetchCompare, setMessages],
  );

  // PlanSelector 드랍다운에서 요금제를 선택했을 때 호출
  const handleSelectCurrentPlan = useCallback(
    (planName: string) => {
      // "요금제 비교하기" 메뉴의 2단계 플로우: 현재 요금제 선택 → 비교 대상 선택
      if (compareFlow === 'selectingCurrent') {
        selectedCurrentPlanRef.current = planName;
        setCompareFlow('selectingTarget');
        setMessages((prev) => [
          ...prev,
          buildAIMessage(
            '비교할 대상 요금제를 아래에서 선택해주세요.',
            ['메뉴로 돌아가기'],
            { planSelector: true, planSelectorMode: 'target' },
          ),
        ]);
        return;
      }

      // "현재 요금제와 비교" 또는 추천 카드의 비교 버튼에서 온 경우:
      // 대기 중인 비교 대상이 있으면 선택 즉시 비교를 이어감
      const pendingPlan = pendingComparePlanRef.current;
      pendingComparePlanRef.current = null;
      if (pendingPlan) {
        fetchCompare(pendingPlan, planName);
      }
    },
    [compareFlow, fetchCompare, setMessages],
  );

  // 비교 대상 요금제 선택 시 호출 (2단계 플로우의 두 번째 단계)
  const handleSelectTargetPlan = useCallback(
    (planName: string) => {
      const currentPlan = selectedCurrentPlanRef.current;
      selectedCurrentPlanRef.current = null;
      setCompareFlow('idle');
      if (currentPlan) {
        fetchCompare(planName, currentPlan);
      }
    },
    [fetchCompare],
  );

  const startCompareFlow = useCallback(() => {
    if (!effectiveCurrentPlan) {
      setCompareFlow('selectingCurrent');
      setMessages((prev) => [
        ...prev,
        buildAIMessage(
          '현재 이용 중인 요금제를 아래에서 선택해주세요.',
          ['메뉴로 돌아가기'],
          { planSelector: true, planSelectorMode: 'current' },
        ),
      ]);
      return;
    }
    setCompareFlow('selectingTarget');
    setMessages((prev) => [
      ...prev,
      buildAIMessage(
        '비교할 대상 요금제를 아래에서 선택해주세요.',
        ['메뉴로 돌아가기'],
        { planSelector: true, planSelectorMode: 'target' },
      ),
    ]);
  }, [effectiveCurrentPlan, setMessages]);

  const setPendingComparePlan = useCallback((planName: string) => {
    pendingComparePlanRef.current = planName;
  }, []);

  return {
    compareFlow,
    fetchCompare,
    handlePlanCompare,
    handleSelectCurrentPlan,
    handleSelectTargetPlan,
    startCompareFlow,
    setPendingComparePlan,
  };
}
