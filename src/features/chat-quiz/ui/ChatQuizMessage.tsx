import { AIChat } from '@/features/ai-consult';
import { MultipleChoiceQuiz, OxQuiz, QuizResult } from '@/features/chat-quiz';

import type { QuizQuestionMessage, QuizResultMessage } from '../type';

type ChatQuizMessageProps = {
  message: QuizQuestionMessage | QuizResultMessage;
  onOxAnswer: (messageId: number, answer: 'o' | 'x') => void;
  onMultipleChoiceSelect: (messageId: number, optionId: string) => void;
  onMultipleChoiceConfirm: (message: QuizQuestionMessage) => void;
  onNext: () => void;
};

export default function ChatQuizMessage({
  message,
  onOxAnswer,
  onMultipleChoiceSelect,
  onMultipleChoiceConfirm,
  onNext,
}: ChatQuizMessageProps) {
  if (message.type === 'quiz-result') {
    return (
      <AIChat
        sentence={
          <QuizResult
            isCorrect={message.isCorrect}
            explanation={message.explanation}
            actionLabel={message.isLastQuestion ? '결과 보기' : '다음 문제'}
            onNext={onNext}
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
            number={message.questionNumber}
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
      sentence={
        <MultipleChoiceQuiz
          question={message.question}
          number={message.questionNumber}
          selectedId={message.selectedAnswer}
          disabled={message.disabled}
          onSelect={(optionId) => onMultipleChoiceSelect(message.id, optionId)}
          onConfirm={() => onMultipleChoiceConfirm(message)}
        />
      }
    />
  );
}
