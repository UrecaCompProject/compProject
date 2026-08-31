import { useCallback, useEffect, useRef, useState } from 'react';

import { useIsLoggedIn } from '@/entities/user';
import { postQuestion } from '@/features/ai-consult/api/postQuestion';
import { useChatQuiz } from '@/features/chat-quiz';
import { useGameStore, useActiveGameMeta } from '@/features/games';
import type { GameId } from '@/features/games';
import { useSubscriptionStore } from '@/features/plan-subscription';
import { requestConsult } from '@/shared/lib/aiConsult';
import type {
  ChatMode,
  ConsultInput,
  ConsultResponse,
} from '@/shared/lib/aiConsult';

import {
  WELCOME_MESSAGE,
  buildErrorMessage,
  formatFormSummary,
  getWelcomeQuickReplies,
} from '../lib/chatHelpers';
import { formatResponse } from '../lib/formatResponse';
import { routeQuickReply } from '../lib/quickReplyRouter';

import { useChatCompare } from './useChatCompare';
import { useChatReport } from './useChatReport';
import { useChatSubscription } from './useChatSubscription';

import type { ChatMessage, MessageCategory } from '../types';

// AI 응답 모드를 리포트 대화 로그 분류용 category로 변환
function modeToCategory(
  mode: ChatMode | undefined,
): MessageCategory | undefined {
  if (mode === 'game') return 'game';
  if (mode === 'attendance') return 'attendance';
  if (mode === 'general') return 'general';
  if (mode === 'recommend' || mode === 'compare' || mode === 'subscribe')
    return 'plan';
  return undefined;
}

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
          category: modeToCategory(response.mode ?? defaultMode),
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
    userProfile: profile,
    isLoading,
    setIsLoading,
    setMessages,
    resetChat,
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

  // 바텀시트 게임(card-match, reaction, attendance) 실행/종료 — useGameStore 재활용
  const openGameStore = useGameStore((state) => state.openGame);
  const closeSheetGame = useGameStore((state) => state.closeGame);
  // 활성 게임 메타 — BottomSheet의 open/title/onBack에 사용
  const activeGameMeta = useActiveGameMeta();

  // gameRouter/quickReplyRouter에서 reward만 넘기도록 래핑 — GameOpenParams로 변환
  const openSheetGame = useCallback(
    (gameId: GameId, reward?: number) => {
      openGameStore(gameId, reward !== undefined ? { reward } : {});
    },
    [openGameStore],
  );

  const handleSend = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      // quick reply 라우터 — 매칭되는 분기가 있으면 처리 완료
      const result = await routeQuickReply({
        text: trimmed,
        messages,
        profile,
        isLoggedIn,
        effectiveCurrentPlan,
        setMessages,
        setProfile,
        setIsLoading,
        addAIResponse,
        openSubscription,
        openSignupChat,
        startCompareFlow,
        setPendingComparePlan,
        fetchCompare,
        startQuiz,
        openSheetGame,
        // "다시 시도" 시 마지막 사용자 입력을 재전송
        retryLastInput: () => {
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
        },
      });

      if (result === 'handled') return;

      // fall-through: 일반 상담 요청
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'user',
          sentence: trimmed,
          category: modeToCategory(profile.mode) ?? 'general',
        },
      ]);
      setInput('');

      // 재시도를 위해 마지막 사용자 입력 보관
      lastUserInputRef.current = trimmed;

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
      openSheetGame,
      fetchCompare,
      startCompareFlow,
      setPendingComparePlan,
      addAIResponse,
      setMessages,
      setProfile,
      setIsLoading,
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
          category: 'plan',
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

  // 웰컱 메시지(id 0)를 제외한 AI 응답 수 — 5회 누적 시 리포트 버튼 노출
  const aiResponseCount = messages.filter(
    (m) => m.type === 'ai' && m.id !== 0,
  ).length;
  const canShowReportButton = aiResponseCount >= 5;

  return {
    messages,
    input,
    setInput,
    isLoading,
    isGeneratingReport,
    canShowReportButton,
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
    closeSheetGame,
    activeGameMeta,
  };
}
