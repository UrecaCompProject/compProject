export { default as MultipleChoiceQuiz } from './ui/MultipleChoiceQuiz';
export { default as OxQuiz } from './ui/OxQuiz';
export { default as QuizResult } from './ui/QuizResult';
export { default as ChatQuizMessage } from './ui/ChatQuizMessage';

export { multipleChoiceQuestions } from './data/multipleChoiceQuestions';
export { oxQuestions } from './data/oxQuestions';

export { useChatQuiz } from './model/useChatQuiz';

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
