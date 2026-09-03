import type { ComponentType } from 'react';
import { useEffect, useRef } from 'react';

import { UserRound, CreditCard, Gift, FileSpreadsheet } from 'lucide-react';

import { IconBadge, useClickOutside } from '@/shared';
import type { GameInfrastructure } from '@/shared/types/games';
import type { QuizKind } from '@/shared/types/quiz';

import {
  useChatMenuSheetStore,
  type ChatMenuSheet,
} from '../model/useChatMenuSheetStore';

export interface ChatMenuBarSlots {
  MyPageSheet: ComponentType<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRequestPlanRecommend?: () => void;
  }>;
  PlanQuickSheet: ComponentType<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }>;
  RewardSheet: ComponentType<{
    game: GameInfrastructure;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onStartQuiz?: (quizType: QuizKind) => void;
    onStartScratch?: (reward?: number) => void;
  }>;
  ReportSheet: ComponentType<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }>;
}

interface ChatMenuBarProps {
  isMenuOpen: boolean;
  onMenuClose: () => void;
  game: GameInfrastructure;
  onStartQuiz?: (quizType: QuizKind) => void;
  onStartScratch?: (reward?: number) => void;
  onSend?: (text: string) => void;
  disabled?: boolean;
  slots: ChatMenuBarSlots;
}

// 채팅 입력창 위 메뉴 아이콘 바(마이페이지, 요금제, 혜택/이벤트, 상담 리포트)와
// 각 메뉴가 여는 BottomSheet들을 관리
export default function ChatMenuBar({
  isMenuOpen,
  onMenuClose,
  game,
  onStartQuiz,
  onStartScratch,
  onSend,
  disabled = false,
  slots,
}: ChatMenuBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // 시트 열림 상태는 스토어에 둔다 — 메뉴 아이콘 클릭뿐 아니라 "마이페이지
  // 보여줘"처럼 채팅으로 요청했을 때(quickReplyRouter)도 열 수 있어야 하기 때문.
  const openSheet = useChatMenuSheetStore((s) => s.openSheet);
  const setOpenSheet = useChatMenuSheetStore((s) => s.setOpenSheet);
  const sheetHandlers = (sheet: ChatMenuSheet) => ({
    open: !disabled && openSheet === sheet,
    onOpenChange: (next: boolean) => {
      if (disabled) return;
      setOpenSheet(next ? sheet : null);
    },
  });

  useClickOutside(containerRef, isMenuOpen && openSheet === null, onMenuClose);

  // 채팅 화면을 벗어나면 열려 있던 시트 상태를 초기화한다(스토어가 모듈 전역이라
  // 다시 들어왔을 때 시트가 저절로 열리는 것을 막음).
  useEffect(() => () => setOpenSheet(null), [setOpenSheet]);

  return (
    <div className="relative" ref={containerRef}>
      {/* 메뉴 아이콘 바 */}
      <div
        className={`
          overflow-hidden bg-white transition-[max-height] duration-400 ease-in
          ${isMenuOpen ? 'max-h-80 ease-out' : 'max-h-0 ease-in'}
        `}
      >
        <div className="w-full border-t border-border px-5 py-7 text-medium-12-130 text-fg-tertiary">
          <div className="flex justify-between items-center max-w-110 mx-auto">
            <button
              type="button"
              className="flex flex-col gap-2.5 w-15 items-center justify-center cursor-pointer"
              onClick={() => setOpenSheet('reward')}
              disabled={disabled}
              aria-label="혜택/이벤트 메뉴 열기"
            >
              <IconBadge icon={Gift} size={52} radius={16} />
              <div>혜택/이벤트</div>
            </button>

            <button
              type="button"
              className="flex flex-col gap-2.5 w-15 items-center justify-center cursor-pointer"
              onClick={() => setOpenSheet('report')}
              disabled={disabled}
              aria-label="상담 리포트 메뉴 열기"
            >
              <IconBadge icon={FileSpreadsheet} size={52} radius={16} />
              <div>상담 리포트</div>
            </button>

            <button
              type="button"
              className="flex flex-col gap-2.5 w-15 items-center justify-center cursor-pointer"
              onClick={() => setOpenSheet('plan')}
              disabled={disabled}
              aria-label="요금제 메뉴 열기"
            >
              <IconBadge icon={CreditCard} size={52} radius={16} />
              <div>요금제</div>
            </button>

            <button
              type="button"
              className="flex flex-col gap-2.5 w-15 items-center justify-center cursor-pointer"
              onClick={() => setOpenSheet('mypage')}
              disabled={disabled}
              aria-label="마이페이지 열기"
            >
              <IconBadge icon={UserRound} size={52} radius={16} />
              <div>마이페이지</div>
            </button>
          </div>
        </div>
      </div>

      <slots.MyPageSheet
        {...sheetHandlers('mypage')}
        onRequestPlanRecommend={() => {
          if (disabled) return;
          setOpenSheet(null);
          onSend?.('요금제 추천받기');
        }}
      />

      <slots.PlanQuickSheet {...sheetHandlers('plan')} />

      <slots.RewardSheet
        game={game}
        {...sheetHandlers('reward')}
        onStartQuiz={onStartQuiz}
        onStartScratch={onStartScratch}
      />

      <slots.ReportSheet {...sheetHandlers('report')} />
    </div>
  );
}
