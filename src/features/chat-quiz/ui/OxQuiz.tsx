import OxChoices from './OxChoices';
import Question from './Question';

import type { OxQuestion, QuizOption } from '../type';

const OX_OPTIONS: QuizOption[] = [
  { id: 'o', label: '그렇다' },
  { id: 'x', label: '아니다' },
];

type OxQuizProps = {
  question: OxQuestion;
  number: number;
  selectedAnswer: 'o' | 'x' | null;
  disabled?: boolean;
  onSelect: (answer: 'o' | 'x') => void;
};

export default function OxQuiz({
  question,
  number,
  selectedAnswer,
  disabled = false,
  onSelect,
}: OxQuizProps) {
  return (
    <div className="flex w-full flex-col gap-5">
      <Question number={number} question={question.question} />
      <OxChoices
        options={OX_OPTIONS}
        selectedId={selectedAnswer}
        onSelect={(optionId) => {
          if (!disabled && (optionId === 'o' || optionId === 'x')) {
            onSelect(optionId);
          }
        }}
      />
    </div>
  );
}
