import { useCallback } from 'react';

import { requestConsult } from '@/shared/lib/aiConsult';
import type {
  ConsultInput,
  ConsultResponse,
  ConversationTurn,
} from '@/shared/lib/aiConsult';

import { postQuestion } from '../api/postQuestion';

// 응답의 resolvedSlots(서버가 대화 맥락으로 확정/해제한 조건의 최종 상태)를
// 프로필에 반영한다.
// - resetConditions면 이전 조건(및 excludePlanIds/skippedFields 등)을 전부 버린다.
// - null 슬롯은 "해제"이므로 프로필에서 제거한다 (예: "예산 무제한" → budget 삭제).
function applyResolvedSlots(
  profile: ConsultInput,
  response: ConsultResponse,
): ConsultInput {
  const slots = response.resolvedSlots;
  if (!slots) return profile;
  const base: ConsultInput = response.resetConditions
    ? { mode: 'recommend', isLoggedIn: profile.isLoggedIn }
    : { ...profile };
  for (const [key, value] of Object.entries(slots)) {
    if (value === null || value === undefined) {
      delete (base as Record<string, unknown>)[key];
    } else {
      (base as Record<string, unknown>)[key] = value;
    }
  }
  return base;
}

export interface UseChatConsultDeps {
  addAIResponse: (
    response: ConsultResponse,
    request: ConsultInput,
    defaultMode: ConsultInput['mode'],
    startsNewRecommendGroup?: boolean,
  ) => void;
  // 서버가 가입(subscribe) 의도로 응답하면 바로 가입 시트를 연다 —
  // 클라이언트 정규식이 놓친 표현을 LLM 의도 분류가 잡은 경우를 위한 보강.
  onSubscribeMode?: () => void;
}

export interface ChatConsult {
  sendQuestion: (
    text: string,
    request: ConsultInput,
    signal: AbortSignal,
    history?: ConversationTurn[],
  ) => Promise<void>;
  submitForm: (request: ConsultInput, signal: AbortSignal) => Promise<void>;
}

export function useChatConsult({
  addAIResponse,
  onSubscribeMode,
}: UseChatConsultDeps): ChatConsult {
  const sendQuestion = useCallback(
    async (
      text: string,
      request: ConsultInput,
      signal: AbortSignal,
      history?: ConversationTurn[],
    ) => {
      const { input: nextProfile, response } = await postQuestion(
        text,
        request,
        signal,
        history,
      );
      // 서버가 대화 맥락 분석으로 확정/해제/초기화한 조건을 프로필에 반영한다 —
      // 정규식이 놓친 값, 상대적 재질의로 바뀐 값, 해제/초기화가 다음 턴에도 유지되도록.
      const mergedProfile = applyResolvedSlots(nextProfile, response);
      addAIResponse(response, mergedProfile, mergedProfile.mode);
      if (response.mode === 'subscribe') onSubscribeMode?.();
    },
    [addAIResponse, onSubscribeMode],
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
