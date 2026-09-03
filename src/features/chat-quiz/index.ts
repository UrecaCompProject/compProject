export { default as MultipleChoiceQuiz } from './ui/MultipleChoiceQuiz';
export { default as OxQuiz } from './ui/OxQuiz';
export { default as QuizResult } from './ui/QuizResult';
export { default as ChatQuizMessage } from './ui/ChatQuizMessage';

export { multipleChoiceQuestions } from '@/shared/data/quiz/multipleChoiceQuestions';
export { oxQuestions } from '@/shared/data/quiz/oxQuestions';

export type {
  QuizKind,
  QuizQuestion,
  MultipleChoiceQuestion,
  OxQuestion,
  QuizOption,
  QuizResult as QuizResultData,
  QuizQuestionMessage,
  QuizResultMessage,
} from './type';
