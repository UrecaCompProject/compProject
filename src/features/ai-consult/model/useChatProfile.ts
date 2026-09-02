import { useCallback, useMemo } from 'react';

import { useCurrentPlan } from '@/entities/plan';
import type { ConsultInput, ConsultResponse } from '@/shared/lib/aiConsult';

import { formatResponse } from '../lib/formatResponse';

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

export interface UseChatProfileDeps {
  isLoggedIn: boolean;
  profile: ConsultInput;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setProfile: React.Dispatch<React.SetStateAction<ConsultInput>>;
}

export interface ChatProfile {
  effectiveCurrentPlan: string | undefined;
  addAIResponse: (
    response: ConsultResponse,
    request: ConsultInput,
    defaultMode: ConsultInput['mode'],
  ) => void;
}

export function useChatProfile({
  isLoggedIn,
  profile,
  setMessages,
  setProfile,
}: UseChatProfileDeps): ChatProfile {
  const { data: currentPlan } = useCurrentPlan(isLoggedIn);

  const effectiveCurrentPlan = useMemo(
    () => profile.currentPlan ?? currentPlan?.planName,
    [profile.currentPlan, currentPlan?.planName],
  );

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
          type: 'ai',
          sentence: formatResponse(response),
          quickReplies: response.quickReplies,
          form: response.form,
          recommendations: response.recommendations,
          compareResult: response.compareResult,
          category: modeToCategory(response.mode ?? defaultMode),
        },
      ]);
    },
    [isLoggedIn, setProfile, setMessages],
  );

  return { effectiveCurrentPlan, addAIResponse };
}
