export type QuizKind = 'multiple-choice' | 'ox';

export type QuizOption = {
  id: string;
  label: string;
};

export type QuizQuestion = MultipleChoiceQuestion | OxQuestion;

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

export type QuizResult = {
  totalCount: number;
  correctCount: number;
};
