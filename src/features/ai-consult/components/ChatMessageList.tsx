import { useEffect, useRef } from 'react';

import { SignupChat } from '@/features/auth';
import type { ConsultInput } from '@/lib/aiConsult';

import AIChat from './AIChat';
import MyChat from './MyChat';
import RecommendationForm from './RecommendationForm';

import type { ChatMessage } from '../types';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onSignupFinished?: () => void;
  onFormSubmit?: (values: Partial<ConsultInput>) => void;
  formDefaults?: Partial<ConsultInput>;
}

export default function ChatMessageList({
  messages,
  isLoading = false,
  onSignupFinished,
  onFormSubmit,
  formDefaults,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    // messages 배열 변화가 아니라 실제 콘텐츠 높이 변화를 감지해야
    // SignupChat처럼 메시지 내부에서 자체 상태로 UI가 늘어나는 경우도 따라 내려간다.
    const scrollToBottom = () =>
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    const observer = new ResizeObserver(scrollToBottom);
    observer.observe(content);
    return () => observer.disconnect();
  }, []);

  const lastIndex = messages.length - 1;

  return (
    <div className="flex-1 overflow-y-auto py-4">

      <div ref={contentRef} className="flex flex-col gap-4 px-4">



        {messages.map((message, index) => (

          <div key={message.id}>
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
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
