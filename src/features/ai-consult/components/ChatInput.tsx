import { Input } from '@/features/shared';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled = false,
}: ChatInputProps) {
  const handleSend = () => {
    onSend(value);
  };

  return (
    <div className="flex items-center gap-2 p-4">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSend();
        }}
        placeholder="AI에게 질문해보세요"
        disabled={disabled}
        className="flex-1 bg-surface-card"
      />
      <button
        type="button"
        className="p-3 inline-flex box-border items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed rounded-full bg-brand-promo-primary text-surface-card hover:bg-brand-promo-secondary disabled:bg-brand-light"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
      >
        <img src="/arrow-up.svg" alt="arrow-up" />
      </button>
    </div>
  );
}
