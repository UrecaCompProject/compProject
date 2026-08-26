import { useState } from 'react';

import AIChat from '@/features/ai-consult/components/AIChat';
import MyChat from '@/features/ai-consult/components/MyChat';

import { multipleChoiceQuestions } from '../data/multipleChoiceQuestions';

import MultipleChoiceQuiz from './MultipleChoiceQuiz';
import QuizResult from './QuizResult';

import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'chat-quiz/MultipleChoiceQuiz',
  component: MultipleChoiceQuiz,
  args: {
    question: multipleChoiceQuestions[0],
    number: 1,
    selectedId: null,
    onSelect: () => undefined,
    onConfirm: () => undefined,
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
} satisfies Meta<typeof MultipleChoiceQuiz>;

export default meta;
type Story = StoryObj<typeof meta>;

function MultipleChoiceConversation() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const question = multipleChoiceQuestions[0];
  const selectedOption = question.options.find(
    (option) => option.id === selectedId,
  );
  const isCorrect = selectedId === question.correctOptionId;

  return (
    <div className="flex flex-col gap-3">
      <MyChat sentence="통신·보안 퀴즈 할래" />
      <AIChat sentence="네, 통신·보안 퀴즈를 진행하겠습니다." />
      <AIChat
        sentence={
          <MultipleChoiceQuiz
            question={question}
            number={1}
            selectedId={selectedId}
            disabled={confirmed}
            onSelect={setSelectedId}
            onConfirm={() => setConfirmed(true)}
          />
        }
      />
      {confirmed && selectedOption && (
        <>
          <MyChat sentence={selectedOption.label} />
          <AIChat
            sentence={
              <QuizResult
                isCorrect={isCorrect}
                explanation={question.explanation}
                actionLabel="다음 문제"
                onNext={() => undefined}
              />
            }
          />
        </>
      )}
    </div>
  );
}

export const InChat: Story = {
  render: () => <MultipleChoiceConversation />,
};
