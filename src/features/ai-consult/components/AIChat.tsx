import type { ReactNode } from 'react';

type AIChatVariant = 'default' | 'success' | 'error';

const AIChatBubbleVariants: Record<AIChatVariant, string> = {
  default: 'bg-surface-card',
  success: 'bg-semantic-success/10 text-semantic-success',
  error: 'bg-semantic-error/10 text-semantic-error',
};

interface AIChatProps {
  sentence: ReactNode;
  variant?: AIChatVariant;
}

export default function AIChat({ sentence, variant = 'default' }: AIChatProps) {
  return (
    <div className="flex gap-2">
      <div className="rounded-full w-7 h-7 bg-gray-300">
        <img src="bot_profile.png" alt="bot-profile" />
      </div>
      <div
        className={`shadow-shadow rounded-2xl rounded-tl-sm px-4 py-3 mt-2 max-w-[70%] whitespace-pre-line ${AIChatBubbleVariants[variant]}`}
      >
        {sentence}
      </div>
    </div>
  );
}
