import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import {
  ArrowUp,
  Menu,
  UserRound,
  CreditCard,
  Gift,
  FileSpreadsheet,
} from 'lucide-react';

import { useIsLoggedIn } from '@/features/auth';
import EventPage from '@/features/pages/EventPage';
import MainPage from '@/features/pages/MainPage';
import PlanPage from '@/features/pages/PlanPage';
import {
  BottomSheet,
  IconBadge,
  Button,
  Input,
  useClickOutside,
} from '@/features/shared';

interface ActiveSheet {
  title: string;
  content: ReactNode;
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
}: ChatInputProps) {
  const isLogin = useIsLoggedIn();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet | null>(null);
  const handleSend = () => {
    onSend(value);
  };
  const openSheet = (sheet: ActiveSheet) => {
    setActiveSheet(sheet);
    setIsSheetOpen(true);
  };

  useClickOutside(containerRef, isMenuOpen && !isSheetOpen, () =>
    setIsMenuOpen(false),
  );

  return (
    <div className="relative" ref={containerRef}>
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
          placeholder="AI에게 질문해보세요"
          disabled={disabled}
          className="flex-1"
        />
        <Button
          variant="primary"
          size="icon"
          round
          onClick={handleSend}
          disabled={disabled || !value.trim()}
        >
          <ArrowUp size={16} />
        </Button>
      </div>

      {/* bottom sheet menu */}
      <div
        className={`
          overflow-hidden bg-white transition-[max-height] duration-400 ease-in
          ${isMenuOpen ? 'max-h-80 ease-out' : 'max-h-0 ease-in'}
          `}
      >
        <div className="w-full border-t border-border px-5 py-7 text-medium-12-130 text-fg-tertiary">
          <div className="flex justify-between align-center max-w-110 mx-auto">
            <div
              className="flex flex-col gap-2.5 w-15 items-center justify-center cursor-pointer"
              onClick={() =>
                openSheet({ title: '마이페이지', content: <MainPage /> })
              }
            >
              <IconBadge icon={UserRound} size={52} radius={16} />
              <div>마이페이지</div>
            </div>

            <div
              className="flex flex-col gap-2.5 w-15 items-center justify-center cursor-pointer"
              onClick={() =>
                openSheet({ title: '요금제', content: <PlanPage /> })
              }
            >
              <IconBadge icon={CreditCard} size={52} radius={16} />
              <div>요금제</div>
            </div>

            <div
              className="flex flex-col gap-2.5 w-15 items-center justify-center cursor-pointer"
              onClick={() =>
                openSheet({ title: '혜택/이벤트', content: <EventPage /> })
              }
            >
              <IconBadge icon={Gift} size={52} radius={16} />
              <div>혜택/이벤트</div>
            </div>

            <div className="flex flex-col gap-2.5 w-15 items-center justify-center cursor-pointer">
              <IconBadge icon={FileSpreadsheet} size={52} radius={16} />
              <div>상담 리포트</div>
            </div>
          </div>
        </div>
      </div>

      <BottomSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        size="full"
        bodyClassName="p-0"
        title={activeSheet?.title ?? ''}
      >
        {activeSheet?.content}
      </BottomSheet>
    </div>
  );
}
