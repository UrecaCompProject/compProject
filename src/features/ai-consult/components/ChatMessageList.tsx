import { useEffect, useRef } from 'react';

import type { ConsultInput } from '@/lib/aiConsult';

import AIChat from './AIChat';
import MyChat from './MyChat';
import RecommendationForm from './RecommendationForm';

import type { ChatMessage } from '../types';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onFormSubmit?: (values: Partial<ConsultInput>) => void;
  formDefaults?: Partial<ConsultInput>;
}

export default function ChatMessageList({
  messages,
  isLoading = false,
  onFormSubmit,
  formDefaults,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastIndex = messages.length - 1;

  return (
    <div className="flex-1 overflow-y-auto py-4">
      <div className="flex flex-col gap-4 px-4">
        {messages.map((message, index) => (
          <div key={message.id}>
            {message.type === 'ai' ? (
              <AIChat sentence={message.sentence} />
            ) : (
              <div className="flex justify-end">
                <MyChat sentence={message.sentence} />
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
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
