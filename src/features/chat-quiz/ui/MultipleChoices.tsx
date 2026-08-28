import type { QuizOption } from '../type';

type MultipleChoicesProps = {
  options: QuizOption[];
  selectedId: string | null;
  onSelect: (optionId: string) => void;
};

export default function MultipleChoices({
  options,
  selectedId,
  onSelect,
}: MultipleChoicesProps) {
  return (
    <ul className="flex w-full flex-col items-center gap-3">
      {options.map((option) => {
        const isSelected = option.id === selectedId;

        return (
          <li key={option.id} className="w-full max-w-[344px]">
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(option.id)}
              className={`h-[53px] w-full rounded-2xl border-2 px-4 text-left text-[16px] transition-colors ${
                isSelected
                  ? 'border-brand-promo-primary bg-white text-fg-primary'
                  : 'border-transparent bg-surface-pressed text-fg-primary'
              }`}
            >
              {option.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
