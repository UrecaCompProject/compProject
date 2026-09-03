import { useCallback } from 'react';
import type { ComponentType, Dispatch, SetStateAction } from 'react';

import { useModalStore } from '@/shared';

import { buildAIMessage } from '../lib/chatHelpers';

import type { ChatMessage } from '../types';

interface SigninModalSlot {
  onSignupClick?: () => void;
}

export interface UseChatAuthGateDeps {
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  signinModal: ComponentType<SigninModalSlot>;
  isSignupInProgress?: boolean;
  onSignupStart?: () => void;
}

export interface ChatAuthGate {
  requireLogin: () => void;
  openSignupChat: () => void;
}

export function useChatAuthGate({
  setMessages,
  signinModal: SigninModal,
  isSignupInProgress = false,
  onSignupStart,
}: UseChatAuthGateDeps): ChatAuthGate {
  const openModal = useModalStore((state) => state.open);

  const openSignupChat = useCallback(() => {
    if (isSignupInProgress) {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (
          last?.type === 'ai' &&
          last.sentence ===
            '회원가입을 먼저 완료하거나 취소한 뒤 이용할 수 있어요.'
        ) {
          return prev;
        }
        return [
          ...prev,
          buildAIMessage(
            '회원가입을 먼저 완료하거나 취소한 뒤 이용할 수 있어요.',
          ),
        ];
      });
      return;
    }

    onSignupStart?.();
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        type: 'signup',
      },
    ]);
  }, [isSignupInProgress, onSignupStart, setMessages]);

  const requireLogin = useCallback(() => {
    openModal({
      title: '로그인',
      content: <SigninModal onSignupClick={openSignupChat} />,
    });
  }, [openModal, openSignupChat, SigninModal]);

  return { requireLogin, openSignupChat };
}
