import type { ComponentType } from 'react';
import { useEffect, useRef } from 'react';

import { useIsLoggedIn } from '@/entities/user';
import type { GameId } from '@/shared/types/games';
import type { QuizKind } from '@/shared/types/quiz';

import { getWelcomeQuickReplies } from '../lib/chatHelpers';

import { useChatAbort } from './useChatAbort';
import { useChatActions } from './useChatActions';
import { useChatAuthGate } from './useChatAuthGate';
import { useChatCompare } from './useChatCompare';
import { useChatGames } from './useChatGames';
import { useChatProfile } from './useChatProfile';
import { useChatQuiz } from './useChatQuiz';
import { useChatReport } from './useChatReport';
import { useChatState } from './useChatState';
import { useChatSubscription } from './useChatSubscription';

interface MissionDeps {
  recordPlay: (
    params: { gameId: string; score?: number },
    options?: { onSuccess?: () => void },
  ) => void;
  playedTodayGameIds: Set<string>;
}

interface GameDeps {
  openGame: (
    gameId: GameId,
    params?: {
      reward?: number;
      source?: 'chat' | 'reward';
      onWin?: (reward: number) => void;
    },
  ) => void;
  closeGame: () => void;
}

interface RewardDeps {
  GetBadgeModal: ComponentType<{ badgeCount: number }>;
  scratchMissionUuid?: string;
  quizMissionUuids: Partial<Record<QuizKind, string>>;
}

export interface UseChatParams {
  signinModal: ComponentType<{ onSignupClick?: () => void }>;
  mission: MissionDeps;
  game: GameDeps;
  reward: RewardDeps;
}

export function useChat({ signinModal, mission, game, reward }: UseChatParams) {
  const isLoggedIn = useIsLoggedIn();
  const state = useChatState({ isLoggedIn });

  const { effectiveCurrentPlan, addAIResponse } = useChatProfile({
    isLoggedIn,
    profile: state.profile,
    setMessages: state.setMessages,
    setProfile: state.setProfile,
  });

  const { startRequest, clearRequest, handleStop } = useChatAbort({
    setIsLoading: state.setIsLoading,
  });

  const { requireLogin, openSignupChat } = useChatAuthGate({
    setMessages: state.setMessages,
    signinModal,
  });

  const games = useChatGames({
    setMessages: state.setMessages,
    recordPlay: mission.recordPlay,
    openGame: game.openGame,
    closeGame: game.closeGame,
    reward,
  });

  const quiz = useChatQuiz({
    setMessages: state.setMessages,
    onQuizFinish: games.handleQuizFinish,
  });

  const subscription = useChatSubscription({
    isLoggedIn,
    setMessages: state.setMessages,
  });

  const wasLoggedInRef = useRef(isLoggedIn);
  const { resetChat, setMessages } = state;

  // 비로그인 상태로 5회 이상 대화하면 로그인 모달을 한 번 자동으로 띄워 가입을 유도한다.
  const hasPromptedLoginRef = useRef(false);

  useEffect(() => {
    const wasLoggedIn = wasLoggedInRef.current;
    wasLoggedInRef.current = isLoggedIn;

    if (wasLoggedIn && !isLoggedIn) {
      // 로그아웃 직후 — 채팅을 리셋한다. 이 시점의 state.aiResponseCount는
      // 아직 리셋이 반영되기 전(방금 끝난 로그인 세션 값)이라 신뢰할 수 없으므로,
      // 여기서 바로 return해 아래 5회 체크가 그 값을 보고 즉시 재발동하지 않게 한다.
      resetChat();
      hasPromptedLoginRef.current = false;
      return;
    }

    if (!wasLoggedIn && isLoggedIn) {
      // 채팅 도중 로그인하면 웰컴 메시지의 퀵 리플라이를 로그인 기준으로 갱신합니다.
      hasPromptedLoginRef.current = false;
      setMessages((prev) => {
        if (prev.length === 0 || prev[0].type !== 'ai') return prev;
        return [
          { ...prev[0], quickReplies: getWelcomeQuickReplies(true) },
          ...prev.slice(1),
        ];
      });
      return;
    }

    if (
      !isLoggedIn &&
      state.aiResponseCount >= 5 &&
      !hasPromptedLoginRef.current
    ) {
      hasPromptedLoginRef.current = true;
      requireLogin();
    }
  }, [isLoggedIn, resetChat, setMessages, state.aiResponseCount, requireLogin]);

  const compare = useChatCompare({
    profile: state.profile,
    isLoggedIn,
    effectiveCurrentPlan,
    isLoading: state.isLoading,
    setIsLoading: state.setIsLoading,
    setMessages: state.setMessages,
    addAIResponse,
    startRequest,
    clearRequest,
  });

  const report = useChatReport({
    messages: state.messages,
    effectiveCurrentPlan,
    changedPlan: subscription.changedPlan,
    userProfile: state.profile,
    isLoading: state.isLoading,
    setIsLoading: state.setIsLoading,
    setMessages: state.setMessages,
    resetChat: state.resetChat,
    startRequest,
    clearRequest,
  });

  const actions = useChatActions({
    isLoggedIn,
    isLoading: state.isLoading,
    setIsLoading: state.setIsLoading,
    messages: state.messages,
    setMessages: state.setMessages,
    setInput: state.setInput,
    profile: state.profile,
    setProfile: state.setProfile,
    effectiveCurrentPlan,
    addAIResponse,
    startRequest,
    clearRequest,
    requireLogin,
    openSubscription: subscription.openSubscription,
    openSignupChat,
    fetchCompare: compare.fetchCompare,
    startQuiz: quiz.startQuiz,
    openSheetGame: games.openSheetGame,
    playedTodayGameIds: mission.playedTodayGameIds,
    aiResponseCount: state.aiResponseCount,
  });

  return {
    messages: state.messages,
    input: state.input,
    setInput: state.setInput,
    isLoading: state.isLoading,
    isGeneratingReport: report.isGeneratingReport,
    canShowReportButton: state.canShowReportButton,
    handleSend: actions.handleSend,
    handleStop,
    handleRegenerate: actions.handleRegenerate,
    handleEditMessage: actions.handleEditMessage,
    handleSignupFinished: subscription.handleSignupFinished,
    openSignupChat,
    requireLogin,
    handleFormSubmit: actions.handleFormSubmit,
    handleGenerateReport: report.handleGenerateReport,
    handlePlanCompare: compare.handlePlanCompare,
    fetchCompare: compare.fetchCompare,
    profile: state.profile,
    subscriptionOpen: subscription.subscriptionOpen,
    subscriptionPlan: subscription.subscriptionPlan,
    openSubscription: subscription.openSubscription,
    closeSubscription: subscription.closeSubscription,
    isLoggedIn,
    startQuiz: quiz.startQuiz,
    startScratch: games.startScratch,
    onScratchWin: games.onScratchWin,
    answerOx: quiz.answerOx,
    selectMultipleChoice: quiz.selectMultipleChoice,
    confirmMultipleChoice: quiz.confirmMultipleChoice,
    closeSheetGame: games.closeSheetGame,
  };
}
