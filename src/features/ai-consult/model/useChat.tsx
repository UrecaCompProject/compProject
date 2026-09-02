import { useEffect, useRef } from 'react';

import { useIsLoggedIn } from '@/entities/user';
import { useChatQuiz } from '@/features/chat-quiz';
import { useMissionCompletion } from '@/features/reward';

import { useChatAbort } from './useChatAbort';
import { useChatActions } from './useChatActions';
import { useChatAuthGate } from './useChatAuthGate';
import { useChatCompare } from './useChatCompare';
import { useChatGames } from './useChatGames';
import { useChatProfile } from './useChatProfile';
import { useChatReport } from './useChatReport';
import { useChatState } from './useChatState';
import { useChatSubscription } from './useChatSubscription';

export function useChat() {
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
  });

  const { recordPlay, playedTodayGameIds } = useMissionCompletion();

  const games = useChatGames({
    setMessages: state.setMessages,
    recordPlay,
  });

  const quiz = useChatQuiz({
    setMessages: state.setMessages,
    onQuizFinish: games.handleQuizFinish,
  });

  const subscription = useChatSubscription({
    isLoggedIn,
    setMessages: state.setMessages,
  });

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
    playedTodayGameIds,
    aiResponseCount: state.aiResponseCount,
  });

  // 비로그인 상태로 5회 이상 대화하면 로그인 모달을 한 번 자동으로 띄워 가입을 유도한다.
  const hasPromptedLoginRef = useRef(false);
  useEffect(() => {
    if (isLoggedIn) {
      hasPromptedLoginRef.current = false;
      return;
    }
    if (state.aiResponseCount >= 5 && !hasPromptedLoginRef.current) {
      hasPromptedLoginRef.current = true;
      requireLogin();
    }
  }, [isLoggedIn, state.aiResponseCount, requireLogin]);

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
    activeGameMeta: games.activeGameMeta,
  };
}
