import { useState } from 'react';

import { postQuestion } from '@/features/ai-consult/api/postQuestion';
import { formatResponse } from '@/features/ai-consult/utils/formatResponse';
import type { ConsultInput } from '@/lib/aiConsult';

import type { ChatMessage } from '../types';

const WELCOME_MESSAGE =
  '안녕하세요! AI 요금제 도우미 해리에요.🪼\n\n아래 메뉴에서 원하는 항목을 선택해 주세요.';

const MENU_QUICK_REPLIES = [
  '회원 가입하기',
  '요금제 추천받기',
  '요금제 비교하기',
  '요금제 가입하기',
  '게임 하기',
  '출석체크',
  '기타 상담',
];

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      type: 'ai',
      sentence: WELCOME_MESSAGE,
      quickReplies: MENU_QUICK_REPLIES,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<ConsultInput>({ mode: 'menu' });

  const handleSignupFinished = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        type: 'ai',
        sentence: '다른 도움이 필요하시면 아래에서 선택해주세요.',
        quickReplies: MENU_QUICK_REPLIES,
      },
    ]);
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: 'user', sentence: trimmed },
    ]);
    setInput('');

    if (trimmed === '온라인 가입') {
      setMessages((prev) => [...prev, { id: Date.now() + 1, type: 'signup' }]);
      return;
    }

    setIsLoading(true);

    try {
      const { input: nextProfile, response } = await postQuestion(
        trimmed,
        profile,
      );
      const mergedProfile: ConsultInput = {
        ...nextProfile,
        mode: response.mode ?? nextProfile.mode,
      };
      setProfile(mergedProfile);
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

  return {
    messages,
    input,
    setInput,
    isLoading,
    handleSend,
    handleSignupFinished,
  };
}
