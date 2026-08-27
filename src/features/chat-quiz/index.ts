export { default as MultipleChoiceQuiz } from './components/MultipleChoiceQuiz';
export { default as OxQuiz } from './components/OxQuiz';
export { default as QuizResult } from './components/QuizResult';

export { multipleChoiceQuestions } from './data/multipleChoiceQuestions';
export { oxQuestions } from './data/oxQuestions';

export type {
  QuizKind,
  QuizQuestion,
  MultipleChoiceQuestion,
  OxQuestion,
  QuizOption,
  QuizResult as QuizResultData,
} from './type';
