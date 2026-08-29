import { useState } from 'react';

import { ArrowUp, Menu } from 'lucide-react';

import { useIsLoggedIn, SigninModal } from '@/features/auth';
import type { QuizKind } from '@/features/chat-quiz';
import { Button, Input, useModalStore } from '@/shared';

import ChatMenuSheet from './ChatMenuSheet';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  onStartQuiz?: (quizType: QuizKind) => void;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onStartQuiz,
  disabled = false,
}: ChatInputProps) {
  const isLogin = useIsLoggedIn();
  const openModal = useModalStore((state) => state.open);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const requireLogin = () => {
    openModal({ title: '로그인', content: <SigninModal /> });
  };

  const handleSend = () => {
    if (!isLogin) {
      requireLogin();
      return;
    }
    onSend(value);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-border">
        {isLogin && (
          <Button
            variant="secondary"
            size="icon"
            round
            active={isMenuOpen}
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <Menu size={20} />
          </Button>
        )}
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          onFocus={(e) => {
            if (!isLogin) {
              e.target.blur();
              requireLogin();
            }
          }}
          readOnly={!isLogin}
          placeholder={
            isLogin ? 'AI에게 질문해보세요' : '로그인 후 질문할 수 있습니다'
          }
          disabled={disabled}
          className="flex-1"
        />
        <Button
          variant="primary"
          size="icon"
          round
          onClick={handleSend}
          disabled={disabled || (isLogin && !value.trim())}
        >
          <ArrowUp size={16} />
        </Button>
      </div>

      <ChatMenuSheet
        isMenuOpen={isMenuOpen}
        onMenuClose={() => setIsMenuOpen(false)}
        onStartQuiz={onStartQuiz}
      />
    </div>
  );
}
