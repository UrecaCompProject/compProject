import { Pencil } from 'lucide-react';

interface MyChatProps {
  sentence: string;
  onEdit?: () => void;
  showEdit?: boolean;
}

export default function MyChat({
  sentence,
  onEdit,
  showEdit = false,
}: MyChatProps) {
  return (
    <div className="flex justify-end px-4 w-full">
      <div className="flex items-end gap-1 max-w-[80%]">
        {showEdit && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center text-fg-tertiary hover:text-brand-primary transition-colors shrink-0"
            aria-label="메시지 수정"
          >
            <Pencil size={14} strokeWidth={2.5} className="text-[#c3cfeb]" />
          </button>
        )}
        <div className="min-w-0 rounded-2xl rounded-tr-sm px-4 py-3 bg-brand-promo-primary text-surface-card whitespace-pre-line break-keep">
          {sentence}
        </div>
      </div>
    </div>
  );
}
