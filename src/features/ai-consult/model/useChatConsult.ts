import { useCallback } from 'react';

import { requestConsult } from '@/shared/lib/aiConsult';
import type { ConsultInput, ConsultResponse } from '@/shared/lib/aiConsult';

import { postQuestion } from '../api/postQuestion';

export interface UseChatConsultDeps {
  addAIResponse: (
    response: ConsultResponse,
    request: ConsultInput,
    defaultMode: ConsultInput['mode'],
    startsNewRecommendGroup?: boolean,
  ) => void;
}

export interface ChatConsult {
  sendQuestion: (
    text: string,
    request: ConsultInput,
    signal: AbortSignal,
  ) => Promise<void>;
  submitForm: (request: ConsultInput, signal: AbortSignal) => Promise<void>;
}

export function useChatConsult({
  addAIResponse,
}: UseChatConsultDeps): ChatConsult {
  const sendQuestion = useCallback(
    async (text: string, request: ConsultInput, signal: AbortSignal) => {
      const { input: nextProfile, response } = await postQuestion(
        text,
        request,
        signal,
      );
      addAIResponse(response, nextProfile, nextProfile.mode);
    },
    [addAIResponse],
  );

  const submitForm = useCallback(
    async (request: ConsultInput, signal: AbortSignal) => {
      const response = await requestConsult(request, signal);
      // 정보 입력 폼 제출로 얻은 응답 — 새 groupId를 발급하는 라운드로 표시
      addAIResponse(response, request, 'recommend', true);
    },
    [addAIResponse],
  );

  return { sendQuestion, submitForm };
}
