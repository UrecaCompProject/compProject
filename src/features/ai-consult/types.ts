import type {
  MultipleChoiceQuestion,
  OxQuestion,
  QuizKind,
} from '@/features/chat-quiz';
import type {
  CompareResult,
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
  addressDetail: string;
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
      compareResult?: CompareResult;
      // 현재 요금제가 미설정 상태에서 비교를 요청하면 드랍다운 셀렉터를 렌더링
      planSelector?: boolean;
      // planSelector 렌더링 모드: 'current' = 현재 요금제 선택, 'target' = 비교 대상 선택
      planSelectorMode?: 'current' | 'target';
    }
  | { id: number; type: 'user'; sentence: string }
  | { id: number; type: 'signup' }
  | QuizQuestionMessage
  | QuizResultMessage;
