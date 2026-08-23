import { useEffect, useRef } from 'react';

import AIChat from './AIChat';
import MyChat from './MyChat';

import type { ChatMessage } from '../types';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
}

export default function ChatMessageList({
  messages,
  isLoading = false,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto py-4">
      <div className="flex flex-col gap-4 px-4">
        {messages.map((message) => (
          <div key={message.id}>
            {message.type === 'ai' ? (
              <AIChat sentence={message.sentence} />
            ) : (
              <div className="flex justify-end">
                <MyChat sentence={message.sentence} />
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
