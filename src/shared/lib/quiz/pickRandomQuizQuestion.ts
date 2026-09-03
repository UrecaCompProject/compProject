import { multipleChoiceQuestions } from '@/shared/data/quiz/multipleChoiceQuestions';
import { oxQuestions } from '@/shared/data/quiz/oxQuestions';
import type {
  MultipleChoiceQuestion,
  OxQuestion,
  QuizKind,
} from '@/shared/types/quiz';

function pickRandomItem<T>(items: readonly T[]): T {
  if (items.length === 0) {
    throw new Error('퀴즈 문제가 없습니다.');
  }

  return items[Math.floor(Math.random() * items.length)];
}

export function pickRandomQuizQuestion(quizType: 'ox'): OxQuestion;
export function pickRandomQuizQuestion(
  quizType: 'multiple-choice',
): MultipleChoiceQuestion;
export function pickRandomQuizQuestion(quizType: QuizKind) {
  return quizType === 'ox'
    ? pickRandomItem(oxQuestions)
    : pickRandomItem(multipleChoiceQuestions);
}
