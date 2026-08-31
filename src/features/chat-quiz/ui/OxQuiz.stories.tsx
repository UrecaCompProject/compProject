import { useState } from 'react';

import AIChat from '@/features/ai-consult/ui/AIChat';
import MyChat from '@/features/ai-consult/ui/MyChat';

import { oxQuestions } from '../data/oxQuestions';

import OxQuiz from './OxQuiz';
import QuizResult from './QuizResult';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'chat-quiz/OxQuiz',
  component: OxQuiz,
  args: {
    question: oxQuestions[0],
    number: 1,
    selectedAnswer: null,
    onSelect: () => undefined,
  },
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'surface-page' },
  },
  decorators: [
    (Story) => (
      <div className="w-[390px] bg-surface-page p-4">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OxQuiz>;

export default meta;
type Story = StoryObj<typeof meta>;

function OxQuizConversation() {
  const [selectedAnswer, setSelectedAnswer] = useState<'o' | 'x' | null>(null);
  const question = oxQuestions[0];
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className="flex flex-col gap-3">
      <MyChat sentence="보안 OX 퀴즈 할래" />
      <AIChat sentence="네, 보안 OX 퀴즈를 진행하겠습니다." />
      <AIChat
        sentence={
          <OxQuiz
            question={question}
            number={1}
            selectedAnswer={selectedAnswer}
            disabled={selectedAnswer !== null}
            onSelect={setSelectedAnswer}
          />
        }
      />
      {selectedAnswer && (
        <>
          <MyChat sentence={selectedAnswer === 'o' ? 'O 그렇다' : 'X 아니다'} />
          <AIChat
            sentence={
              <QuizResult
                isCorrect={isCorrect}
                explanation={question.explanation}
              />
            }
          />
        </>
      )}
    </div>
  );
}

export const InChat: Story = {
  render: () => <OxQuizConversation />,
};
