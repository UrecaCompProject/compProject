import { useCallback, useRef, useState } from 'react';

import type { RecommendedPlan } from '@/shared/lib/aiConsult';

import { buildAIMessage, getWelcomeQuickReplies } from '../lib/chatHelpers';

type SetMessages = React.Dispatch<
  React.SetStateAction<import('../types').ChatMessage[]>
>;

interface UseChatSubscriptionParams {
  isLoggedIn: boolean;
  setMessages: SetMessages;
}

// 요금제 가입 시트 열림/닫힘과 가입 완료 후 메뉴 복귀 메시지를 관리
export function useChatSubscription({
  isLoggedIn,
  setMessages,
}: UseChatSubscriptionParams) {
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] =
    useState<RecommendedPlan | null>(null);
  // 가입 완료 후 onComplete 호출 표시 — closeSubscription에서 메뉴 복귀
  // 메시지 중복 추가를 방지하기 위해 사용
  const subscriptionCompletedRef = useRef(false);

  const openSubscription = useCallback(
    (plan: RecommendedPlan | null) => {
      if (!isLoggedIn) {
        setMessages((prev) => [
          ...prev,
          buildAIMessage(
            '요금제 가입은 로그인 후에 가능해요. 회원가입을 진행해주세요.',
            ['회원 가입하기', '기타 상담'],
          ),
        ]);
        return;
      }
      setSubscriptionPlan(plan);
      setSubscriptionOpen(true);
    },
    [isLoggedIn, setMessages],
  );

  // 가입 시트 닫기 — 단순 닫기(swipe/X) 시에는 기존 마지막 AI 메시지의
  // 퀵리플라이를 그대로 유지하기 위해 새 메시지를 추가하지 않는다.
  // 가입 완료(onComplete) 시에는 handleSignupFinished가 별도 메시지를 추가한다.
  const closeSubscription = useCallback((open: boolean) => {
    if (open) return;
    setSubscriptionOpen(false);
    subscriptionCompletedRef.current = false;
  }, []);

  const handleSignupFinished = useCallback(() => {
    subscriptionCompletedRef.current = true;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'ai',
        sentence: '다른 도움이 필요하시면 아래에서 선택해주세요.',
        quickReplies: getWelcomeQuickReplies(isLoggedIn),
      },
    ]);
  }, [isLoggedIn, setMessages]);

  return {
    subscriptionOpen,
    subscriptionPlan,
    openSubscription,
    closeSubscription,
    handleSignupFinished,
  };
}
