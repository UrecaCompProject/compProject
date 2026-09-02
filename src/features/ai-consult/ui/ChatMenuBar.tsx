import type { ComponentType } from 'react';
import { useRef, useState } from 'react';

import { UserRound, CreditCard, Gift, FileSpreadsheet } from 'lucide-react';

import { IconBadge, useClickOutside } from '@/shared';
import type { QuizKind } from '@/shared/types/quiz';

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
  onStartQuiz?: (quizType: QuizKind) => void;
  onStartScratch?: (reward?: number) => void;
  onSend?: (text: string) => void;
  slots: ChatMenuBarSlots;
}

// 채팅 입력창 위 메뉴 아이콘 바(마이페이지, 요금제, 혜택/이벤트, 상담 리포트)와
// 각 메뉴가 여는 BottomSheet들을 관리
export default function ChatMenuBar({
  isMenuOpen,
  onMenuClose,
  onStartQuiz,
  onStartScratch,
  onSend,
  slots,
}: ChatMenuBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [myPageOpen, setMyPageOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useClickOutside(
    containerRef,
    isMenuOpen && !myPageOpen && !planOpen && !rewardOpen && !reportOpen,
    onMenuClose,
  );

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
              onClick={() => setMyPageOpen(true)}
              aria-label="마이페이지 열기"
            >
              <IconBadge icon={UserRound} size={52} radius={16} />
              <div>마이페이지</div>
            </button>

            <button
              type="button"
              className="flex flex-col gap-2.5 w-15 items-center justify-center cursor-pointer"
              onClick={() => setPlanOpen(true)}
              aria-label="요금제 메뉴 열기"
            >
              <IconBadge icon={CreditCard} size={52} radius={16} />
              <div>요금제</div>
            </button>

            <button
              type="button"
              className="flex flex-col gap-2.5 w-15 items-center justify-center cursor-pointer"
              onClick={() => setRewardOpen(true)}
              aria-label="혜택/이벤트 메뉴 열기"
            >
              <IconBadge icon={Gift} size={52} radius={16} />
              <div>혜택/이벤트</div>
            </button>

            <button
              type="button"
              className="flex flex-col gap-2.5 w-15 items-center justify-center cursor-pointer"
              onClick={() => setReportOpen(true)}
              aria-label="상담 리포트 메뉴 열기"
            >
              <IconBadge icon={FileSpreadsheet} size={52} radius={16} />
              <div>상담 리포트</div>
            </button>
          </div>
        </div>
      </div>

      <slots.MyPageSheet
        open={myPageOpen}
        onOpenChange={setMyPageOpen}
        onRequestPlanRecommend={() => {
          setMyPageOpen(false);
          onSend?.('요금제 추천받기');
        }}
      />

      <slots.PlanQuickSheet open={planOpen} onOpenChange={setPlanOpen} />

      <slots.RewardSheet
        open={rewardOpen}
        onOpenChange={setRewardOpen}
        onStartQuiz={onStartQuiz}
        onStartScratch={onStartScratch}
      />

      <slots.ReportSheet open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  );
}
