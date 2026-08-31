import { useCallback, useState } from 'react';

import { saveReport } from '@/features/consult-report';
import { generateReport } from '@/shared/lib/aiConsult';
import type {
  ConsultInput,
  RecommendedPlan,
  ReportOutput,
} from '@/shared/lib/aiConsult';

import {
  buildConversationLog,
  buildErrorMessage,
  buildRecommendationResult,
} from '../lib/chatHelpers';

import type { ChatMessage } from '../types';

interface UseChatReportParams {
  messages: ChatMessage[];
  effectiveCurrentPlan: string | undefined;
  userProfile: ConsultInput;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  resetChat: () => void;
  getSignal?: () => AbortSignal | undefined;
}

// 상담에 확정된 사용자 조건을 문자열로 요약
function buildUserProfile(profile: ConsultInput): string {
  const parts: string[] = [];
  if (profile.ageGroup) parts.push(`연령대: ${profile.ageGroup}`);
  if (profile.dataUsage !== undefined)
    parts.push(`월 데이터: ${profile.dataUsage}GB`);
  if (profile.voiceUsage !== undefined)
    parts.push(`월 통화: ${profile.voiceUsage}분`);
  if (profile.smsUsage !== undefined)
    parts.push(`월 문자: ${profile.smsUsage}건`);
  if (profile.budget !== undefined)
    parts.push(`예산: ${profile.budget.toLocaleString()}원`);
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
  userProfile,
  isLoading,
  setIsLoading,
  setMessages,
  resetChat,
  getSignal,
}: UseChatReportParams) {
  // 레포트 생성 중 상태를 일반 로딩과 분리해, 비교 로딩 시 레포트 버튼이
  // "생성 중..."으로 잘못 표시되는 문제를 방지
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleGenerateReport = useCallback(
    async (
      recommendations: RecommendedPlan[],
    ): Promise<ReportOutput | undefined> => {
      if (isLoading || isGeneratingReport) return;
      // 요금제 추천이 없으면 일반 대화 요약 리포트로 생성
      const reportKind: 'plan' | 'general' =
        recommendations.length > 0 ? 'plan' : 'general';
      setIsGeneratingReport(true);
      setIsLoading(true);

      try {
        const report = await generateReport(
          {
            conversation: buildConversationLog(messages),
            currentPlan: effectiveCurrentPlan || '미등록',
            recommendationResult: buildRecommendationResult(recommendations),
            reportKind,
            userProfile: buildUserProfile(userProfile),
          },
          getSignal?.(),
        );
        await saveReport(report, recommendations);
        // 리포트 결과만 남기고 채팅방을 웰컱+리포트 상태로 초기화
        resetChat();
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
        // AbortError는 useChat의 handleStop에서 처리하므로 여기서는 조용히 무시
        if (error instanceof DOMException && error.name === 'AbortError')
          return;
        setMessages((prev) => [...prev, buildErrorMessage(error)]);
      } finally {
        setIsLoading(false);
        setIsGeneratingReport(false);
      }
    },
    [
      isLoading,
      isGeneratingReport,
      messages,
      effectiveCurrentPlan,
      userProfile,
      setIsLoading,
      setMessages,
      resetChat,
      getSignal,
    ],
  );

  return {
    isGeneratingReport,
    handleGenerateReport,
  };
}
