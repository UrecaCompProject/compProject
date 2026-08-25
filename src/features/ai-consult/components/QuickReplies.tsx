import { useMemo } from 'react';

import { Button } from '@/features/shared';

interface QuickRepliesProps {
  replies?: string[];
  onReply: (reply: string) => void;
  disabled?: boolean;
  isLoggedIn?: boolean;
}

const LOGIN_ONLY_REPLIES = ['온라인 가입', '요금제 가입하기'];
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
    <div className="px-4 pb-4 pt-2">
      <div className="font-semibold leading-[1.7] text-[14px] text-fg-secondary px-1 pb-2">
        자주 묻는 질문
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
