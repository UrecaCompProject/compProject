import { useEffect, useRef } from 'react';

import { SignupChat } from '@/features/auth';
import type { ConsultInput, RecommendedPlan } from '@/lib/aiConsult';

import AIChat from './AIChat';
import ChatQuizMessage from './ChatQuizMessage';
import MyChat from './MyChat';
import PlanSubscriptionSheet from './PlanSubscriptionSheet';
import RecommendationCards from './RecommendationCards';
import RecommendationForm from './RecommendationForm';

import type { ChatMessage, QuizQuestionMessage } from '../types';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onSignupFinished?: () => void;
  onFormSubmit?: (values: Partial<ConsultInput>) => void;
  formDefaults?: Partial<ConsultInput>;
  onPlanSubscribe?: (plan: RecommendedPlan) => void;
  onGenerateReport?: (plans: RecommendedPlan[]) => void;
  subscriptionOpen?: boolean;
  subscriptionPlan?: RecommendedPlan | null;
  onSubscriptionClose?: () => void;
  onQuizOxAnswer: (messageId: number, answer: 'o' | 'x') => void;
  onQuizMultipleChoiceSelect: (messageId: number, optionId: string) => void;
  onQuizMultipleChoiceConfirm: (message: QuizQuestionMessage) => void;
  onQuizNext: () => void;
}

export default function ChatMessageList({
  messages,
  isLoading = false,
  onSignupFinished,
  onFormSubmit,
  formDefaults,
  onPlanSubscribe,
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
    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto py-4">
      <div ref={contentRef} className="flex flex-col gap-4 px-4">
        {messages.map((message, index) => (
          <div
            key={message.id}
            ref={index === lastIndex ? lastMessageRef : undefined}
          >
            {message.type === 'ai' && <AIChat sentence={message.sentence} />}
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

            {message.type === 'ai' &&
              message.recommendations &&
              message.recommendations.length > 0 &&
              index === lastIndex && (
                <RecommendationCards
                  plans={message.recommendations}
                  onPlanSubscribe={onPlanSubscribe}
                  onGenerateReport={onGenerateReport}
                  isLoading={isLoading}
                />
              )}

            {message.type === 'ai' && message.report && index === lastIndex && (
              <div className="mt-3 rounded-2xl bg-surface-page p-4 border border-border space-y-3">
                <h4 className="text-body font-semibold text-fg-primary">
                  상담 레포트
                </h4>
                <div className="space-y-2 text-body-sm text-fg-secondary">
                  {message.report.currentPlan && (
                    <p>현재 요금제: {message.report.currentPlan}</p>
                  )}
                  {message.report.recommendedPlans.length > 0 && (
                    <p>
                      추천 요금제: {message.report.recommendedPlans.join(', ')}
                    </p>
                  )}
                  {message.report.monthlySavingAmount > 0 && (
                    <p>
                      예상 월 절감액:{' '}
                      {message.report.monthlySavingAmount.toLocaleString()}원
                    </p>
                  )}
                  {message.report.importantConditions.length > 0 && (
                    <p>
                      주요 조건: {message.report.importantConditions.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {message.type === 'ai' &&
              message.form &&
              index === lastIndex &&
              onFormSubmit && (
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
        ))}
        {isLoading && (
          <div className="text-caption text-fg-disabled">
            해리가 생각 중이에요...
          </div>
        )}
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
