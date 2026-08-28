import type { QuizKind } from '@/features/chat-quiz';
import type {
  ConsultInput,
  ConsultResponse,
  RecommendedPlan,
} from '@/shared/lib/aiConsult';
import { requestConsult } from '@/shared/lib/aiConsult';

import {
  buildAIMessage,
  buildErrorMessage,
  findLastRecommendedPlan,
  findLastRecommendations,
  getQuizIntent,
} from './chatHelpers';

import type { ChatMessage } from '../types';

type SetMessages = React.Dispatch<React.SetStateAction<ChatMessage[]>>;
type AddAIResponse = (
  response: ConsultResponse,
  request: ConsultInput,
  defaultMode: ConsultInput['mode'],
) => void;

export interface QuickReplyContext {
  text: string;
  messages: ChatMessage[];
  profile: ConsultInput;
  isLoggedIn: boolean;
  effectiveCurrentPlan: string | undefined;
  setMessages: SetMessages;
  setProfile: (p: ConsultInput) => void;
  setIsLoading: (v: boolean) => void;
  addAIResponse: AddAIResponse;
  openSubscription: (plan: RecommendedPlan | null) => void;
  openSignupChat: () => void;
  startCompareFlow: () => void;
  setPendingComparePlan: (planName: string) => void;
  fetchCompare: (planBName: string, planAName?: string) => Promise<void>;
  startQuiz: (kind: QuizKind, opts?: { includeUserMessage: boolean }) => void;
  // "다시 시도" 시 마지막 사용자 입력을 재전송 — useChat의 lastUserInputRef와 handleSend 재귀 호출을 캡슐화
  retryLastInput: () => void;
}

export type QuickReplyResult = 'handled' | 'continue';

// handleSend 내 quick reply 분기를 하나의 라우터로 추출
// 매칭되는 분기가 있으면 'handled', 없으면 'continue'를 반환해 fall-through
export async function routeQuickReply(
  ctx: QuickReplyContext,
): Promise<QuickReplyResult> {
  const {
    text,
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
    retryLastInput,
  } = ctx;

  // "다시 시도" 퀵리플라이 — 마지막 사용자 입력을 재전송
  if (text === '다시 시도') {
    retryLastInput();
    return 'handled';
  }

  // 퀴즈 의도 감지 — "OX 퀴즈 하자", "통신 상식 퀴즈" 등
  const quizIntent = getQuizIntent(text);
  if (quizIntent) {
    startQuiz(quizIntent, { includeUserMessage: false });
    return 'handled';
  }

  // 회원가입 흐름
  if (text === '회원 가입하기') {
    openSignupChat();
    return 'handled';
  }

  // 요금제 가입 흐름
  if (text === '온라인 가입' || text === '요금제 가입하기') {
    if (!isLoggedIn) {
      setMessages((prev) => [
        ...prev,
        buildAIMessage(
          '요금제 가입은 로그인 후에 가능해요. 회원가입을 진행해주세요.',
          ['회원 가입하기', '기타 상담'],
        ),
      ]);
      return 'handled';
    }

    const lastPlan = findLastRecommendedPlan(messages);
    openSubscription(lastPlan ?? null);
    return 'handled';
  }

  // 현재 요금제와 마지막 추천 요금제 비교
  if (text === '현재 요금제와 비교') {
    const lastPlan = findLastRecommendedPlan(messages);
    if (!lastPlan) {
      setMessages((prev) => [
        ...prev,
        buildAIMessage(
          '비교할 추천 요금제가 없어요. 먼저 요금제 추천을 받아주세요.',
          ['요금제 추천받기', '메뉴로 돌아가기'],
        ),
      ]);
      return 'handled';
    }
    if (!effectiveCurrentPlan) {
      setPendingComparePlan(lastPlan.planName);
      setMessages((prev) => [
        ...prev,
        buildAIMessage(
          '현재 이용 중인 요금제를 아래에서 선택해주세요.',
          ['메뉴로 돌아가기'],
          { planSelector: true },
        ),
      ]);
      return 'handled';
    }
    await fetchCompare(lastPlan.planName);
    return 'handled';
  }

  // 요금제 비교하기 메뉴 - 현재 요금제가 없으면 드랍다운으로 선택
  if (text === '요금제 비교하기') {
    startCompareFlow();
    return 'handled';
  }

  // 이미 추천받은 상태에서 '요금제 추천받기' 재탭 — 새 조건 수집 또는 다른 요금제 분기
  if (text === '요금제 추천받기') {
    const lastRecs = findLastRecommendations(messages);
    if (lastRecs.length > 0) {
      setMessages((prev) => [
        ...prev,
        buildAIMessage(
          '이미 요금제를 추천받으셨어요. 새로운 조건으로 다시 추천받거나, 방금 본 요금제와 다른 요금제를 확인할 수 있어요.',
          ['새 조건으로 다시 추천받기', '다른 요금제 보기', '메뉴로 돌아가기'],
        ),
      ]);
      return 'handled';
    }
    // 추천받은 적이 없으면 일반 추천 플로우로 진행 (postQuestion으로 fall-through)
  }

  // '다른 요금제 보기' — 이전 추천 planId를 제외하고 같은 조건으로 재추천
  if (text === '다른 요금제 보기') {
    const lastRecs = findLastRecommendations(messages);
    const excludePlanIds = lastRecs.map((r) => r.planId);
    setIsLoading(true);
    try {
      const request: ConsultInput = {
        ...profile,
        userMessage: '다른 요금제 보기',
        mode: 'recommend',
        isLoggedIn,
        excludePlanIds,
      };
      const response = await requestConsult(request);
      addAIResponse(response, request, 'recommend');
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
    return 'handled';
  }

  // '새 조건으로 다시 추천받기' — profile을 리셋하고 폼으로 새 조건 수집
  if (text === '새 조건으로 다시 추천받기') {
    const resetProfile: ConsultInput = {
      mode: 'recommend',
      isLoggedIn,
    };
    setProfile(resetProfile);
    setIsLoading(true);
    try {
      const request: ConsultInput = {
        ...resetProfile,
        userMessage: '새 조건으로 다시 추천받기',
      };
      const response = await requestConsult(request);
      addAIResponse(response, request, 'recommend');
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
    return 'handled';
  }

  return 'continue';
}
