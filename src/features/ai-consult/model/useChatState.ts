import { useCallback, useMemo, useState } from 'react';

import type { ConsultInput } from '@/shared/lib/aiConsult';

import { WELCOME_MESSAGE, getWelcomeQuickReplies } from '../lib/chatHelpers';

import type { ChatMessage } from '../types';

export interface UseChatStateDeps {
  isLoggedIn: boolean;
}

export interface ChatState {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  profile: ConsultInput;
  setProfile: React.Dispatch<React.SetStateAction<ConsultInput>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  resetChat: (options?: { showGreeting?: boolean }) => void;
  aiResponseCount: number;
  canShowReportButton: boolean;
}

export function useChatState({ isLoggedIn }: UseChatStateDeps): ChatState {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      type: 'ai',
      sentence: WELCOME_MESSAGE,
      quickReplies: getWelcomeQuickReplies(isLoggedIn),
    },
  ]);
  const [input, setInput] = useState('');
  const [profile, setProfile] = useState<ConsultInput>({
    mode: 'menu',
    isLoggedIn,
  });
  const [isLoading, setIsLoading] = useState(false);

  const resetChat = useCallback(
    (options?: { showGreeting?: boolean }) => {
      const showGreeting = options?.showGreeting ?? true;
      setMessages(
        showGreeting
          ? [
              {
                id: 0,
                type: 'ai',
                sentence: WELCOME_MESSAGE,
                quickReplies: getWelcomeQuickReplies(isLoggedIn),
              },
            ]
          : [],
      );
      setInput('');
      setProfile({ mode: 'menu', isLoggedIn });
    },
    [isLoggedIn],
  );

  const aiResponseCount = useMemo(
    () => messages.filter((m) => m.type === 'ai' && m.id !== 0).length,
    [messages],
  );

  const lastMessage = messages[messages.length - 1];
  const isAwaitingDetailInput =
    lastMessage?.type === 'ai' &&
    (!!lastMessage.form || !!lastMessage.planCompare);
  const canShowReportButton = aiResponseCount >= 5 && !isAwaitingDetailInput;

  return {
    messages,
    setMessages,
    input,
    setInput,
    profile,
    setProfile,
    isLoading,
    setIsLoading,
    resetChat,
    aiResponseCount,
    canShowReportButton,
  };
}
