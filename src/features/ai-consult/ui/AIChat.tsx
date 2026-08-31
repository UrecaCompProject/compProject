import type { ReactNode } from 'react';

import { RefreshCw } from 'lucide-react';

type AIChatVariant = 'default' | 'success' | 'error';

const AIChatBubbleVariants: Record<AIChatVariant, string> = {
  default: 'bg-surface-card',
  success: 'bg-semantic-success/10 text-semantic-success',
  error: 'bg-semantic-error/10 text-semantic-error',
};

interface AIChatProps {
  sentence: ReactNode;
  variant?: AIChatVariant;
  onRegenerate?: () => void;
  showRegenerate?: boolean;
}

export default function AIChat({
  sentence,
  variant = 'default',
  onRegenerate,
  showRegenerate = false,
}: AIChatProps) {
  return (
    <div className="flex gap-2">
      <div className="rounded-full w-7 h-7 bg-gray-300 shrink-0">
        <img src="/bot_profile.png" alt="AI 도우미 해리" />
      </div>
      <div className="flex flex-col gap-1 mt-2">
        <div
          className={`shadow-shadow rounded-2xl rounded-tl-sm px-4 py-3 max-w-[70%] whitespace-pre-line ${AIChatBubbleVariants[variant]}`}
          role={variant === 'error' ? 'alert' : undefined}
        >
          {sentence}
        </div>
        {showRegenerate && onRegenerate && variant === 'error' && (
          <button
            type="button"
            onClick={onRegenerate}
            className="flex items-center gap-1 text-caption text-fg-tertiary hover:text-brand-primary transition-colors w-fit"
            aria-label="응답 재생성"
          >
            <RefreshCw size={12} />
            재생성
          </button>
        )}
      </div>
    </div>
  );
}
