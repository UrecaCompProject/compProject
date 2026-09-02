import type { ComponentType } from 'react';

import type {
  ConsultInput,
  RecommendedPlan,
  ReportOutput,
  CompareResult,
} from '@/shared/lib/aiConsult';

import RecommendationCards from './RecommendationCards';
import RecommendationForm from './RecommendationForm';

import type { ChatMessage } from '../types';

// AI 메시지의 말풍선 이외 부가 콘텐츠(추천 카드, 레포트, 비교 결과, 요금제 선택기, 폼)를 렌더링
interface AIChatExtrasSlots {
  ReportCard: ComponentType<{ report: ReportOutput }>;
  CompareResultSheet: ComponentType<{
    result?: CompareResult;
    onSubscribe?: (plan: RecommendedPlan) => void;
    onRecompare?: (planAName: string, planBName: string) => void;
  }>;
}

interface AIChatExtrasProps {
  message: Extract<ChatMessage, { type: 'ai' }>;
  isLast: boolean;
  isLoading: boolean;
  isGeneratingReport: boolean;
  canShowReportButton: boolean;
  onPlanSubscribe?: (plan: RecommendedPlan) => void;
  onPlanCompare?: (plan: RecommendedPlan) => void;
  onRecompare?: (planAName: string, planBName: string) => void;
  onGenerateReport?: (plans: RecommendedPlan[]) => void;
  onFormSubmit?: (values: Partial<ConsultInput>, summary: string) => void;
  formDefaults?: Partial<ConsultInput>;
  slots: AIChatExtrasSlots;
}

export default function AIChatExtras({
  message,
  isLast,
  isLoading,
  onPlanSubscribe,
  onPlanCompare,
  onRecompare,
  onFormSubmit,
  formDefaults,
  slots,
}: AIChatExtrasProps) {
  const hasRecommendations =
    !!message.recommendations && message.recommendations.length > 0;

  return (
    <div>
      {hasRecommendations && message.recommendations && (
        <RecommendationCards
          plans={message.recommendations}
          onPlanSubscribe={onPlanSubscribe}
          onPlanCompare={onPlanCompare}
        />
      )}

      {message.report && <slots.ReportCard report={message.report} />}

      {message.compareResult && (
        <slots.CompareResultSheet
          key={`${message.compareResult.planA.planId}-${message.compareResult.planB.planId}`}
          result={message.compareResult}
          onSubscribe={(plan) => onPlanSubscribe?.(plan)}
          onRecompare={onRecompare}
        />
      )}

      {message.planCompare && (
        <slots.CompareResultSheet
          onSubscribe={(plan) => onPlanSubscribe?.(plan)}
        />
      )}

      {message.form && isLast && onFormSubmit && (
        <div className="mt-3">
          <RecommendationForm
            form={message.form}
            onSubmit={onFormSubmit}
            defaultValues={formDefaults}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
}
