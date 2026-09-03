import { useMemo } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/shared';

interface QuickRepliesProps {
  replies?: string[];
  onReply: (reply: string) => void;
  disabled?: boolean;
  isLoggedIn?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

// 비회원에게 노출되지 않아야 할 회원 전용 퀵리플라이 (게임/출석체크는 로그인 필요)
const LOGIN_ONLY_REPLIES = [
  '온라인 가입',
  '요금제 가입하기',
  '게임 하기',
  '출석체크',
];
const GUEST_ONLY_REPLIES = ['회원 가입하기'];

export default function QuickReplies({
  replies,
  onReply,
  disabled = false,
  isLoggedIn = false,
  collapsed = false,
  onToggleCollapse,
}: QuickRepliesProps) {
  const processed = useMemo(() => {
    if (!replies || replies.length === 0) return [];

    if (isLoggedIn) {
      return replies.filter((reply) => !GUEST_ONLY_REPLIES.includes(reply));
    }

    return replies
      .filter((reply) => !LOGIN_ONLY_REPLIES.includes(reply))
      .map((reply) => (reply === '요금제 가입하기' ? '회원 가입하기' : reply));
  }, [replies, isLoggedIn]);

  if (processed.length === 0) return null;

  return (
    <div className=" border-t border-border flex flex-col">
      <div className="flex items-center justify-between py-3 px-4">
        <div className="font-semibold leading-[1.7] text-[14px] text-fg-secondary">
          자주 물어보는 질문
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? '퀵 리플라이 펼치기' : '퀵 리플라이 접기'}
          className="flex h-6 w-6 items-center bg-white justify-center rounded-full text-fg-tertiary transition-colors hover:bg-surface-page hover:text-fg-secondary"
        >
          {collapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          collapsed ? 'max-h-0 opacity-0' : 'max-h-[200px] opacity-100'
        }`}
      >
        <div className="flex flex-wrap gap-2 px-4 mb-3">
          {processed.map((reply) => (
            <Button
              key={reply}
              variant="chip"
              size="chip"
              onClick={() => onReply(reply)}
              disabled={disabled}
            >
              {reply}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
