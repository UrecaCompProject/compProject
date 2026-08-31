import { useMemo } from 'react';

import { ChevronDown, ChevronUp } from 'lucide-react';

import { Button } from '@/shared';
import quickReplyToggleButton from '@/shared/assets/images/quick-reply-toggle-button.svg';

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
    <div>
      <div className="mx-4 relative border-t border-border pt-3">
        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-[101%] justify-center px-1">
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? '퀵 리플라이 펼치기' : '퀵 리플라이 접기'}
            className="relative flex h-5 w-[120px] items-center justify-center transition-opacity"
          >
            <img
              src={quickReplyToggleButton}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full select-none"
            />
            {collapsed ? (
              <ChevronUp size={16} className="relative z-10 text-fg-tertiary" />
            ) : (
              <ChevronDown
                size={16}
                className="relative z-10 text-fg-tertiary"
              />
            )}
          </button>
        </div>
        <div className="px-1 pb-2">
          <div className="font-semibold leading-[1.7] text-[14px] text-fg-secondary">
            자주 물어보는 질문
          </div>
        </div>
      </div>
      <div
        className={`grid transition-all duration-300 ease-out ${
          collapsed
            ? 'grid-rows-[0fr] opacity-0'
            : 'grid-rows-[1fr] opacity-100'
        }`}
      >
        <div className="overflow-hidden">
          <div className="flex flex-wrap gap-2 px-4 pb-4">
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
    </div>
  );
}
