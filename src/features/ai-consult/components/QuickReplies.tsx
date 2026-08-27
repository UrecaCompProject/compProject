import { useMemo } from 'react';

import { Button } from '@/features/shared';

interface QuickRepliesProps {
  replies?: string[];
  onReply: (reply: string) => void;
  disabled?: boolean;
  isLoggedIn?: boolean;
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
      <div className="font-semibold leading-[1.7] text-[14px] text-fg-secondary px-5 pt-4 pb-2">
        자주 물어보는 질문
      </div>
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
  );
}
