export type QuizKind = 'multiple-choice' | 'ox';

export type QuizOption = {
  id: string;
  label: string;
};

export type MultipleChoiceQuestion = {
  id: string;
  type: 'multiple-choice';
  category: 'telecom' | 'security';
  question: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
};

export type OxQuestion = {
  id: string;
  type: 'ox';
  question: string;
  correctAnswer: 'o' | 'x';
  explanation: string;
};

export type QuizQuestion = MultipleChoiceQuestion | OxQuestion;

// 채팅 메시지로 렌더링되는 퀴즈 질문 메시지
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

// 채팅 메시지로 렌더링되는 퀴즈 결과 메시지
export type QuizResultMessage = {
  id: number;
  type: 'quiz-result';
  quizType: QuizKind;
  isCorrect: boolean;
  explanation: string;
  isLastQuestion: boolean;
};

// 퀴즈 전체 결과(통계용)
export type QuizResult = {
  totalCount: number;
  correctCount: number;
};
