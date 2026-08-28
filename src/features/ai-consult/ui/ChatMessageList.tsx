import { useEffect, useRef } from 'react';

import { SignupChat } from '@/features/auth';
import { ChatQuizMessage } from '@/features/chat-quiz';
import type { QuizQuestionMessage } from '@/features/chat-quiz';
import { ReportCard } from '@/features/consult-report';
import { CompareResultSheet } from '@/features/plan-compare';
import {
  PlanSelector,
  PlanSubscriptionSheet,
} from '@/features/plan-subscription';
import type { ConsultInput, RecommendedPlan } from '@/shared/lib/aiConsult';

import AIChat from './AIChat';
import ChatLoadingIndicator from './ChatLoadingIndicator';
import MyChat from './MyChat';
import RecommendationCards from './RecommendationCards';
import RecommendationForm from './RecommendationForm';

import type { ChatMessage } from '../types';

// AI 메시지의 말풍선 이외 부가 콘텐츠(추천 카드, 레포트, 비교 결과, 요금제 선택기, 폼)를 렌더링
// ChatMessageList의 message.type === 'ai' 반복 조건을 하나로 통합해 가독성 향상
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

function AIChatExtras({
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

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  isGeneratingReport?: boolean;
  onSignupFinished?: () => void;
  onFormSubmit?: (values: Partial<ConsultInput>) => void;
  formDefaults?: Partial<ConsultInput>;
  onPlanSubscribe?: (plan: RecommendedPlan) => void;
  onPlanCompare?: (plan: RecommendedPlan) => void;
  onSelectCurrentPlan?: (planName: string) => void;
  onSelectTargetPlan?: (planName: string) => void;
  onGenerateReport?: (plans: RecommendedPlan[]) => void;
  subscriptionOpen?: boolean;
  subscriptionPlan?: RecommendedPlan | null;
  onSubscriptionClose?: (open: boolean) => void;
  onQuizOxAnswer: (messageId: number, answer: 'o' | 'x') => void;
  onQuizMultipleChoiceSelect: (messageId: number, optionId: string) => void;
  onQuizMultipleChoiceConfirm: (message: QuizQuestionMessage) => void;
  onQuizNext: () => void;
}

export default function ChatMessageList({
  messages,
  isLoading = false,
  isGeneratingReport = false,
  onSignupFinished,
  onFormSubmit,
  formDefaults,
  onPlanSubscribe,
  onPlanCompare,
  onSelectCurrentPlan,
  onSelectTargetPlan,
  onGenerateReport,
  subscriptionOpen = false,
  subscriptionPlan,
  onSubscriptionClose,
  onQuizOxAnswer,
  onQuizMultipleChoiceSelect,
  onQuizMultipleChoiceConfirm,
  onQuizNext,
}: ChatMessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    // 새 메시지가 끝까지 안 보이더라도, 맨 아래로 붙이기보다는
    // 새로 추가된(또는 SignupChat처럼 내부 상태로 늘어난) 마지막 메시지의
    // 시작 지점이 화면 위쪽에 오도록 스크롤해 처음부터 읽을 수 있게 한다.
    // scrollIntoView는 overflow-hidden인 상위 Layout까지 스크롤시켜 레이아웃이 깨지므로
    // 스크롤 컨테이너에만 직접 scrollTo를 호출한다.
    const scrollToLastMessageTop = () => {
      const target = lastMessageRef.current;
      if (!target) return;

      // 폼 입력 중 유효성 에러 문구가 붙었다 떨어지거나, 모바일 키보드가
      // 열고 닫힐 때도 content 크기가 바뀌어 이 콜백이 실행된다.
      // 입력 필드에 포커스가 가 있는 동안은 사용자가 타이핑 중인 것이므로
      // 스크롤을 강제로 튕기지 않고 건너뛴다. (버튼 클릭으로 넘어가는
      // 회원가입 단계 전환 등은 포커스가 버튼에 있어 계속 자동 스크롤된다.)
      const active = document.activeElement;
      if (
        active instanceof HTMLElement &&
        container.contains(active) &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(active.tagName)
      ) {
        return;
      }

      const offset =
        target.getBoundingClientRect().top -
        container.getBoundingClientRect().top +
        container.scrollTop;
      container.scrollTo({ top: offset, behavior: 'smooth' });
    };
    const observer = new ResizeObserver(scrollToLastMessageTop);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const lastIndex = messages.length - 1;

  return (
    <div
      ref={scrollContainerRef}
      className="min-h-0 flex-1 overflow-y-auto py-4"
    >
      <div ref={contentRef} className="flex flex-col gap-4 px-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            ref={index === lastIndex ? lastMessageRef : undefined}
          >
            {message.type === 'ai' && (
              <>
                <AIChat
                  sentence={message.sentence}
                  variant={message.isError ? 'error' : 'default'}
                />
                <AIChatExtras
                  message={message}
                  isLast={index === lastIndex}
                  isLoading={isLoading}
                  isGeneratingReport={isGeneratingReport}
                  onPlanSubscribe={onPlanSubscribe}
                  onPlanCompare={onPlanCompare}
                  onSelectCurrentPlan={onSelectCurrentPlan}
                  onSelectTargetPlan={onSelectTargetPlan}
                  onGenerateReport={onGenerateReport}
                  onFormSubmit={onFormSubmit}
                  formDefaults={formDefaults}
                />
              </>
            )}
            {message.type === 'user' && (
              <div className="flex justify-end">
                <MyChat sentence={message.sentence} />
              </div>
            )}

            {message.type === 'signup' && (
              <SignupChat onFinish={onSignupFinished} />
            )}

            {(message.type === 'quiz-question' ||
              message.type === 'quiz-result') && (
              <ChatQuizMessage
                message={message}
                onOxAnswer={onQuizOxAnswer}
                onMultipleChoiceSelect={onQuizMultipleChoiceSelect}
                onMultipleChoiceConfirm={onQuizMultipleChoiceConfirm}
                onNext={onQuizNext}
              />
            )}
          </div>
        ))}
        {isLoading && <ChatLoadingIndicator />}
      </div>

      <PlanSubscriptionSheet
        key={
          subscriptionOpen ? (subscriptionPlan?.planId ?? 'catalog') : 'closed'
        }
        open={subscriptionOpen}
        onOpenChange={onSubscriptionClose ?? (() => {})}
        plan={subscriptionPlan ?? null}
        onComplete={onSignupFinished}
      />
    </div>
  );
}
