import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { UserRound, CreditCard, Gift, FileSpreadsheet } from 'lucide-react';

import type { QuizKind } from '@/features/chat-quiz';
import { ReportSheet } from '@/features/consult-report';
import { RewardSheet } from '@/features/reward';
import { MyPage, PlanPage } from '@/pages';
import { BottomSheet, IconBadge, useClickOutside } from '@/shared';

interface ActiveSheet {
  title: string;
  content: ReactNode;
  description?: string;
}

interface ChatMenuSheetProps {
  isMenuOpen: boolean;
  onMenuClose: () => void;
  onStartQuiz?: (quizType: QuizKind) => void;
}

// 메뉴 아이템(마이페이지, 요금제, 혜택/이벤트, 상담 리포트)과
// 각 메뉴에 대응하는 BottomSheet/RewardSheet/ReportSheet를 관리
export default function ChatMenuSheet({
  isMenuOpen,
  onMenuClose,
  onStartQuiz,
}: ChatMenuSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet | null>(null);

  const openSheet = (sheet: ActiveSheet) => {
    setActiveSheet(sheet);
    setIsSheetOpen(true);
  };

  useClickOutside(
    containerRef,
    isMenuOpen && !isSheetOpen && !rewardOpen && !reportOpen,
    onMenuClose,
  );

  return (
    <div className="relative" ref={containerRef}>
      {/* bottom sheet menu */}
      <div
        className={`
          overflow-hidden bg-white transition-[max-height] duration-400 ease-in
          ${isMenuOpen ? 'max-h-80 ease-out' : 'max-h-0 ease-in'}
        `}
      >
        <div className="w-full border-t border-border px-5 py-7 text-medium-12-130 text-fg-tertiary">
          <div className="flex justify-between items-center max-w-110 mx-auto">
            <div
              className="flex flex-col gap-2.5 w-15 items-center justify-center cursor-pointer"
              onClick={() =>
                openSheet({ title: '마이페이지', content: <MyPage /> })
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
              onClick={() => {
                onMenuClose();
                setRewardOpen(true);
              }}
            >
              <IconBadge icon={Gift} size={52} radius={16} />
              <div>혜택/이벤트</div>
            </div>

            <div
              className="flex flex-col gap-2.5 w-15 items-center justify-center cursor-pointer"
              onClick={() => {
                onMenuClose();
                setReportOpen(true);
              }}
            >
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
        description={activeSheet?.description ?? ''}
      >
        {activeSheet?.content}
      </BottomSheet>

      <RewardSheet
        open={rewardOpen}
        onOpenChange={setRewardOpen}
        onStartQuiz={onStartQuiz}
      />

      <ReportSheet open={reportOpen} onOpenChange={setReportOpen} />
    </div>
  );
}
