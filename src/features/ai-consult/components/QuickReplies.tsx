import { Button } from '@/features/shared';

interface QuickRepliesProps {
  replies?: string[];
  onReply: (reply: string) => void;
  disabled?: boolean;
}

export default function QuickReplies({
  replies,
  onReply,
  disabled = false,
}: QuickRepliesProps) {
  if (!replies || replies.length === 0) return null;

  return (
    <div>
      <div className="font-semibold leading-[1.7] text-[14px] text-fg-secondary px-5 pt-4 pb-2">
        자주 물어보는 질문
      </div>
      <div className="flex flex-wrap gap-2 px-4 pb-4">
        {replies.map((reply) => (
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
