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
    <div className="px-4 pb-4 pt-2">
      <div className="font-semibold leading-[1.7] text-[14px] text-fg-secondary px-1 pb-2">
        자주 묻는 질문
      </div>
      <div className="flex flex-wrap gap-2">
        {replies.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => onReply(reply)}
            disabled={disabled}
            className="inline-flex items-center px-3 py-2 rounded-full text-caption text-fg-secondary bg-color-border hover:bg-border-strong disabled:bg-surface-pressed disabled:text-fg-disabled transition-colors cursor-pointer"
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}
