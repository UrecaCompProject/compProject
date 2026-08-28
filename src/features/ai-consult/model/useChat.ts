import { useCallback, useEffect, useRef, useState } from 'react';

import { useIsLoggedIn } from '@/entities/user';
import { postQuestion } from '@/features/ai-consult/api/postQuestion';
import { useChatQuiz } from '@/features/chat-quiz';
import { useSubscriptionStore } from '@/features/plan-subscription';
import { requestConsult } from '@/shared/lib/aiConsult';
import type { ConsultInput, ConsultResponse } from '@/shared/lib/aiConsult';

import {
  WELCOME_MESSAGE,
  buildAIMessage,
  buildErrorMessage,
  findLastRecommendedPlan,
  findLastRecommendations,
  formatFormSummary,
  getQuizIntent,
  getWelcomeQuickReplies,
} from '../lib/chatHelpers';
import { formatResponse } from '../lib/formatResponse';

import { useChatCompare } from './useChatCompare';
import { useChatReport } from './useChatReport';
import { useChatSubscription } from './useChatSubscription';

import type { ChatMessage } from '../types';

export function useChat() {
  const isLoggedIn = useIsLoggedIn();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      type: 'ai',
      sentence: WELCOME_MESSAGE,
      quickReplies: getWelcomeQuickReplies(isLoggedIn),
    },
  ]);
  const {
    startQuiz,
    answerOx,
    selectMultipleChoice,
    confirmMultipleChoice,
    nextQuestion,
  } = useChatQuiz({ setMessages });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ConsultInput>({
    mode: 'menu',
    isLoggedIn,
  });
  // 에러 발생 시 재시도를 위해 마지막 사용자 입력을 보관
  const lastUserInputRef = useRef<string | null>(null);

  // AI 응답을 메시지 목록에 추가하고 profile을 갱신하는 공통 헬퍼
  const addAIResponse = useCallback(
    (
      response: ConsultResponse,
      request: ConsultInput,
      defaultMode: ConsultInput['mode'],
    ) => {
      const mergedProfile: ConsultInput = {
        ...request,
        mode: response.mode ?? defaultMode,
        isLoggedIn,
      };
      setProfile(mergedProfile);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'ai' as const,
          sentence: formatResponse(response),
          quickReplies: response.quickReplies,
          form: response.form,
          recommendations: response.recommendations,
          compareResult: response.compareResult,
        },
      ]);
    },
    [isLoggedIn],
  );

  const subscribedCurrentPlan = useSubscriptionStore((s) => s.currentPlan);
  const loadCurrentPlan = useSubscriptionStore((s) => s.loadCurrentPlan);

  // 사용자가 직접 입력한 currentPlan이 우선, 없으면 구독 스토어의 값을 사용
  const effectiveCurrentPlan =
    profile.currentPlan ?? subscribedCurrentPlan?.planName;

  const wasLoggedInRef = useRef(isLoggedIn);

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: 0,
        type: 'ai',
        sentence: WELCOME_MESSAGE,
        quickReplies: getWelcomeQuickReplies(isLoggedIn),
      },
    ]);
    setInput('');
    setProfile({ mode: 'menu', isLoggedIn });
  }, [isLoggedIn]);

  useEffect(() => {
    if (wasLoggedInRef.current && !isLoggedIn) {
      resetChat();
    } else if (!wasLoggedInRef.current && isLoggedIn) {
      // 채팅 도중 로그인하면 웰컴 메시지의 퀵 리플라이를 로그인 기준으로 갱신합니다.
      setMessages((prev) => {
        if (prev.length === 0 || prev[0].type !== 'ai') return prev;
        return [
          { ...prev[0], quickReplies: getWelcomeQuickReplies(true) },
          ...prev.slice(1),
        ];
      });
    }
    wasLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn, resetChat]);

  // 로그인 시 DB에서 현재 요금제를 로드해 구독 스토어에 반영
  useEffect(() => {
    if (isLoggedIn) {
      loadCurrentPlan().catch(() => {
        // 미가입 사용자 등 조회 실패는 무시
      });
    }
  }, [isLoggedIn, loadCurrentPlan]);

  const {
    subscriptionOpen,
    subscriptionPlan,
    openSubscription,
    closeSubscription,
    handleSignupFinished,
  } = useChatSubscription({ isLoggedIn, setMessages });

  const {
    fetchCompare,
    handlePlanCompare,
    handleSelectCurrentPlan,
    handleSelectTargetPlan,
    startCompareFlow,
    setPendingComparePlan,
  } = useChatCompare({
    profile,
    isLoggedIn,
    effectiveCurrentPlan,
    setIsLoading,
    setMessages,
    addAIResponse,
  });

  const { isGeneratingReport, handleGenerateReport } = useChatReport({
    messages,
    effectiveCurrentPlan,
    isLoading,
    setIsLoading,
    setMessages,
  });

  const openSignupChat = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        type: 'signup',
      },
    ]);
  };

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      // "다시 시도" 퀵리플라이 — 마지막 사용자 입력을 재전송
      if (trimmed === '다시 시도') {
        const lastInput = lastUserInputRef.current;
        if (lastInput) {
          lastUserInputRef.current = null;
          // 에러 메시지를 제거하고 재시도
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.type === 'ai' && last.isError) {
              return prev.slice(0, -1);
            }
            return prev;
          });
          handleSend(lastInput);
        }
        return;
      }

      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: 'user', sentence: trimmed },
      ]);
      setInput('');

      // 재시도를 위해 마지막 사용자 입력 보관
      lastUserInputRef.current = trimmed;

      const quizIntent = getQuizIntent(trimmed);
      if (quizIntent) {
        startQuiz(quizIntent, { includeUserMessage: false });
        return;
      }

      // 회원가입 흐름
      if (trimmed === '회원 가입하기') {
        openSignupChat();
        return;
      }

      // 요금제 가입 흐름
      if (trimmed === '온라인 가입' || trimmed === '요금제 가입하기') {
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

        const lastPlan = findLastRecommendedPlan(messages);
        openSubscription(lastPlan ?? null);
        return;
      }

      // 현재 요금제와 마지막 추천 요금제 비교
      if (trimmed === '현재 요금제와 비교') {
        const lastPlan = findLastRecommendedPlan(messages);
        if (!lastPlan) {
          setMessages((prev) => [
            ...prev,
            buildAIMessage(
              '비교할 추천 요금제가 없어요. 먼저 요금제 추천을 받아주세요.',
              ['요금제 추천받기', '메뉴로 돌아가기'],
            ),
          ]);
          return;
        }
        if (!effectiveCurrentPlan) {
          setPendingComparePlan(lastPlan.planName);
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
        await fetchCompare(lastPlan.planName);
        return;
      }

      // 요금제 비교하기 메뉴 - 현재 요금제가 없으면 드랍다운으로 선택
      if (trimmed === '요금제 비교하기') {
        startCompareFlow();
        return;
      }

      // 이미 추천받은 상태에서 '요금제 추천받기' 재탭 — 새 조건 수집 또는 다른 요금제 분기
      if (trimmed === '요금제 추천받기') {
        const lastRecs = findLastRecommendations(messages);
        if (lastRecs.length > 0) {
          setMessages((prev) => [
            ...prev,
            buildAIMessage(
              '이미 요금제를 추천받으셨어요. 새로운 조건으로 다시 추천받거나, 방금 본 요금제와 다른 요금제를 확인할 수 있어요.',
              [
                '새 조건으로 다시 추천받기',
                '다른 요금제 보기',
                '메뉴로 돌아가기',
              ],
            ),
          ]);
          return;
        }
        // 추천받은 적이 없으면 일반 추천 플로우로 진행 (postQuestion으로 fall-through)
      }

      // '다른 요금제 보기' — 이전 추천 planId를 제외하고 같은 조건으로 재추천
      if (trimmed === '다른 요금제 보기') {
        const lastRecs = findLastRecommendations(messages);
        const excludePlanIds = lastRecs.map((r) => r.planId);
        setIsLoading(true);
        try {
          const request: ConsultInput = {
            ...profile,
            userMessage: '다른 요금제 보기',
            mode: 'recommend',
            isLoggedIn,
            excludePlanIds,
          };
          const response = await requestConsult(request);
          addAIResponse(response, request, 'recommend');
        } catch (error) {
          setMessages((prev) => [
            ...prev,
            buildErrorMessage(
              error,
              '요청 중 문제가 발생했어요. 다시 시도해주세요.',
            ),
          ]);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      // '새 조건으로 다시 추천받기' — profile을 리셋하고 폼으로 새 조건 수집
      if (trimmed === '새 조건으로 다시 추천받기') {
        const resetProfile: ConsultInput = {
          mode: 'recommend',
          isLoggedIn,
        };
        setProfile(resetProfile);
        setIsLoading(true);
        try {
          const request: ConsultInput = {
            ...resetProfile,
            userMessage: '새 조건으로 다시 추천받기',
          };
          const response = await requestConsult(request);
          addAIResponse(response, request, 'recommend');
        } catch (error) {
          setMessages((prev) => [
            ...prev,
            buildErrorMessage(
              error,
              '요청 중 문제가 발생했어요. 다시 시도해주세요.',
            ),
          ]);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      try {
        const { input: nextProfile, response } = await postQuestion(trimmed, {
          ...profile,
          isLoggedIn,
        });
        addAIResponse(response, nextProfile, nextProfile.mode);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          buildErrorMessage(
            error,
            '요청 중 문제가 발생했어요. 다시 시도해주세요.',
          ),
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [
      isLoading,
      messages,
      isLoggedIn,
      profile,
      effectiveCurrentPlan,
      startQuiz,
      openSubscription,
      fetchCompare,
      startCompareFlow,
      setPendingComparePlan,
      addAIResponse,
      setMessages,
    ],
  );

  const handleFormSubmit = useCallback(
    async (values: Partial<ConsultInput>) => {
      if (isLoading) return;

      const summary = formatFormSummary(values);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'user',
          sentence: summary || '정보를 입력했습니다.',
        },
      ]);
      setIsLoading(true);

      try {
        const merged: ConsultInput = {
          ...profile,
          ...values,
          userMessage: '정보 입력 완료',
          mode: 'recommend',
          isLoggedIn,
        };
        const response = await requestConsult(merged);
        addAIResponse(response, merged, 'recommend');
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          buildErrorMessage(
            error,
            '요청 중 문제가 발생했어요. 다시 시도해주세요.',
          ),
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, profile, isLoggedIn, addAIResponse, setMessages],
  );

  return {
    messages,
    input,
    setInput,
    isLoading,
    isGeneratingReport,
    handleSend,
    handleSignupFinished,
    handleFormSubmit,
    handleGenerateReport,
    handlePlanCompare,
    handleSelectCurrentPlan,
    handleSelectTargetPlan,
    profile,
    subscriptionOpen,
    subscriptionPlan,
    openSubscription,
    closeSubscription,
    isLoggedIn,
    startQuiz,
    answerOx,
    selectMultipleChoice,
    confirmMultipleChoice,
    nextQuestion,
  };
}
