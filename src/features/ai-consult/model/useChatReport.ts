import { useCallback, useState } from 'react';

import { saveReport } from '@/features/consult-report';
import { generateReport } from '@/shared/lib/aiConsult';
import type { RecommendedPlan, ReportOutput } from '@/shared/lib/aiConsult';

import {
  buildConversationLog,
  buildErrorMessage,
  buildRecommendationResult,
} from '../lib/chatHelpers';

import type { ChatMessage } from '../types';

interface UseChatReportParams {
  messages: ChatMessage[];
  effectiveCurrentPlan: string | undefined;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

// 레포트 생성 요청과 저장, 결과 메시지 추가를 관리
export function useChatReport({
  messages,
  effectiveCurrentPlan,
  isLoading,
  setIsLoading,
  setMessages,
}: UseChatReportParams) {
  // 레포트 생성 중 상태를 일반 로딩과 분리해, 비교 로딩 시 레포트 버튼이
  // "생성 중..."으로 잘못 표시되는 문제를 방지
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleGenerateReport = useCallback(
    async (
      recommendations: RecommendedPlan[],
    ): Promise<ReportOutput | undefined> => {
      if (isLoading || isGeneratingReport || recommendations.length === 0)
        return;
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
        setMessages((prev) => [
          ...prev,
          buildErrorMessage(
            error,
            '레포트 생성 중 문제가 발생했어요. 다시 시도해주세요.',
          ),
        ]);
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
      setIsLoading,
      setMessages,
    ],
  );

  return {
    isGeneratingReport,
    handleGenerateReport,
  };
}
