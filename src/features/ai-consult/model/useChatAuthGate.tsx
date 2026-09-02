import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';

import { SigninModal } from '@/features/auth';
import { useModalStore } from '@/shared';

import type { ChatMessage } from '../types';

export interface UseChatAuthGateDeps {
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
}

export interface ChatAuthGate {
  requireLogin: () => void;
  openSignupChat: () => void;
}

export function useChatAuthGate({
  setMessages,
}: UseChatAuthGateDeps): ChatAuthGate {
  const openModal = useModalStore((state) => state.open);

  const openSignupChat = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        type: 'signup',
      },
    ]);
  }, [setMessages]);

  const requireLogin = useCallback(() => {
    openModal({
      title: '회원관리',
      content: <SigninModal onSignupClick={openSignupChat} />,
    });
  }, [openModal, openSignupChat]);

  return { requireLogin, openSignupChat };
}
