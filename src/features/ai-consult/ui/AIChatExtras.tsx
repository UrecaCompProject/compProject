import type { ComponentType } from 'react';

import type {
  ConsultInput,
  RecommendedPlan,
  CompareResult,
} from '@/shared/lib/aiConsult';
import type { PlanDetailItem } from '@/shared/types/plan';

import RecommendationCards from './RecommendationCards';
import RecommendationForm from './RecommendationForm';

import type { ChatMessage } from '../types';

// AI 메시지의 말풍선 이외 부가 콘텐츠(추천 카드, 비교 결과, 요금제 선택기, 폼)를 렌더링.
// 레포트는 말풍선의 '레포트 보기' 버튼이 ReportSheet를 직접 여는 방식으로 대체돼
// 여기서는 더 이상 다루지 않는다.
interface AIChatExtrasSlots {
  CompareResultSheet: ComponentType<{
    result?: CompareResult;
    onSubscribe?: (plan: RecommendedPlan) => void;
    onRecompare?: (planAName: string, planBName: string) => void;
  }>;
  PlanDetailContent: ComponentType<{
    plan: PlanDetailItem | null;
    isLoading: boolean;
    error: string | null;
  }>;
  PlanDetailFooter: ComponentType<{
    onSubscribe: () => void;
    onCompare?: () => void;
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
          PlanDetailContent={slots.PlanDetailContent}
          PlanDetailFooter={slots.PlanDetailFooter}
        />
      )}

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
