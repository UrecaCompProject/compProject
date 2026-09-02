import { AIChat } from '@/features/ai-consult';
import { MultipleChoiceQuiz, OxQuiz, QuizResult } from '@/features/chat-quiz';

import type { QuizQuestionMessage, QuizResultMessage } from '../type';

type ChatQuizMessageProps = {
  message: QuizQuestionMessage | QuizResultMessage;
  onOxAnswer: (messageId: number, answer: 'o' | 'x') => void;
  onMultipleChoiceSelect: (messageId: number, optionId: string) => void;
  onMultipleChoiceConfirm: (message: QuizQuestionMessage) => void;
};
const MULTIPLE_CHOICE_BUBBLE_CLASSNAME = '!max-w-[92%]';

export default function ChatQuizMessage({
  message,
  onOxAnswer,
  onMultipleChoiceSelect,
  onMultipleChoiceConfirm,
}: ChatQuizMessageProps) {
  if (message.type === 'quiz-result') {
    return (
      <AIChat
        sentence={
          <QuizResult
            isCorrect={message.isCorrect}
            explanation={message.explanation}
          />
        }
      />
    );
  }

  if (message.quizType === 'ox') {
    return (
      <AIChat
        sentence={
          <OxQuiz
            question={message.question}
            selectedAnswer={message.selectedAnswer}
            disabled={message.disabled}
            onSelect={(answer) => onOxAnswer(message.id, answer)}
          />
        }
      />
    );
  }

  return (
    <AIChat
      className={MULTIPLE_CHOICE_BUBBLE_CLASSNAME}
      sentence={
        <MultipleChoiceQuiz
          question={message.question}
          selectedId={message.selectedAnswer}
          disabled={message.disabled}
          onSelect={(optionId) => onMultipleChoiceSelect(message.id, optionId)}
          onConfirm={() => onMultipleChoiceConfirm(message)}
        />
      }
    />
  );
}
