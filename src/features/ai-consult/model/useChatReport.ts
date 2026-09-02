import { useCallback, useState } from 'react';

import { saveReport } from '@/features/consult-report';
import { generateReport } from '@/shared/lib/aiConsult';
import type {
  ConsultInput,
  RecommendedPlan,
  ReportOutput,
} from '@/shared/lib/aiConsult';

import {
  BUDGET_BUCKETS,
  DATA_USAGE_BUCKETS,
  findBucketLabel,
} from '../constants/consultBuckets';
import {
  buildConversationLog,
  buildErrorMessage,
  findAllRecommendationGroups,
  findLastCompareResult,
  getWelcomeQuickReplies,
} from '../lib/chatHelpers';

import type { ChatMessage } from '../types';

interface UseChatReportParams {
  messages: ChatMessage[];
  effectiveCurrentPlan: string | undefined;
  changedPlan: RecommendedPlan | null;
  userProfile: ConsultInput;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  resetChat: (options?: { showGreeting?: boolean }) => void;
  startRequest: () => AbortSignal;
  clearRequest: (signal?: AbortSignal) => void;
}

// 상담에 확정된 사용자 조건을 문자열로 요약
// dataUsage/budget은 실제로는 "5GB ~ 10GB" 같은 구간 칩으로 입력받고 대표값(정수)만
// 저장하므로, 레포트에는 그 대표값이 아니라 사용자가 실제로 고른 구간 라벨을 되찾아 넣는다.
function buildUserProfile(profile: ConsultInput): string {
  const parts: string[] = [];
  if (profile.ageGroup) parts.push(`연령대: ${profile.ageGroup}`);
  if (profile.dataUsage !== undefined) {
    const label = findBucketLabel(DATA_USAGE_BUCKETS, profile.dataUsage);
    parts.push(`월 데이터: ${label ?? `${profile.dataUsage}GB`}`);
  }
  if (profile.voiceUsage !== undefined)
    parts.push(`월 통화: ${profile.voiceUsage}분`);
  if (profile.smsUsage !== undefined)
    parts.push(`월 문자: ${profile.smsUsage}건`);
  if (profile.budget !== undefined) {
    const label = findBucketLabel(BUDGET_BUCKETS, profile.budget);
    parts.push(`예산: ${label ?? `${profile.budget.toLocaleString()}원`}`);
  }
  if (profile.ott && profile.ott.length > 0)
    parts.push(`필수 OTT: ${profile.ott.join(', ')}`);
  if (profile.priority) parts.push(`우선순위: ${profile.priority}`);
  if (profile.currentPlan) parts.push(`현재 요금제: ${profile.currentPlan}`);
  return parts.length > 0 ? parts.join('\n') : '미등록';
}

// 레포트 생성 요청과 저장, 결과 메시지 추가를 관리
export function useChatReport({
  messages,
  effectiveCurrentPlan,
  changedPlan,
  userProfile,
  isLoading,
  setIsLoading,
  setMessages,
  resetChat,
  startRequest,
  clearRequest,
}: UseChatReportParams) {
  // 레포트 생성 중 상태를 일반 로딩과 분리해, 비교 로딩 시 레포트 버튼이
  // "생성 중..."으로 잘못 표시되는 문제를 방지
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleGenerateReport = useCallback(async (): Promise<
    ReportOutput | undefined
  > => {
    if (isLoading || isGeneratingReport) return;
    // 상담 중 "요금제 추천받기"가 요청된 횟수만큼 라운드를 모두 모은다
    // (여러 번 추천받았으면 recommendedPlans에도 그만큼 여러 개가 들어간다).
    const recommendedGroups = findAllRecommendationGroups(messages);
    // 요금제 추천이 한 번도 없었으면 일반 대화 요약 리포트로 생성
    const reportKind: 'plan' | 'general' =
      recommendedGroups.length > 0 ? 'plan' : 'general';
    setIsGeneratingReport(true);
    setIsLoading(true);

    const signal = startRequest();

    const conversation = buildConversationLog(messages);

    try {
      const otherNotes = await generateReport(
        {
          conversation,
          reportKind,
          userProfile: buildUserProfile(userProfile),
          currentPlan: effectiveCurrentPlan,
          changedPlan,
        },
        signal,
      );
      // changedPlan이 있으면 AI가 생성한 "기존 요금제 대비 좋은 점"을
      // reason에 반영해, PlanCard가 그대로 표시하도록 한다.
      const reportChangedPlan =
        changedPlan && otherNotes.changedPlanAdvantage
          ? { ...changedPlan, reason: otherNotes.changedPlanAdvantage }
          : changedPlan;
      const report: ReportOutput = {
        currentPlan: effectiveCurrentPlan || '미등록',
        recommendedPlans: recommendedGroups,
        comparedPlan: findLastCompareResult(messages),
        changedPlan: reportChangedPlan,
        otherNotes,
      };
      console.log('[레포트 생성 결과]', report);
      await saveReport(report);
      // 리포트 결과만 남기고 채팅방을 초기화 — 결과 바로 위에 해리 인삿말이
      // 끼어들지 않도록 웰컴 메시지는 생략한다.
      resetChat({ showGreeting: false });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'ai',
          sentence: `레포트가 생성되어 저장되었어요.\n\n${report.otherNotes.summary}`,
          quickReplies: getWelcomeQuickReplies(userProfile.isLoggedIn ?? false),
          report,
          category: reportKind,
        },
      ]);
      return report;
    } catch (error) {
      // 사용자가 의도적으로 중지한 경우 — 중지 안내 메시지 표시
      if (error instanceof DOMException && error.name === 'AbortError') {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: 'ai' as const,
            sentence:
              '레포트 생성을 중지했어요. 다시 시도하거나 새 질문을 입력해 주세요.',
            quickReplies: ['메뉴로 돌아가기'],
          },
        ]);
        return;
      }
      setMessages((prev) => [...prev, buildErrorMessage(error)]);
    } finally {
      setIsLoading(false);
      setIsGeneratingReport(false);
      clearRequest(signal);
    }
  }, [
    isLoading,
    isGeneratingReport,
    messages,
    effectiveCurrentPlan,
    changedPlan,
    userProfile,
    setIsLoading,
    setMessages,
    resetChat,
    startRequest,
    clearRequest,
  ]);

  return {
    isGeneratingReport,
    handleGenerateReport,
  };
}
