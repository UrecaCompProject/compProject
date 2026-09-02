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
  /** 폼처럼 내부 요소가 w-full로 채워지는 콘텐츠는 true로 — 말풍선이
   * 내용 크기로 눌리지 않고 max-w까지 항상 꽉 차게 늘어난다. */
  fullWidth?: boolean;
}

export default function AIChat({
  sentence,
  variant = 'default',
  onRegenerate,
  showRegenerate = false,
  fullWidth = false,
}: AIChatProps) {
  return (
    <div className="flex gap-2 px-4">
      <div className="rounded-full w-7 h-7 bg-gray-300 shrink-0">
        <img src="/bot_profile.png" alt="AI 도우미 해리" />
      </div>
      <div className="flex items-end gap-2 mt-2 w-full">
        <div
          className={`text-[15px] leading-[150%] shadow-shadow rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[82%] whitespace-pre-line break-keep ${fullWidth ? 'w-full' : 'w-fit'} ${AIChatBubbleVariants[variant]}`}
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
            <RefreshCw size={16} strokeWidth={2.5} className="text-[#c3cfeb]" />
            {/* 재생성 */}
          </button>
        )}
      </div>
    </div>
  );
}
