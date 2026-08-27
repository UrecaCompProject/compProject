import { useCallback, useEffect, useRef, useState } from 'react';

import { postQuestion } from '@/features/ai-consult/api/postQuestion';
import { saveReport } from '@/features/ai-consult/api/saveReport';
import { formatResponse } from '@/features/ai-consult/utils/formatResponse';
import { useIsLoggedIn } from '@/features/auth';
import type { QuizKind } from '@/features/chat-quiz';
import { generateReport, requestConsult } from '@/lib/aiConsult';
import type {
  ConsultInput,
  RecommendedPlan,
  ReportOutput,
} from '@/lib/aiConsult';

import { useSubscriptionStore } from '../store/useSubscriptionStore';

import { useChatQuiz } from './useChatQuiz';

import type { ChatMessage } from '../types';

const WELCOME_MESSAGE =
  '안녕하세요! AI 요금제 도우미 해리에요.\n\n아래 메뉴에서 원하는 항목을 선택해 주세요.';

function getWelcomeQuickReplies(isLoggedIn: boolean): string[] {
  return isLoggedIn
    ? [
        '요금제 추천받기',
        '요금제 비교하기',
        '요금제 가입하기',
        '게임 하기',
        '출석체크',
        '기타 상담',
      ]
    : ['회원 가입하기', '요금제 추천받기', '요금제 비교하기', '기타 상담'];
}

function getQuizIntent(message: string): QuizKind | null {
  const normalized = message.toLowerCase().replace(/\s+/g, '');
  const shortOxReplies = new Set([
    'ox',
    '오엑스',
    'ox퀴즈',
    '오엑스퀴즈',
    'ox게임',
    '보안퀴즈',
    '보안ox퀴즈',
  ]);
  const shortMultipleChoiceReplies = new Set([
    '통신퀴즈',
    '통신상식퀴즈',
    '통신보안퀴즈',
    '사지선다',
    '사지선다퀴즈',
  ]);

  if (shortOxReplies.has(normalized)) return 'ox';
  if (shortMultipleChoiceReplies.has(normalized)) return 'multiple-choice';

  const wantsToStart = /(할래|할게|하자|해줘|해볼래|시작|진행)/.test(
    normalized,
  );
  if (!wantsToStart) return null;

  if (/(ox|오엑스|보안).*(퀴즈|게임)/.test(normalized)) return 'ox';
  if (/통신.*(퀴즈|게임)/.test(normalized)) return 'multiple-choice';
  return null;
}

function formatFormSummary(values: Partial<ConsultInput>): string {
  const parts: string[] = [];
  if (values.ageGroup) parts.push(`연령대: ${values.ageGroup}`);
  if (values.dataUsage !== undefined)
    parts.push(`데이터: ${values.dataUsage}GB`);
  if (values.budget !== undefined)
    parts.push(`예산: ${values.budget.toLocaleString()}원`);
  if (values.ott && values.ott.length > 0)
    parts.push(`OTT: ${values.ott.join(', ')}`);
  return parts.join(' / ');
}

function findLastRecommendedPlan(
  messages: ChatMessage[],
): RecommendedPlan | null {
  const last = findLastRecommendations(messages);
  return last.length > 0 ? last[0] : null;
}

function findLastRecommendations(messages: ChatMessage[]): RecommendedPlan[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (
      message.type === 'ai' &&
      message.recommendations &&
      message.recommendations.length > 0
    ) {
      return message.recommendations;
    }
  }
  return [];
}

function buildConversationLog(messages: ChatMessage[]): string {
  return messages
    .filter((m) => m.type === 'ai' || m.type === 'user')
    .map((m) => {
      const role = m.type === 'ai' ? 'AI' : '사용자';
      return `${role}: ${m.sentence}`;
    })
    .join('\n');
}

function buildRecommendationResult(recommendations: RecommendedPlan[]): string {
  return recommendations
    .map(
      (p) =>
        `${p.planName} (월 ${p.monthlyFee?.toLocaleString() ?? '-'}원, ${p.reason}, 절감액 ${p.savingAmount.toLocaleString()}원)`,
    )
    .join('\n');
}

export function useChat() {
  const isLoggedIn = useIsLoggedIn();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      type: 'ai',
      sentence: WELCOME_MESSAGE,
      quickReplies: getWelcomeQuickReplies(isLoggedIn),
    },
  ]);
  const {
    startQuiz,
    answerOx,
    selectMultipleChoice,
    confirmMultipleChoice,
    nextQuestion,
  } = useChatQuiz({ setMessages });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ConsultInput>({
    mode: 'menu',
    isLoggedIn,
  });
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] =
    useState<RecommendedPlan | null>(null);
  // 레포트 생성 중 상태를 일반 로딩과 분리해, 비교 로딩 시 레포트 버튼이
  // "생성 중..."으로 잘못 표시되는 문제를 방지
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  // 가입 완료 후 onComplete 호출 표시 — closeSubscription에서 메뉴 복귀
  // 메시지 중복 추가를 방지하기 위해 사용
  const subscriptionCompletedRef = useRef(false);
  // 비교 요청 시 현재 요금제가 없으면 드랍다운 선택 후 비교를 이어가기 위해
  // 대기 중인 비교 대상 요금제명을 보관
  const pendingComparePlanRef = useRef<string | null>(null);
  // "요금제 비교하기" 메뉴에서 현재 요금제 선택 후 비교 대상 선택으로 넘어가는 2단계 플로우
  const [compareFlow, setCompareFlow] = useState<
    'idle' | 'selectingCurrent' | 'selectingTarget'
  >('idle');
  // 2단계 플로우에서 선택된 현재 요금제명 (fetchCompare에 명시적으로 전달)
  const selectedCurrentPlanRef = useRef<string | null>(null);

  const subscribedCurrentPlan = useSubscriptionStore((s) => s.currentPlan);
  const loadCurrentPlan = useSubscriptionStore((s) => s.loadCurrentPlan);

  const wasLoggedInRef = useRef(isLoggedIn);

  const resetChat = useCallback(() => {
    setMessages([
      {
        id: 0,
        type: 'ai',
        sentence: WELCOME_MESSAGE,
        quickReplies: getWelcomeQuickReplies(isLoggedIn),
      },
    ]);
    setInput('');
    setProfile({ mode: 'menu', isLoggedIn });
    setSubscriptionOpen(false);
    setSubscriptionPlan(null);
  }, [isLoggedIn]);

  useEffect(() => {
    if (wasLoggedInRef.current && !isLoggedIn) {
      resetChat();
    } else if (!wasLoggedInRef.current && isLoggedIn) {
      // 채팅 도중 로그인하면 웰컴 메시지의 퀵 리플라이를 로그인 기준으로 갱신합니다.
      setMessages((prev) => {
        if (prev.length === 0 || prev[0].type !== 'ai') return prev;
        return [
          { ...prev[0], quickReplies: getWelcomeQuickReplies(true) },
          ...prev.slice(1),
        ];
      });
    }
    wasLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn, resetChat]);

  // 로그인 시 DB에서 현재 요금제를 로드해 구독 스토어에 반영
  useEffect(() => {
    if (isLoggedIn) {
      loadCurrentPlan().catch(() => {
        // 미가입 사용자 등 조회 실패는 무시
      });
    }
  }, [isLoggedIn, loadCurrentPlan]);

  // 사용자가 직접 입력한 currentPlan이 우선, 없으면 구독 스토어의 값을 사용
  const effectiveCurrentPlan =
    profile.currentPlan ?? subscribedCurrentPlan?.planName;

  const openSubscription = (plan: RecommendedPlan | null) => {
    if (!isLoggedIn) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'ai',
          sentence:
            '요금제 가입은 로그인 후에 가능해요. 회원가입을 진행해주세요.',
          quickReplies: ['회원 가입하기', '기타 상담'],
        },
      ]);
      return;
    }
    setSubscriptionPlan(plan);
    setSubscriptionOpen(true);
  };

  // 가입 시트 닫기 — 단순 닫기(swipe/X) 시에는 기존 마지막 AI 메시지의
  // 퀵리플라이를 그대로 유지하기 위해 새 메시지를 추가하지 않는다.
  // 가입 완료(onComplete) 시에는 handleSignupFinished가 별도 메시지를 추가한다.
  const closeSubscription = (open: boolean) => {
    if (open) return;
    setSubscriptionOpen(false);
    subscriptionCompletedRef.current = false;
  };

  const handleSignupFinished = () => {
    subscriptionCompletedRef.current = true;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'ai',
        sentence: '다른 도움이 필요하시면 아래에서 선택해주세요.',
        quickReplies: getWelcomeQuickReplies(isLoggedIn),
      },
    ]);
  };

  const openSignupChat = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        type: 'signup',
      },
    ]);
  };

  const fetchCompare = async (planBName: string, planAName?: string) => {
    setIsLoading(true);
    try {
      // planAName이 명시적으로 전달되면(드랍다운 선택 직후) 그 값을 우선 사용하고,
      // 아니면 현재 profile/구독 스토어에서 파생된 effectiveCurrentPlan을 사용
      const comparePlanA = planAName ?? effectiveCurrentPlan;
      const request: ConsultInput = {
        ...profile,
        userMessage: '현재 요금제와 비교',
        mode: 'compare',
        isLoggedIn,
        comparePlanA,
        comparePlanB: planBName,
      };
      const response = await requestConsult(request);
      const mergedProfile: ConsultInput = {
        ...request,
        mode: response.mode ?? 'compare',
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
          compareResult: response.compareResult,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '비교 요청 중 문제가 발생했어요. 다시 시도해주세요.';
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: 'ai', sentence: message },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanCompare = (plan: RecommendedPlan) => {
    if (!effectiveCurrentPlan) {
      pendingComparePlanRef.current = plan.planName;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'ai',
          sentence: '현재 이용 중인 요금제를 아래에서 선택해주세요.',
          planSelector: true,
          quickReplies: ['메뉴로 돌아가기'],
        },
      ]);
      return;
    }
    fetchCompare(plan.planName);
  };

  // PlanSelector 드랍다운에서 요금제를 선택했을 때 호출
  // setProfile은 비동기 상태 업데이트라 fetchCompare 클로저에 반영되지 않으므로,
  // 선택한 요금제명을 fetchCompare에 명시적으로 전달
  const handleSelectCurrentPlan = (planName: string) => {
    setProfile((prev) => ({ ...prev, currentPlan: planName }));

    // "요금제 비교하기" 메뉴의 2단계 플로우: 현재 요금제 선택 → 비교 대상 선택
    if (compareFlow === 'selectingCurrent') {
      selectedCurrentPlanRef.current = planName;
      setCompareFlow('selectingTarget');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'ai',
          sentence: '비교할 대상 요금제를 아래에서 선택해주세요.',
          planSelector: true,
          planSelectorMode: 'target',
          quickReplies: ['메뉴로 돌아가기'],
        },
      ]);
      return;
    }

    // "현재 요금제와 비교" 또는 추천 카드의 비교 버튼에서 온 경우:
    // 대기 중인 비교 대상이 있으면 선택 즉시 비교를 이어감
    const pendingPlan = pendingComparePlanRef.current;
    pendingComparePlanRef.current = null;
    if (pendingPlan) {
      fetchCompare(pendingPlan, planName);
    }
  };

  // 비교 대상 요금제 선택 시 호출 (2단계 플로우의 두 번째 단계)
  const handleSelectTargetPlan = (planName: string) => {
    const currentPlan = selectedCurrentPlanRef.current;
    selectedCurrentPlanRef.current = null;
    setCompareFlow('idle');
    if (currentPlan) {
      fetchCompare(planName, currentPlan);
    }
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', sentence: trimmed },
    ]);
    setInput('');

    const quizIntent = getQuizIntent(trimmed);
    if (quizIntent) {
      startQuiz(quizIntent, { includeUserMessage: false });
      return;
    }

    // 회원가입 흐름
    if (trimmed === '회원 가입하기') {
      openSignupChat();
      return;
    }

    // 요금제 가입 흐름
    if (trimmed === '온라인 가입' || trimmed === '요금제 가입하기') {
      if (!isLoggedIn) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'ai',
            sentence:
              '요금제 가입은 로그인 후에 가능해요. 회원가입을 진행해주세요.',
            quickReplies: ['회원 가입하기', '기타 상담'],
          },
        ]);
        return;
      }

      const lastPlan = findLastRecommendedPlan(messages);
      openSubscription(lastPlan ?? null);
      return;
    }

    // 현재 요금제와 마지막 추천 요금제 비교
    if (trimmed === '현재 요금제와 비교') {
      const lastPlan = findLastRecommendedPlan(messages);
      if (!lastPlan) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'ai',
            sentence:
              '비교할 추천 요금제가 없어요. 먼저 요금제 추천을 받아주세요.',
            quickReplies: ['요금제 추천받기', '메뉴로 돌아가기'],
          },
        ]);
        return;
      }
      if (!effectiveCurrentPlan) {
        pendingComparePlanRef.current = lastPlan.planName;
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'ai',
            sentence: '현재 이용 중인 요금제를 아래에서 선택해주세요.',
            planSelector: true,
            quickReplies: ['메뉴로 돌아가기'],
          },
        ]);
        return;
      }
      await fetchCompare(lastPlan.planName);
      return;
    }

    // 요금제 비교하기 메뉴 - 현재 요금제가 없으면 드랍다운으로 선택
    if (trimmed === '요금제 비교하기') {
      if (!effectiveCurrentPlan) {
        setCompareFlow('selectingCurrent');
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'ai',
            sentence: '현재 이용 중인 요금제를 아래에서 선택해주세요.',
            planSelector: true,
            planSelectorMode: 'current',
            quickReplies: ['메뉴로 돌아가기'],
          },
        ]);
        return;
      }
      // 현재 요금제가 있으면 비교 대상 선택 단계로 진행
      setCompareFlow('selectingTarget');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'ai',
          sentence: '비교할 대상 요금제를 아래에서 선택해주세요.',
          planSelector: true,
          planSelectorMode: 'target',
          quickReplies: ['메뉴로 돌아가기'],
        },
      ]);
      return;
    }

    // 이미 추천받은 상태에서 '요금제 추천받기' 재탭 — 새 조건 수집 또는 다른 요금제 분기
    if (trimmed === '요금제 추천받기') {
      const lastRecs = findLastRecommendations(messages);
      if (lastRecs.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'ai',
            sentence:
              '이미 요금제를 추천받으셨어요. 새로운 조건으로 다시 추천받거나, 방금 본 요금제와 다른 요금제를 확인할 수 있어요.',
            quickReplies: [
              '새 조건으로 다시 추천받기',
              '다른 요금제 보기',
              '메뉴로 돌아가기',
            ],
          },
        ]);
        return;
      }
      // 추천받은 적이 없으면 일반 추천 플로우로 진행 (postQuestion으로 fall-through)
    }

    // '다른 요금제 보기' — 이전 추천 planId를 제외하고 같은 조건으로 재추천
    if (trimmed === '다른 요금제 보기') {
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
        const mergedProfile: ConsultInput = {
          ...request,
          mode: response.mode ?? 'recommend',
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
          },
        ]);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : '요청 중 문제가 발생했어요. 다시 시도해주세요.';
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), type: 'ai', sentence: message },
        ]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // '새 조건으로 다시 추천받기' — profile을 리셋하고 폼으로 새 조건 수집
    if (trimmed === '새 조건으로 다시 추천받기') {
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
        const mergedProfile: ConsultInput = {
          ...request,
          mode: response.mode ?? 'recommend',
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
          },
        ]);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : '요청 중 문제가 발생했어요. 다시 시도해주세요.';
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), type: 'ai', sentence: message },
        ]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);

    try {
      const { input: nextProfile, response } = await postQuestion(trimmed, {
        ...profile,
        isLoggedIn,
      });
      const mergedProfile: ConsultInput = {
        ...nextProfile,
        mode: response.mode ?? nextProfile.mode,
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
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '요청 중 문제가 발생했어요. 다시 시도해주세요.';
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: 'ai', sentence: message },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (values: Partial<ConsultInput>) => {
    if (isLoading) return;

    const summary = formatFormSummary(values);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'user',
        sentence: summary || '정보를 입력했습니다.',
      },
    ]);
    setIsLoading(true);

    try {
      const merged: ConsultInput = {
        ...profile,
        ...values,
        userMessage: '정보 입력 완료',
        mode: 'recommend',
        isLoggedIn,
      };
      const response = await requestConsult(merged);
      const mergedProfile: ConsultInput = {
        ...merged,
        mode: response.mode ?? merged.mode,
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
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '요청 중 문제가 발생했어요. 다시 시도해주세요.';
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: 'ai', sentence: message },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async (
    recommendations: RecommendedPlan[],
  ): Promise<ReportOutput | undefined> => {
    if (isLoading || isGeneratingReport || recommendations.length === 0) return;
    setIsGeneratingReport(true);
    setIsLoading(true);

    try {
      const report = await generateReport({
        conversation: buildConversationLog(messages),
        currentPlan: effectiveCurrentPlan || '미등록',
        recommendationResult: buildRecommendationResult(recommendations),
      });
      await saveReport(report);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'ai',
          sentence: `레포트가 생성되어 저장되었어요.\n\n${report.summary}`,
          quickReplies: ['메뉴로 돌아가기'],
          report,
        },
      ]);
      return report;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '레포트 생성 중 문제가 발생했어요. 다시 시도해주세요.';
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: 'ai', sentence: message },
      ]);
    } finally {
      setIsLoading(false);
      setIsGeneratingReport(false);
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    isGeneratingReport,
    handleSend,
    handleSignupFinished,
    handleFormSubmit,
    handleGenerateReport,
    handlePlanCompare,
    handleSelectCurrentPlan,
    handleSelectTargetPlan,
    profile,
    subscriptionOpen,
    subscriptionPlan,
    openSubscription,
    closeSubscription,
    isLoggedIn,
    startQuiz,
    answerOx,
    selectMultipleChoice,
    confirmMultipleChoice,
    nextQuestion,
  };
}
