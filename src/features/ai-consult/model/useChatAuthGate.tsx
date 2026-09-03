import { useCallback } from 'react';
import type { ComponentType, Dispatch, SetStateAction } from 'react';

import { useModalStore } from '@/shared';

import type { ChatMessage } from '../types';

interface SigninModalSlot {
  onSignupClick?: () => void;
}

export interface UseChatAuthGateDeps {
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  signinModal: ComponentType<SigninModalSlot>;
}

export interface ChatAuthGate {
  requireLogin: () => void;
  openSignupChat: () => void;
}

export function useChatAuthGate({
  setMessages,
  signinModal: SigninModal,
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
  }, [openModal, openSignupChat, SigninModal]);

  return { requireLogin, openSignupChat };
}
