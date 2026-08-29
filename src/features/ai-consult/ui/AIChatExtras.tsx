import { ReportCard } from '@/features/consult-report';
import { CompareResultSheet } from '@/features/plan-compare';
import { PlanSelector } from '@/features/plan-subscription';
import type { ConsultInput, RecommendedPlan } from '@/shared/lib/aiConsult';

import RecommendationCards from './RecommendationCards';
import RecommendationForm from './RecommendationForm';

import type { ChatMessage } from '../types';

// AI 메시지의 말풍선 이외 부가 콘텐츠(추천 카드, 레포트, 비교 결과, 요금제 선택기, 폼)를 렌더링
interface AIChatExtrasProps {
  message: Extract<ChatMessage, { type: 'ai' }>;
  isLast: boolean;
  isLoading: boolean;
  isGeneratingReport: boolean;
  onPlanSubscribe?: (plan: RecommendedPlan) => void;
  onPlanCompare?: (plan: RecommendedPlan) => void;
  onSelectCurrentPlan?: (planName: string) => void;
  onSelectTargetPlan?: (planName: string) => void;
  onGenerateReport?: (plans: RecommendedPlan[]) => void;
  onFormSubmit?: (values: Partial<ConsultInput>) => void;
  formDefaults?: Partial<ConsultInput>;
}

export default function AIChatExtras({
  message,
  isLast,
  isLoading,
  isGeneratingReport,
  onPlanSubscribe,
  onPlanCompare,
  onSelectCurrentPlan,
  onSelectTargetPlan,
  onGenerateReport,
  onFormSubmit,
  formDefaults,
}: AIChatExtrasProps) {
  return (
    <>
      {message.recommendations && message.recommendations.length > 0 && (
        <RecommendationCards
          plans={message.recommendations}
          onPlanSubscribe={onPlanSubscribe}
          onPlanCompare={onPlanCompare}
          onGenerateReport={onGenerateReport}
          isLoading={isLoading}
          isGeneratingReport={isGeneratingReport}
        />
      )}

      {message.report && <ReportCard report={message.report} />}

      {message.compareResult && (
        <CompareResultSheet
          result={message.compareResult}
          onSubscribe={() => onPlanSubscribe?.(message.compareResult!.planB)}
        />
      )}

      {message.planSelector && (
        <PlanSelector
          mode={message.planSelectorMode ?? 'current'}
          onSelect={(planName) =>
            message.planSelectorMode === 'target'
              ? onSelectTargetPlan?.(planName)
              : onSelectCurrentPlan?.(planName)
          }
          disabled={isLoading}
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
    </>
  );
}
