import { useState } from 'react';

import { ArrowUp, Menu, Square } from 'lucide-react';

import { useIsLoggedIn, SigninModal } from '@/features/auth';
import type { QuizKind } from '@/features/chat-quiz';
import { Button, Input, useModalStore } from '@/shared';

import ChatMenuBar from './ChatMenuBar';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  onStop?: () => void;
  onStartQuiz?: (quizType: QuizKind) => void;
  onStartScratch?: (reward?: number) => void;
  onSignupClick?: () => void;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  onStartQuiz,
  onStartScratch,
  onSignupClick,
  disabled = false,
}: ChatInputProps) {
  const isLogin = useIsLoggedIn();
  const openModal = useModalStore((state) => state.open);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const requireLogin = () => {
    openModal({
      title: '회원관리',
      content: <SigninModal onSignupClick={onSignupClick} />,
    });
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
        {disabled ? (
          // 로딩 중 — 정지 버튼 표시
          <Button
            variant="primary"
            size="icon"
            round
            onClick={onStop}
            aria-label="응답 생성 중지"
          >
            <Square size={16} />
          </Button>
        ) : (
          // 대기 중 — 전송 버튼 표시
          <Button
            variant="primary"
            size="icon"
            round
            onClick={handleSend}
            disabled={!isLogin || !value.trim()}
            aria-label="메시지 전송"
          >
            <ArrowUp size={16} />
          </Button>
        )}
      </div>

      <ChatMenuBar
        isMenuOpen={isMenuOpen}
        onMenuClose={() => setIsMenuOpen(false)}
        onStartQuiz={onStartQuiz}
        onStartScratch={onStartScratch}
        onSend={onSend}
      />
    </div>
  );
}
