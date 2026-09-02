import { Button } from '@/shared';

import type { QuizOption } from '../type';

type MultipleChoicesProps = {
  options: QuizOption[];
  selectedId: string | null;
  onSelect: (optionId: string) => void;
};

function ChoiceMark({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-border-brand text-caption text-white group-aria-pressed:bg-brand-promo-primary">
      {children}
    </span>
  );
}

export default function MultipleChoices({
  options,
  selectedId,
  onSelect,
}: MultipleChoicesProps) {
  const optionMarks = ['A', 'B', 'C', 'D'];

  return (
    <ul className="flex w-full flex-col items-center gap-2">
      {options.map((option, index) => {
        const isSelected = option.id === selectedId;

        return (
          <li key={option.id} className="w-full min-w-0 max-w-[344px]">
            <Button
              type="button"
              variant="chip"
              size="lg"
              active={isSelected}
              onClick={() => onSelect(option.id)}
              className="group min-h-[58px] w-full max-w-full justify-start gap-3 text-left"
            >
              <ChoiceMark>{optionMarks[index] ?? index + 1}</ChoiceMark>
              <span className="min-w-0 flex-1 truncate text-regular-12-130">
                {option.label}
              </span>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
