import type {
  MultipleChoiceQuestion,
  OxQuestion,
  QuizKind,
} from '@/features/chat-quiz';
import type {
  ConsultForm,
  RecommendedPlan,
  ReportOutput,
} from '@/lib/aiConsult';

export type MessageType =
  'ai' | 'user' | 'signup' | 'quiz-question' | 'quiz-result';

export interface SubscriptionForm {
  type: 'new' | 'portability' | 'device' | 'change';
  name: string;
  birth: string;
  phone: string;
  address: string;
  simType: 'usim' | 'esim' | '';
  agreedPrivacy: boolean;
  agreedService: boolean;
  agreedMarketing: boolean;
}

export type QuizQuestionMessage =
  | {
      id: number;
      type: 'quiz-question';
      quizType: 'ox';
      question: OxQuestion;
      questionNumber: number;
      selectedAnswer: 'o' | 'x' | null;
      disabled: boolean;
    }
  | {
      id: number;
      type: 'quiz-question';
      quizType: 'multiple-choice';
      question: MultipleChoiceQuestion;
      questionNumber: number;
      selectedAnswer: string | null;
      disabled: boolean;
    };

export type QuizResultMessage = {
  id: number;
  type: 'quiz-result';
  quizType: QuizKind;
  isCorrect: boolean;
  explanation: string;
  isLastQuestion: boolean;
};

export type ChatMessage =
  | {
      id: number;
      type: 'ai';
      sentence: string;
      quickReplies?: string[];
      form?: ConsultForm;
      recommendations?: RecommendedPlan[];
      report?: ReportOutput;
    }
  | { id: number; type: 'user'; sentence: string }
  | { id: number; type: 'signup' }
  | QuizQuestionMessage
  | QuizResultMessage;
