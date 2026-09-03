import { Button } from '@/shared';

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
    <div className="flex w-full flex-col gap-2 py-1.5">
      <Question question={question.question} />
      <MultipleChoices
        options={question.options}
        selectedId={selectedId}
        onSelect={(optionId) => {
          if (!disabled) onSelect(optionId);
        }}
      />
      {!disabled && (
        <Button
          variant="primary"
          size="lg"
          disabled={selectedId === null}
          onClick={onConfirm}
          className="w-full mt-2"
        >
          선택했어요
        </Button>
        // <ConfirmButton disabled={selectedId === null} onClick={onConfirm} />
      )}
    </div>
  );
}
