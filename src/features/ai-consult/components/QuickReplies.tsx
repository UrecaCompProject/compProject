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
    <div className="flex w-full flex-wrap gap-2 px-4 py-3">
      {replies.map((reply) => (
        <button
          key={reply}
          type="button"
          onClick={() => onReply(reply)}
          disabled={disabled}
          className="rounded-full border-2 border-border bg-surface-card px-4 py-2 text-caption text-fg-secondary hover:bg-surface-pressed hover:text-brand-primary hover:border-border-brand"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
