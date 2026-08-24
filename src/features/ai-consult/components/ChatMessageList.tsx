import { useEffect, useRef } from 'react';

import { SignupChat } from '@/features/auth';
import type { ConsultInput, RecommendedPlan } from '@/lib/aiConsult';

import AIChat from './AIChat';
import MyChat from './MyChat';
import PlanSubscriptionSheet from './PlanSubscriptionSheet';
import RecommendationCards from './RecommendationCards';
import RecommendationForm from './RecommendationForm';

import type { ChatMessage } from '../types';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onSignupFinished?: () => void;
  onFormSubmit?: (values: Partial<ConsultInput>) => void;
  formDefaults?: Partial<ConsultInput>;
  onPlanSubscribe?: (plan: RecommendedPlan) => void;
  subscriptionOpen?: boolean;
  subscriptionPlan?: RecommendedPlan | null;
  onSubscriptionClose?: () => void;
}

export default function ChatMessageList({
  messages,
  isLoading = false,
  onSignupFinished,
  onFormSubmit,
  formDefaults,
  onPlanSubscribe,
  subscriptionOpen = false,
  subscriptionPlan,
  onSubscriptionClose,
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

            {message.type === 'ai' &&
              message.recommendations &&
              message.recommendations.length > 0 &&
              index === lastIndex && (
                <RecommendationCards
                  plans={message.recommendations}
                  onPlanSubscribe={onPlanSubscribe}
                />
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
        open={subscriptionOpen}
        onOpenChange={onSubscriptionClose ?? (() => {})}
        plan={subscriptionPlan ?? null}
      />
    </div>
  );
}
