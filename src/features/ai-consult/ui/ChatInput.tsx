import { useState } from 'react';

import { ArrowUp, Menu, Square } from 'lucide-react';

import { Button, Input } from '@/shared';
import type { GameInfrastructure } from '@/shared/types/games';
import type { QuizKind } from '@/shared/types/quiz';

import ChatMenuBar, { type ChatMenuBarSlots } from './ChatMenuBar';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  onStop?: () => void;
  onStartQuiz?: (quizType: QuizKind) => void;
  onStartScratch?: (reward?: number) => void;
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  disabled?: boolean;
  game: GameInfrastructure;
  menuSlots: ChatMenuBarSlots;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  onStartQuiz,
  onStartScratch,
  isLoggedIn,
  onRequireLogin,
  disabled = false,
  game,
  menuSlots,
}: ChatInputProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSend = () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    onSend(value);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-4 py-3 bg-white border-t border-border">
        {isLoggedIn && (
          <Button
            variant="secondary"
            size="icon"
            round
            // active={isMenuOpen}
            // ChatMenuBar의 useClickOutside가 pointerdown에서 먼저 닫아버린 뒤
            // 같은 클릭의 click 이벤트가 다시 열어버리는 것을 막기 위해 전파를 막는다.
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu size={20} />
          </Button>
        )}
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            // 한글 입력 조합 중(IME)의 Enter는 조합 확정용이므로 전송하지 않는다.
            // 조합 확정 Enter까지 전송으로 처리하면 같은 입력이 두 번 전송된다.
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleSend();
          }}
          onFocus={(e) => {
            if (!isLoggedIn) {
              e.target.blur();
              onRequireLogin();
            }
          }}
          readOnly={!isLoggedIn}
          placeholder={
            isLoggedIn ? 'AI에게 질문해보세요' : '로그인 후 질문할 수 있습니다'
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
            disabled={!isLoggedIn || !value.trim()}
            aria-label="메시지 전송"
          >
            <ArrowUp size={16} />
          </Button>
        )}
      </div>

      <ChatMenuBar
        isMenuOpen={isMenuOpen}
        onMenuClose={() => setIsMenuOpen(false)}
        game={game}
        onStartQuiz={onStartQuiz}
        onStartScratch={onStartScratch}
        onSend={onSend}
        slots={menuSlots}
      />
    </div>
  );
}
