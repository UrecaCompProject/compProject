import { useEffect, useRef, useState } from 'react';

import { AIChat, MyChat } from '@/features/ai-consult';
import { postQuestion } from '@/features/ai-consult/api/postQuestion';
import { Button, Input } from '@/features/shared';
import type { ConsultInput, ConsultResponse } from '@/lib/aiConsult';

type MessageType = 'ai' | 'user';

interface ChatMessage {
  id: number;
  type: MessageType;
  sentence: string;
  quickReplies?: string[];
}

const WELCOME_MESSAGE =
  '안녕하세요! AI 요금제 도우미 해리에오.🪼\n\n고객님의 평소 사용량과 소비 성향을 분석해서 딱 맞는 최고의 요금제를 맞춤 설계해 드릴게요.\n\n연령대, 월 데이터 사용량, 예산을 알려주시면 추천을 시작합니다.';

// Edge Function 응답을 채팅 버블에 표시할 문장으로 변환합니다.
function formatResponse(response: ConsultResponse): string {
  const parts: string[] = [];
  if (response.notice) parts.push(response.notice);
  if (response.recommendations.length > 0) {
    parts.push('추천 요금제를 알려드릴게요:');
    response.recommendations.forEach((plan, index) => {
      const saving =
        plan.savingAmount > 0
          ? ` (월 ${plan.savingAmount.toLocaleString()}원 절감)`
          : '';
      parts.push(`${index + 1}. ${plan.planName}${saving}\n${plan.reason}`);
    });
  }
  if (parts.length === 0) {
    parts.push(
      '상세 정보를 입력하시면 더 정확한 요금제를 추천해드릴 수 있어요.',
    );
  }
  return parts.join('\n\n');
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, type: 'ai', sentence: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ConsultInput>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', sentence: trimmed },
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const { input: nextProfile, response } = await postQuestion(
        trimmed,
        profile,
      );
      setProfile(nextProfile);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          type: 'ai',
          sentence: formatResponse(response),
          quickReplies: response.quickReplies,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : '요청 중 문제가 발생했어요. 다시 시도해주세요.';
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), type: 'ai', sentence: message },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-49px-45px-16px)] flex-col">
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
              {message.quickReplies && message.quickReplies.length > 0 && (
                <div className="mt-2 ml-9 flex flex-wrap gap-2">
                  {message.quickReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => handleSend(reply)}
                      disabled={isLoading}
                      className="rounded-full border border-brand-promo-primary px-3 py-1.5 text-caption text-brand-promo-primary hover:bg-brand-promo-primary hover:text-white disabled:opacity-50"
                    >
                      {reply}
                    </button>
                  ))}
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
      <div className="flex items-center gap-2 p-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend(input);
          }}
          placeholder="AI에게 질문해보세요"
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          variant="primary"
          onClick={() => handleSend(input)}
          disabled={isLoading || !input.trim()}
        >
          전송
        </Button>
      </div>
    </div>
  );
}
