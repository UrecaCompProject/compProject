import answerOImage from '@/assets/images/answer-o.png';
import answerXImage from '@/assets/images/answer-x.png';

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
    <ul className="grid w-full max-w-[344px] grid-cols-2 gap-2">
      {options.map((option) => {
        const isO = option.id === 'o';
        const isSelected = option.id === selectedId;
        const imageSource = isO ? answerOImage : answerXImage;

        return (
          <li key={option.id}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(option.id)}
              className={`relative h-[132px] w-full overflow-hidden rounded-[20px] border-2 transition-colors ${
                isO ? 'bg-brand-soft' : 'bg-[#ffeef4]'
              } ${
                isSelected ? 'border-brand-promo-primary' : 'border-transparent'
              }`}
            >
              <span className="absolute left-0 right-0 top-4 z-10 text-[24px] font-semibold text-fg-primary">
                {option.label}
              </span>

              <img
                src={imageSource}
                alt=""
                className="absolute bottom-0 left-1/2 h-[92px] w-[92px] -translate-x-1/2 object-contain"
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
