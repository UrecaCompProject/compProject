import { useCallback, useEffect, useRef } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import type {
  RecommendedPlan,
  ConsultInput,
  ConsultResponse,
} from '@/shared/lib/aiConsult';
import type { GameId } from '@/shared/types/games';
import type { QuizKind } from '@/shared/types/quiz';

import { buildErrorMessage } from '../lib/chatHelpers';

import { useChatConsult } from './useChatConsult';
import { useChatRouter } from './useChatRouter';

import type { ChatMessage, MessageCategory } from '../types';

// AI 응답 모드를 리포트 대화 로그 분류용 category로 변환
function modeToCategory(
  mode: ConsultInput['mode'] | undefined,
): MessageCategory | undefined {
  if (mode === 'game') return 'game';
  if (mode === 'attendance') return 'attendance';
  if (mode === 'general') return 'general';
  if (mode === 'recommend' || mode === 'compare' || mode === 'subscribe')
    return 'plan';
  return undefined;
}

// 상담 API 호출 중 발생한 에러를 메시지 목록에 추가한다.
function handleConsultError(
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  error: unknown,
) {
  // 사용자가 의도적으로 중지한 경우 — AbortError는 안내 메시지만 표시
  if (error instanceof DOMException && error.name === 'AbortError') {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'ai' as const,
        sentence:
          '응답 생성을 중지했어요. 다시 시도하거나 새 질문을 입력해 주세요.',
        quickReplies: ['메뉴로 돌아가기'],
      },
    ]);
  } else {
    setMessages((prev) => [...prev, buildErrorMessage(error)]);
  }
}

export interface UseChatActionsDeps {
  isLoggedIn: boolean;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  messages: ChatMessage[];
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  setInput: Dispatch<SetStateAction<string>>;
  profile: ConsultInput;
  setProfile: Dispatch<SetStateAction<ConsultInput>>;
  effectiveCurrentPlan: string | undefined;
  addAIResponse: (
    response: ConsultResponse,
    request: ConsultInput,
    defaultMode: ConsultInput['mode'],
  ) => void;
  startRequest: () => AbortSignal;
  clearRequest: (signal?: AbortSignal) => void;
  requireLogin: () => void;
  openSubscription: (plan: RecommendedPlan | null) => void;
  openSignupChat: () => void;
  fetchCompare: (planBName: string, planAName?: string) => Promise<void>;
  startQuiz: (
    kind: QuizKind,
    opts?: { includeUserMessage?: boolean; includeIntroMessage?: boolean },
  ) => void;
  openSheetGame: (gameId: GameId, reward?: number) => void;
  playedTodayGameIds: Set<string>;
  aiResponseCount: number;
}

export interface ChatActions {
  handleSend: (
    text: string,
    options?: { skipUserMessage?: boolean },
  ) => Promise<void>;
  handleFormSubmit: (
    values: Partial<ConsultInput>,
    summary: string,
  ) => Promise<void>;
  handleRegenerate: () => void;
  handleEditMessage: (messageId: number) => void;
}

export function useChatActions(deps: UseChatActionsDeps): ChatActions {
  const {
    isLoggedIn,
    isLoading,
    setIsLoading,
    messages,
    setMessages,
    setInput,
    profile,
    setProfile,
    effectiveCurrentPlan,
    addAIResponse,
    startRequest,
    clearRequest,
    requireLogin,
    openSubscription,
    openSignupChat,
    fetchCompare,
    startQuiz,
    openSheetGame,
    playedTodayGameIds,
    aiResponseCount,
  } = deps;

  // 에러 발생 시 재시도를 위해 마지막 사용자 입력을 보관
  const lastUserInputRef = useRef<string | null>(null);
  const handleSendRef = useRef<
    ((text: string, options?: { skipUserMessage?: boolean }) => void) | null
  >(null);

  const retryLastInput = useCallback(() => {
    const lastInput = lastUserInputRef.current;
    if (!lastInput) return;

    lastUserInputRef.current = null;
    // 에러 메시지를 제거하고 재시도
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.type === 'ai' && last.isError) {
        return prev.slice(0, -1);
      }
      return prev;
    });
    handleSendRef.current?.(lastInput, { skipUserMessage: true });
  }, [setMessages]);

  const router = useChatRouter({
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
    fetchCompare,
    startQuiz,
    openSheetGame,
    playedTodayGameIds,
    retryLastInput,
  });

  const consult = useChatConsult({ addAIResponse });

  const handleSend = useCallback(
    async (text: string, options?: { skipUserMessage?: boolean }) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      // 비로그인 상태로 5회 이상 대화했다면, 퀵리플라이 등 어떤 버튼을 눌러도
      // 실제 동작 대신 로그인 모달을 띄운다 (텍스트 입력은 ChatInput에서 이미 항상 막혀있음).
      if (!isLoggedIn && aiResponseCount >= 5) {
        requireLogin();
        return;
      }

      // quick reply 라우터 — 매칭되는 분기가 있으면 처리 완료
      const signal = startRequest();
      const result = await router.handleQuickReply(text, signal);

      if (result === 'handled') return;

      // fall-through: 일반 상담 요청
      // 재생성 시에는 사용자 메시지가 이미 있으므로 추가하지 않음
      if (!options?.skipUserMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: 'user',
            sentence: trimmed,
            category: modeToCategory(profile.mode) ?? 'general',
          },
        ]);
      }
      setInput('');

      // 재시도를 위해 마지막 사용자 입력 보관
      lastUserInputRef.current = trimmed;

      setIsLoading(true);

      try {
        await consult.sendQuestion(trimmed, { ...profile, isLoggedIn }, signal);
      } catch (error) {
        handleConsultError(setMessages, error);
      } finally {
        setIsLoading(false);
        clearRequest(signal);
      }
    },
    [
      isLoading,
      isLoggedIn,
      aiResponseCount,
      requireLogin,
      startRequest,
      router,
      setMessages,
      setInput,
      profile,
      consult,
      setIsLoading,
      clearRequest,
    ],
  );

  // handleSend를 재귀적으로 호출할 때 TDZ/불변성 린트 경고를 피하기 위해 ref 사용
  useEffect(() => {
    handleSendRef.current = handleSend;
  }, [handleSend]);

  const handleFormSubmit = useCallback(
    async (values: Partial<ConsultInput>, summary: string) => {
      if (isLoading) return;

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

      const signal = startRequest();

      try {
        // skippedFields는 매 제출마다 "이번에 새로 건너뛴 필드"만 담겨 있으므로,
        // 이전 턴에서 건너뛴 필드까지 합쳐야 서버가 계속 기억할 수 있다.
        const skippedFields = Array.from(
          new Set([
            ...(profile.skippedFields ?? []),
            ...(values.skippedFields ?? []),
          ]),
        );
        const merged: ConsultInput = {
          ...profile,
          ...values,
          skippedFields,
          userMessage: '정보 입력 완료',
          mode: 'recommend',
          isLoggedIn,
        };
        await consult.submitForm(merged, signal);
      } catch (error) {
        handleConsultError(setMessages, error);
      } finally {
        setIsLoading(false);
        clearRequest(signal);
      }
    },
    [
      isLoading,
      profile,
      isLoggedIn,
      setMessages,
      setIsLoading,
      startRequest,
      consult,
      clearRequest,
    ],
  );

  // 마지막 AI 응답을 제거하고 마지막 사용자 입력으로 재생성
  const handleRegenerate = useCallback(() => {
    if (isLoading) return;
    const lastInput = lastUserInputRef.current;
    if (!lastInput) return;

    // 마지막 AI 응답 메시지 제거 후 재전송 (사용자 메시지는 유지)
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.type === 'ai') {
        return prev.slice(0, -1);
      }
      return prev;
    });
    handleSend(lastInput, { skipUserMessage: true });
  }, [isLoading, handleSend, setMessages]);

  // 사용자 메시지 수정 — 해당 메시지 이후 대화를 잘라내고 입력창에 원문 주입
  const handleEditMessage = useCallback(
    (messageId: number) => {
      if (isLoading) return;

      setMessages((prev) => {
        const targetIndex = prev.findIndex(
          (m) => m.id === messageId && m.type === 'user',
        );
        if (targetIndex === -1) return prev;

        const targetMessage = prev[targetIndex];
        if (targetMessage.type !== 'user') return prev;

        // 입력창에 원문 주입
        setInput(targetMessage.sentence);
        // 해당 메시지까지 포함하여 이후 메시지 제거 (메시지 자체도 제거)
        return prev.slice(0, targetIndex);
      });
    },
    [isLoading, setMessages, setInput],
  );

  return {
    handleSend,
    handleFormSubmit,
    handleRegenerate,
    handleEditMessage,
  };
}
