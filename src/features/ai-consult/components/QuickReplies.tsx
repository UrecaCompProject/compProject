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
    <div className="flex  flex-wrap gap-2 px-4 py-3 bg-surface-card/50 rounded-2xl mx-4">
      {replies.map((reply) => (
        <button
          key={reply}
          type="button"
          onClick={() => onReply(reply)}
          disabled={disabled}
          className="rounded-full border-2 shadow-[1px_1px_6px_2px_rgba(0,0,0,0.05)] border-border bg-surface-card px-4 py-2 text-caption text-fg-secondary hover:bg-surface-pressed hover:text-brand-primary hover:border-border-brand "
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
