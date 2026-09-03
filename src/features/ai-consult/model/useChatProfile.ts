import { useCallback, useMemo } from 'react';

import { useCurrentPlan } from '@/entities/plan';
import type { ConsultInput, ConsultResponse } from '@/shared/lib/aiConsult';

import { buildRecommendTarget } from '../lib/chatHelpers';
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
    startsNewRecommendGroup?: boolean,
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

  // startsNewRecommendGroup: 정보 입력 폼을 새로 제출해서 얻은 응답이면 true로
  // 넘겨받아 새 groupId를 발급한다 — 우선순위 입력 여부 같은 선택 항목에 기대는
  // 텍스트 추론 대신, 호출부(폼 제출 핸들러)가 구조적으로 명시한다.
  const addAIResponse = useCallback(
    (
      response: ConsultResponse,
      request: ConsultInput,
      defaultMode: ConsultInput['mode'],
      startsNewRecommendGroup = false,
    ) => {
      const mergedProfile: ConsultInput = {
        ...request,
        mode: response.mode ?? defaultMode,
        isLoggedIn,
      };
      setProfile(mergedProfile);
      const hasRecommendations = !!response.recommendations?.length;
      setMessages((prev) => {
        // 이 대화에서 이미 한 번이라도 추천을 받은 적이 있으면, 이번 라운드를
        // 요청하게 만든 직전 사용자 발화(퀵리플라이 문구 등)를 detail로 남긴다.
        // 처음 받는 추천이면 detail은 빈 문자열.
        const hasEarlierRound =
          hasRecommendations &&
          prev.some(
            (m) =>
              m.type === 'ai' &&
              m.recommendations &&
              m.recommendations.length > 0,
          );
        const lastMessage = prev[prev.length - 1];
        const recommendDetail = hasEarlierRound
          ? lastMessage?.type === 'user'
            ? lastMessage.sentence
            : ''
          : '';
        // 그룹 경계: 처음 추천이거나 정보 입력 폼을 새로 제출한 경우 새 groupId를
        // 발급한다. 그 외 퀵리플라이 재질의는 직전 라운드의 groupId를 이어받는다.
        const isNewGroup = !hasEarlierRound || startsNewRecommendGroup;
        const previousGroupId = hasRecommendations
          ? [...prev]
              .reverse()
              .find(
                (m): m is Extract<ChatMessage, { type: 'ai' }> =>
                  m.type === 'ai' &&
                  !!m.recommendations &&
                  m.recommendations.length > 0,
              )?.recommendGroupId
          : undefined;
        const recommendGroupId = hasRecommendations
          ? isNewGroup || !previousGroupId
            ? crypto.randomUUID()
            : previousGroupId
          : undefined;
        return [
          ...prev,
          {
            id: Date.now(),
            type: 'ai',
            sentence: formatResponse(response),
            quickReplies: response.quickReplies,
            form: response.form,
            recommendations: response.recommendations,
            recommendTarget: hasRecommendations
              ? buildRecommendTarget(mergedProfile)
              : undefined,
            recommendDetail: hasRecommendations ? recommendDetail : undefined,
            recommendGroupId,
            compareResult: response.compareResult,
            category: modeToCategory(response.mode ?? defaultMode),
          },
        ];
      });
    },
    [isLoggedIn, setProfile, setMessages],
  );

  return { effectiveCurrentPlan, addAIResponse };
}
