import { Pencil } from 'lucide-react';

import { Tooltip } from '@/shared';

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
      <div className="flex items-end gap-1 max-w-[82%]">
        {showEdit && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="group relative -m-1 flex shrink-0 cursor-pointer items-center rounded-md p-1 text-fg-tertiary/70 transition-colors hover:bg-surface-pressed hover:text-brand-primary"
            aria-label="메시지 수정"
          >
            <Pencil size={14} strokeWidth={2.5} />
            <Tooltip>편집</Tooltip>
          </button>
        )}
        <div className="text-[15px] leading-[150%] min-w-0 rounded-2xl rounded-tr-sm px-4 py-2.5 bg-chat-mine text-fg-primary shadow-chat-mine whitespace-pre-line break-keep">
          {sentence}
        </div>
      </div>
    </div>
  );
}
