import { Button } from '@/shared';
import answerOImage from '@/shared/assets/images/answer-o.png';
import answerXImage from '@/shared/assets/images/answer-x.png';

import type { QuizOption } from '../type';

type OxChoicesProps = {
  options: QuizOption[];
  selectedId: string | null;
  onSelect: (optionId: string) => void;
};

export default function OxChoices({
  options,
  selectedId,
  onSelect,
}: OxChoicesProps) {
  return (
    <ul className="grid w-full grid-cols-2 gap-2">
      {options.map((option) => {
        const isO = option.id === 'o';
        const isSelected = option.id === selectedId;
        const imageSource = isO ? answerOImage : answerXImage;

        return (
          <li key={option.id}>
            <Button
              type="button"
              variant="chip"
              size="md"
              active={isSelected}
              onClick={() => onSelect(option.id)}
              className={`relative border-2 h-[150px] w-full overflow-hidden rounded-[8px] px-0 py-0 ${
                isO ? '!bg-brand-soft' : '!bg-accent-soft hover:border-red-400!'
              }`}
            >
              <span
                className={`absolute left-0 right-0 top-6 z-10 text-[24px] font-semibold ${isO ? 'text-brand-promo-primary' : 'text-red-400'}`}
              >
                {option.label}
              </span>

              <img
                src={imageSource}
                alt=""
                className="absolute -translate-x-1/2 -bottom-[9px] left-1/2 h-[92px] w-[92px] object-contain"
              />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
