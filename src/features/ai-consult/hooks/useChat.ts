import { useState } from 'react';

import { postQuestion } from '@/features/ai-consult/api/postQuestion';
import { formatResponse } from '@/features/ai-consult/utils/formatResponse';
import type { ConsultInput } from '@/lib/aiConsult';

import type { ChatMessage } from '../types';

const WELCOME_MESSAGE =
  '안녕하세요! AI 요금제 도우미 해리에오.🪼\n\n고객님의 평소 사용량과 소비 성향을 분석해서 딱 맞는 최고의 요금제를 맞춤 설계해 드릴게요.\n\n연령대, 월 데이터 사용량, 예산을 알려주시면 추천을 시작합니다.';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, type: 'ai', sentence: WELCOME_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ConsultInput>({});

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

  return { messages, input, setInput, isLoading, handleSend };
}
