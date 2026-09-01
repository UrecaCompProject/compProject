import ConfirmButton from './ConfirmButton';
import MultipleChoices from './MultipleChoices';
import Question from './Question';

import type { MultipleChoiceQuestion } from '../type';

type MultipleChoiceQuizProps = {
  question: MultipleChoiceQuestion;
  selectedId: string | null;
  disabled?: boolean;
  onSelect: (optionId: string) => void;
  onConfirm: () => void;
};

export default function MultipleChoiceQuiz({
  question,
  selectedId,
  disabled = false,
  onSelect,
  onConfirm,
}: MultipleChoiceQuizProps) {
  return (
    <div className="flex w-full flex-col gap-5">
      <Question question={question.question} />
      <MultipleChoices
        options={question.options}
        selectedId={selectedId}
        onSelect={(optionId) => {
          if (!disabled) onSelect(optionId);
        }}
      />
      {!disabled && (
        <ConfirmButton disabled={selectedId === null} onClick={onConfirm} />
      )}
    </div>
  );
}
