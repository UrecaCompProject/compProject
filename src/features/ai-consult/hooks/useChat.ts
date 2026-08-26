import { useCallback, useEffect, useRef, useState } from 'react';

import { postQuestion } from '@/features/ai-consult/api/postQuestion';
import { saveReport } from '@/features/ai-consult/api/saveReport';
import { formatResponse } from '@/features/ai-consult/utils/formatResponse';
import { useIsLoggedIn } from '@/features/auth';
import { generateReport, requestConsult } from '@/lib/aiConsult';
import type {
  ConsultInput,
  RecommendedPlan,
  ReportOutput,
} from '@/lib/aiConsult';

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
    : [
        '회원 가입하기',
        '요금제 추천받기',
        '요금제 비교하기',
        '게임 하기',
        '출석체크',
        '기타 상담',
      ];
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
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ConsultInput>({
    mode: 'menu',
    isLoggedIn,
  });
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] =
    useState<RecommendedPlan | null>(null);

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

  const closeSubscription = () => {
    setSubscriptionOpen(false);
  };

  const handleSignupFinished = () => {
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

  const fetchCompare = async (planBName: string) => {
    setIsLoading(true);
    try {
      const request: ConsultInput = {
        ...profile,
        userMessage: '현재 요금제와 비교',
        mode: 'compare',
        isLoggedIn,
        comparePlanA: profile.currentPlan,
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
          recommendations: findLastRecommendations(prev),
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
    if (!profile.currentPlan) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'ai',
          sentence:
            '현재 요금제를 먼저 알려주세요. "현재 요금제: (요금제명)"이라고 입력해주세요.',
          quickReplies: ['메뉴로 돌아가기'],
        },
      ]);
      return;
    }
    fetchCompare(plan.planName);
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', sentence: trimmed },
    ]);
    setInput('');

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
      if (!lastPlan || !profile.currentPlan) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'ai',
            sentence:
              '비교할 요금제 정보가 부족해요. 먼저 현재 요금제와 추천 요금제를 확인해주세요.',
            quickReplies: ['요금제 추천받기', '메뉴로 돌아가기'],
          },
        ]);
        return;
      }
      await fetchCompare(lastPlan.planName);
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
    if (isLoading || recommendations.length === 0) return;
    setIsLoading(true);

    try {
      const report = await generateReport({
        conversation: buildConversationLog(messages),
        currentPlan: profile.currentPlan || '미등록',
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
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSend,
    handleSignupFinished,
    handleFormSubmit,
    handleGenerateReport,
    handlePlanCompare,
    profile,
    subscriptionOpen,
    subscriptionPlan,
    openSubscription,
    closeSubscription,
    isLoggedIn,
  };
}
