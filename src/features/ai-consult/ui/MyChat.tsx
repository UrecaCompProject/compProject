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
    <>
      <div className="w-fit self-end rounded-2xl rounded-tr-sm px-4 py-3 bg-brand-promo-primary min-w-[240px] max-w-[80%] text-surface-card whitespace-pre-line">
        {sentence}
      </div>
      {showEdit && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-caption text-fg-tertiary hover:text-brand-primary transition-colors self-end mt-1"
          aria-label="메시지 수정"
        >
          <Pencil size={12} />
          수정
        </button>
      )}
    </>
  );
}
