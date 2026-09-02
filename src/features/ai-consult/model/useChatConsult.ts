import { useCallback } from 'react';

import { requestConsult } from '@/shared/lib/aiConsult';
import type { ConsultInput, ConsultResponse } from '@/shared/lib/aiConsult';

import { postQuestion } from '../api/postQuestion';

export interface UseChatConsultDeps {
  addAIResponse: (
    response: ConsultResponse,
    request: ConsultInput,
    defaultMode: ConsultInput['mode'],
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
      addAIResponse(response, request, 'recommend');
    },
    [addAIResponse],
  );

  return { sendQuestion, submitForm };
}
