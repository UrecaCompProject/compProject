import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import type {
  RecommendedPlan,
  ConsultInput,
  ConsultResponse,
} from '@/shared/lib/aiConsult';
import type { GameId } from '@/shared/types/games';
import type { QuizKind } from '@/shared/types/quiz';

import {
  routeQuickReply,
  type QuickReplyResult,
} from '../lib/quickReplyRouter';

import type { ChatMessage } from '../types';

export interface UseChatRouterDeps {
  messages: ChatMessage[];
  profile: ConsultInput;
  isLoggedIn: boolean;
  effectiveCurrentPlan: string | undefined;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  setProfile: Dispatch<SetStateAction<ConsultInput>>;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  addAIResponse: (
    response: ConsultResponse,
    request: ConsultInput,
    defaultMode: ConsultInput['mode'],
  ) => void;
  openSubscription: (plan: RecommendedPlan | null) => void;
  openSignupChat: () => void;
  fetchCompare: (planBName: string, planAName?: string) => Promise<void>;
  startQuiz: (
    kind: QuizKind,
    opts?: { includeUserMessage?: boolean; includeIntroMessage?: boolean },
  ) => void;
  openSheetGame: (gameId: GameId, reward?: number) => void;
  checkInAttendance: () => Promise<void>;
  playedTodayGameIds: Set<string>;
  retryLastInput: () => void;
}

export interface ChatRouter {
  handleQuickReply: (
    text: string,
    signal: AbortSignal,
  ) => Promise<QuickReplyResult>;
}

export function useChatRouter(deps: UseChatRouterDeps): ChatRouter {
  const {
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
    checkInAttendance,
    playedTodayGameIds,
    retryLastInput,
  } = deps;

  const handleQuickReply = useCallback(
    async (text: string, signal: AbortSignal) => {
      const trimmed = text.trim();
      if (!trimmed) return 'continue';

      return routeQuickReply({
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
        fetchCompare,
        startQuiz,
        openSheetGame,
        checkInAttendance,
        playedTodayGameIds,
        signal,
        retryLastInput,
      });
    },
    [
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
      checkInAttendance,
      playedTodayGameIds,
      retryLastInput,
    ],
  );

  return { handleQuickReply };
}
